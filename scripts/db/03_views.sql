-- Create analytics schema with materialized views for top rated actors and crew
-- Run this against your Neon database to set up the views

-- Create the analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- ============================================================================
-- MATERIALIZED VIEW: analytics.top_rated_actors (LIMIT 1000)
-- ============================================================================
CREATE MATERIALIZED VIEW analytics.top_rated_actors AS
WITH global_stats AS (
    SELECT 
        AVG(my_rating) as global_avg,
        5.0 as min_project_threshold
    FROM (
        SELECT my_rating FROM movies WHERE my_rating IS NOT NULL
        UNION ALL
        SELECT my_rating FROM shows WHERE my_rating IS NOT NULL
    ) all_media
),
max_collection_stats AS (
    SELECT 
        inner_stats.person_tmdb_id,
        MAX(count_per_collection) as max_movies_in_single_collection
    FROM (
        SELECT 
            mc.person_tmdb_id,
            m.collection_id,
            COUNT(*)::int as count_per_collection
        FROM movie_cast mc
        JOIN movies m ON m.tmdb_id = mc.movie_tmdb_id
        JOIN watch_history wh ON wh.tmdb_id = m.tmdb_id AND wh.media_type = 'movie'
        WHERE m.my_rating IS NOT NULL AND m.collection_id IS NOT NULL
        GROUP BY mc.person_tmdb_id, m.collection_id
    ) inner_stats
    GROUP BY inner_stats.person_tmdb_id
),
actor_movie_stats AS (
    SELECT 
        mc.person_tmdb_id,
        COUNT(DISTINCT m.tmdb_id)::int as movie_count,
        SUM(m.my_rating) as pure_movie_rating_sum,
        SUM(m.my_rating * CASE 
            WHEN mc.role = 'lead' THEN 1.0 
            WHEN mc.role = 'supporting' THEN 0.69 
            ELSE 0.2
        END) as weighted_movie_rating_sum,
        SUM(CASE 
            WHEN mc.role = 'lead' THEN 1.0 
            WHEN mc.role = 'supporting' THEN 0.69 
            ELSE 0.2 
        END) as movie_weight_denominator_raw
    FROM movie_cast mc
    JOIN movies m ON m.tmdb_id = mc.movie_tmdb_id
    JOIN watch_history wh ON wh.tmdb_id = m.tmdb_id AND wh.media_type = 'movie'
    WHERE m.my_rating IS NOT NULL
    GROUP BY mc.person_tmdb_id
),
watched_shows AS (
    SELECT 
        e.show_tmdb_id,
        COUNT(*)::int as watched_eps_count
    FROM episodes e
    JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
    GROUP BY e.show_tmdb_id
),
actor_show_stats AS (
    SELECT 
        sc.person_tmdb_id,
        COUNT(DISTINCT s.tmdb_id)::int as show_count,
        SUM(s.my_rating) as pure_show_rating_sum,
        SUM(
            LEAST(
                (1.0 + SQRT(LEAST(COALESCE(sc.episode_count, 1), ws.watched_eps_count)::float)) * 
                LEAST(COALESCE(sc.episode_count, 1)::float / ws.watched_eps_count::float, 1.0),
                3.0
            )
        )::float as show_project_weight,
        SUM(LEAST(COALESCE(sc.episode_count, 1), ws.watched_eps_count))::int as total_episodes,
        SUM(
            s.my_rating * 
            LEAST(
                (1.0 + SQRT(LEAST(COALESCE(sc.episode_count, 1), ws.watched_eps_count)::float)) * 
                LEAST(COALESCE(sc.episode_count, 1)::float / ws.watched_eps_count::float, 1.0),
                3.0
            )
        ) as weighted_show_rating_sum
    FROM show_cast sc
    JOIN shows s ON s.tmdb_id = sc.show_tmdb_id
    JOIN watched_shows ws ON ws.show_tmdb_id = s.tmdb_id
    WHERE s.my_rating IS NOT NULL
    GROUP BY sc.person_tmdb_id
),
combined_metrics AS (
    SELECT 
        p.tmdb_id,
        p.name,
        p.profile_path,
        COALESCE(ms.movie_count, 0) as movie_count,
        COALESCE(as_stats.show_count, 0) as show_count,
        COALESCE(as_stats.total_episodes, 0) as episode_count,
        COALESCE(
            1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6,
            1.0
        ) as concentration_multiplier,
        CASE 
            WHEN (COALESCE(ms.movie_count, 0) + COALESCE(as_stats.show_count, 0)) > 0 THEN
                (COALESCE(ms.pure_movie_rating_sum, 0)::float + COALESCE(as_stats.pure_show_rating_sum, 0)::float) / 
                (COALESCE(ms.movie_count, 0) + COALESCE(as_stats.show_count, 0))::float
            ELSE 0
        END as pure_average_rating,
        (
            COALESCE(ms.movie_count, 0)::float * 
            COALESCE(
                1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6,
                1.0
            ) +
            COALESCE(as_stats.show_project_weight, 0)::float * 0.3
        ) as movie_equivalents,
        (
            COALESCE(ms.movie_weight_denominator_raw, 0)::float * 
            COALESCE(
                1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6,
                1.0
            ) + 
            COALESCE(as_stats.show_project_weight, 0)::float * 0.5
        ) as project_denominator,
        CASE 
            WHEN (
                (COALESCE(ms.movie_weight_denominator_raw, 0)::float * COALESCE(1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6, 1.0)) + 
                (COALESCE(as_stats.show_project_weight, 0) * 0.5)
            ) > 0 THEN
                (
                    (COALESCE(ms.weighted_movie_rating_sum, 0)::float * COALESCE(1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6, 1.0)) + 
                    (COALESCE(as_stats.weighted_show_rating_sum, 0) * 0.5)
                ) / 
                (
                    (COALESCE(ms.movie_weight_denominator_raw, 0)::float * COALESCE(1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6, 1.0)) + 
                    (COALESCE(as_stats.show_project_weight, 0) * 0.5)
                )
            ELSE 0 
        END as project_based_avg
    FROM people p
    LEFT JOIN actor_movie_stats ms ON ms.person_tmdb_id = p.tmdb_id
    LEFT JOIN actor_show_stats as_stats ON as_stats.person_tmdb_id = p.tmdb_id
    LEFT JOIN max_collection_stats mcs ON mcs.person_tmdb_id = p.tmdb_id
    WHERE p.profile_path IS NOT NULL
      AND p.known_for_department = 'Acting'
)
SELECT 
    c.tmdb_id,
    c.name,
    c.profile_path,
    c.movie_count,
    c.show_count,
    c.episode_count,
    ROUND(c.movie_equivalents::numeric, 1) as movie_equivalents,
    ROUND(c.project_based_avg::numeric, 2) as raw_project_avg,
    ROUND(c.pure_average_rating::numeric, 2) as raw_rating,
    ROUND(
        LEAST(
            (
                ((c.project_denominator * c.project_based_avg) + (g.min_project_threshold * g.global_avg)) / 
                (c.project_denominator + g.min_project_threshold)
            ) 
            * 
            (
                1.0 + (CASE 
                    WHEN (c.movie_count + c.show_count) > 10 THEN LN(c.movie_count + c.show_count) * 0.05
                    ELSE 0
                END) + (CASE 
                    WHEN (c.movie_count + c.show_count) > 31 THEN LN(c.movie_count + c.show_count) * 0.0031
                    ELSE 0
                END) + (CASE 
                    WHEN (c.movie_count) > 30 THEN LN(c.movie_count) * 0.031
                    WHEN (c.movie_count) > 12 THEN LN(c.movie_count) * 0.013
                    ELSE 0
                END) + (CASE 
                    WHEN (c.episode_count) > 300 THEN LN(c.episode_count) * 0.031
                    WHEN (c.episode_count) > 169 THEN LN(c.episode_count) * 0.0169
                    WHEN (c.episode_count) > 69 THEN LN(c.episode_count) * 0.0069
                    WHEN (c.episode_count) > 30 THEN LN(c.episode_count) * 0.0031
                    ELSE 0
                END) + (CASE 
                    WHEN (c.episode_count) > 300 AND (c.show_count) >= 3 THEN LN(c.episode_count) * 0.031
                    WHEN (c.episode_count) > 169 AND (c.show_count) >= 3 THEN LN(c.episode_count) * 0.0169
                    WHEN (c.episode_count) > 69 AND (c.show_count) >= 2 THEN LN(c.episode_count) * 0.0069
                    WHEN (c.episode_count) > 30 AND (c.show_count) >= 2 THEN LN(c.episode_count) * 0.0031
                    ELSE 0
                END) + (CASE
                    WHEN c.movie_count >= 5 AND c.show_count >= 2 AND c.episode_count >= 25 THEN 0.031
                    ELSE 0
                END) + (CASE
                    WHEN c.movie_count >= 10 AND c.show_count >= 4 AND c.episode_count >= 69 THEN 0.069
                    ELSE 0
                END) + (CASE
                    WHEN c.movie_count >= 20 AND c.pure_average_rating >= 6.5 THEN 0.01
                    WHEN c.movie_count >= 15 AND c.pure_average_rating >= 7.0 THEN 0.0069
                    WHEN c.movie_count >= 10 AND c.pure_average_rating >= 7.5 THEN 0.0031
                    ELSE 0
                END) + (CASE
                    WHEN c.pure_average_rating >= 7.0 THEN 0.005
                    ELSE 0
                END) + (CASE
                    WHEN c.pure_average_rating >= 8.5 THEN 0.01
                    ELSE 0
                END)
            ),
            10.0
        )::numeric, 
        2
    ) as weighted_rating
FROM combined_metrics c
CROSS JOIN global_stats g
WHERE c.movie_equivalents >= 4.0 OR c.movie_count >= 4 OR (c.movie_count >= 3 AND c.show_count >= 2) OR c.show_count >= 5
ORDER BY weighted_rating DESC, c.movie_count DESC, c.show_count DESC
LIMIT 1000;

-- ============================================================================
-- INDEXES for fast lookups on the materialized views
-- ============================================================================
CREATE UNIQUE INDEX idx_top_rated_actors_tmdb_id ON analytics.top_rated_actors (tmdb_id);
CREATE INDEX idx_top_rated_actors_weighted_rating ON analytics.top_rated_actors (weighted_rating DESC);


-- ============================================================================
-- MATERIALIZED VIEW: analytics.actor_stats
-- ============================================================================
-- This MV carries the raw, separable counts/runtimes/averages the UI needs to pivot by:
--   • scope:  Overall · Movies · Shows
--   • mode:   Top Rated (raw avg) · Most Watched (count) · Most Exposed (runtime)
--
-- For "Overall × Top Rated" the UI should still use analytics.top_rated_actors
-- (Bayesian-smoothed weighted_rating). This MV is for the other 8 cells.
--
-- Role-aware rating: movie_avg_rating averages ONLY over lead/supporting
-- roles. Minor cast (background, brief appearances) still count toward
-- movie_count / movie_runtime_min — they're real watched appearances — but
-- they're excluded from the rating average and the "Top Rated" threshold
-- (meaningful_movie_count). That stops the rankings from being dominated by
-- bit-part actors whose only credits happen to be in highly-rated films.
--
-- Show runtime is APPROXIMATED. We don't know which specific episodes an
-- actor appeared in, only their total episode_count per show, so per show:
--     avg(watched_episode_runtime) × LEAST(actor.episode_count, user_watched_eps)
-- This slightly biases toward heavy-runtime shows the user has watched a lot of.
--
-- Person-level filters (applied here so every downstream query inherits them):
--   • profile_path     IS NOT NULL   — has a photo
--   • birth_date       IS NOT NULL   — TMDB has a real bio entry
--   • imdb_id          IS NOT NULL   — recognised on IMDb
--   • popularity       > 0.5         — filters out near-zero-signal entries
--   • known_for_department = 'Acting'
-- These eliminate "non-actual actor" rows (extras, voice cameo placeholders,
-- mislabeled crew, deprecated TMDB entries) before the MV is even materialized.
-- ============================================================================

CREATE MATERIALIZED VIEW analytics.actor_stats AS
WITH movie_stats AS (
    SELECT
        mc.person_tmdb_id,
        COUNT(DISTINCT m.tmdb_id)::int            as movie_count,
        SUM(COALESCE(m.runtime, 0))::int          as movie_runtime_min,
        -- Role-filtered count: how many of those appearances were
        -- lead/supporting (i.e. roles where the actor's presence shapes
        -- the film). Used as the threshold for "Top Rated" lists.
        COUNT(DISTINCT m.tmdb_id) FILTER (
            WHERE mc.role IN ('lead', 'supporting')
        )::int                                    as meaningful_movie_count,
        COUNT(DISTINCT m.tmdb_id) FILTER (WHERE mc.role = 'lead')::int       as lead_count,
        COUNT(DISTINCT m.tmdb_id) FILTER (WHERE mc.role = 'supporting')::int as supporting_count,
        -- Average ONLY over lead/supporting roles so a #25 cast member of
        -- an Oscar winner can't inflate their average by accident.
        AVG(NULLIF(m.my_rating, 0)) FILTER (
            WHERE mc.role IN ('lead', 'supporting')
        )::numeric(4,2)                            as movie_avg_rating
    FROM movie_cast mc
    JOIN movies m         ON m.tmdb_id  = mc.movie_tmdb_id
    JOIN watch_history wh ON wh.tmdb_id = m.tmdb_id AND wh.media_type = 'movie'
    GROUP BY mc.person_tmdb_id
),
watched_show_runtime AS (
    -- Avg runtime of episodes the user has actually watched for each show,
    -- plus the user's watched-episode count for that show.
    SELECT
        e.show_tmdb_id,
        COUNT(*)::int                              as user_watched_eps,
        AVG(NULLIF(e.runtime, 0))::float           as avg_eps_runtime
    FROM episodes e
    JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
    GROUP BY e.show_tmdb_id
),
show_stats AS (
    SELECT
        sc.person_tmdb_id,
        COUNT(DISTINCT s.tmdb_id)::int             as show_count,
        SUM(LEAST(COALESCE(sc.episode_count, 1), wsr.user_watched_eps))::int as episode_count,
        SUM(
            COALESCE(wsr.avg_eps_runtime, 0)
            * LEAST(COALESCE(sc.episode_count, 1), wsr.user_watched_eps)
        )::int                                     as show_runtime_min,
        AVG(NULLIF(s.my_rating, 0))::numeric(4,2) as show_avg_rating
    FROM show_cast sc
    JOIN shows s ON s.tmdb_id = sc.show_tmdb_id
    JOIN watched_show_runtime wsr ON wsr.show_tmdb_id = s.tmdb_id
    GROUP BY sc.person_tmdb_id
)
SELECT
    p.tmdb_id,
    p.name,
    p.profile_path,
    COALESCE(ms.movie_count, 0)            as movie_count,
    COALESCE(ms.meaningful_movie_count, 0) as meaningful_movie_count,
    COALESCE(ms.lead_count, 0)             as lead_count,
    COALESCE(ms.supporting_count, 0)       as supporting_count,
    COALESCE(ss.show_count, 0)             as show_count,
    COALESCE(ss.episode_count, 0)          as episode_count,
    COALESCE(ms.movie_runtime_min, 0)      as movie_runtime_min,
    COALESCE(ss.show_runtime_min, 0)       as show_runtime_min,
    COALESCE(ms.movie_runtime_min, 0) + COALESCE(ss.show_runtime_min, 0) as total_runtime_min,
    -- Weighted "overall exposure" score. Show minutes are halved because
    -- show runtime accumulates passively in binges and a single long-running
    -- series otherwise dominates the unweighted total. Tunable: bump the 0.5
    -- toward 1.0 if shows feel underweighted, or down toward 0.3 if movie
    -- careers should rank higher.
    (COALESCE(ms.movie_runtime_min, 0) + (COALESCE(ss.show_runtime_min, 0) * 0.5))::int
                                          as weighted_exposure_min,
    COALESCE(ms.movie_count, 0) + COALESCE(ss.show_count, 0)             as total_count,
    ms.movie_avg_rating,
    ss.show_avg_rating
FROM people p
LEFT JOIN movie_stats ms ON ms.person_tmdb_id = p.tmdb_id
LEFT JOIN show_stats  ss ON ss.person_tmdb_id = p.tmdb_id
WHERE p.profile_path IS NOT NULL
  AND p.birth_date   IS NOT NULL
  AND p.imdb_id      IS NOT NULL
  AND p.popularity   > 0.5
  AND p.known_for_department = 'Acting'
  AND (COALESCE(ms.movie_count, 0) > 0 OR COALESCE(ss.show_count, 0) > 0);

-- Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX idx_actor_stats_tmdb_id        ON analytics.actor_stats (tmdb_id);
CREATE INDEX idx_actor_stats_total_count           ON analytics.actor_stats (total_count DESC);
CREATE INDEX idx_actor_stats_total_runtime         ON analytics.actor_stats (total_runtime_min DESC);
CREATE INDEX idx_actor_stats_weighted_exposure     ON analytics.actor_stats (weighted_exposure_min DESC);
CREATE INDEX idx_actor_stats_movie_count           ON analytics.actor_stats (movie_count DESC);
CREATE INDEX idx_actor_stats_meaningful_movies     ON analytics.actor_stats (meaningful_movie_count DESC);
CREATE INDEX idx_actor_stats_show_count            ON analytics.actor_stats (show_count DESC);
CREATE INDEX idx_actor_stats_movie_runtime         ON analytics.actor_stats (movie_runtime_min DESC);
CREATE INDEX idx_actor_stats_show_runtime          ON analytics.actor_stats (show_runtime_min DESC);
CREATE INDEX idx_actor_stats_movie_avg             ON analytics.actor_stats (movie_avg_rating DESC NULLS LAST);
CREATE INDEX idx_actor_stats_show_avg              ON analytics.actor_stats (show_avg_rating DESC NULLS LAST);

-- ============================================================================
-- MATERIALIZED VIEW: analytics.top_rated_crew
-- ============================================================================
-- Same Bayesian-smoothed weighted rating formula, but generalized so the SAME view
-- ranks people in each of seven creative categories. The UI tabs over the `category` column.
--
-- Categories (CASE expression below is the source of truth):
--   directing        — Director
--   production       — Executive Producer, Co-Executive Producer, Creator
--   cinematography   — Director of Photography
--   screenwriting    — Writer, Screenplay, Original Story
--   composition      — Original Music Composer
--   design           — Production Design
--   source_material  — Novel, Characters, Comic Book, Graphic Novel
--
-- Why one MV instead of seven:
--   • The aggregate per (person, category) is a cheap GROUP BY add — Postgres
--     plans it as a single scan over movie_crew + show_crew.
--   • One refresh job, one set of indexes, one query path.
--   • UI fetches once and tabs are pure client-side filters.
-- ============================================================================

CREATE MATERIALIZED VIEW analytics.top_rated_crew AS
WITH
-- ── Map raw job titles to one of seven categories. People can appear in
-- multiple categories (e.g. someone who both directed and wrote) — they get
-- one ranked row per category they qualify for.
movie_crew_cat AS (
    SELECT
        mc.person_tmdb_id,
        mc.movie_tmdb_id,
        CASE
            WHEN mc.job = 'Director'                                            THEN 'directing'
            WHEN mc.job IN ('Executive Producer', 'Co-Executive Producer',
                            'Creator')                                          THEN 'production'
            WHEN mc.job = 'Director of Photography'                             THEN 'cinematography'
            WHEN mc.job IN ('Writer', 'Screenplay', 'Original Story')           THEN 'screenwriting'
            WHEN mc.job = 'Original Music Composer'                             THEN 'composition'
            WHEN mc.job = 'Production Design'                                   THEN 'design'
            WHEN mc.job IN ('Novel', 'Characters', 'Comic Book', 'Graphic Novel')
                                                                                THEN 'source_material'
        END AS category
    FROM movie_crew mc
    WHERE mc.job IN (
        'Director','Executive Producer','Co-Executive Producer','Creator',
        'Director of Photography','Writer','Screenplay','Original Story',
        'Original Music Composer','Production Design',
        'Novel','Characters','Comic Book','Graphic Novel'
    )
),
show_crew_cat AS (
    SELECT
        sc.person_tmdb_id,
        sc.show_tmdb_id,
        sc.episode_count,
        CASE
            WHEN sc.job = 'Director'                                            THEN 'directing'
            WHEN sc.job IN ('Executive Producer', 'Co-Executive Producer',
                            'Creator')                                          THEN 'production'
            WHEN sc.job = 'Director of Photography'                             THEN 'cinematography'
            WHEN sc.job IN ('Writer', 'Screenplay', 'Original Story')           THEN 'screenwriting'
            WHEN sc.job = 'Original Music Composer'                             THEN 'composition'
            WHEN sc.job = 'Production Design'                                   THEN 'design'
            WHEN sc.job IN ('Novel', 'Characters', 'Comic Book', 'Graphic Novel')
                                                                                THEN 'source_material'
        END AS category
    FROM show_crew sc
    WHERE sc.job IN (
        'Director','Executive Producer','Co-Executive Producer','Creator',
        'Director of Photography','Writer','Screenplay','Original Story',
        'Original Music Composer','Production Design',
        'Novel','Characters','Comic Book','Graphic Novel'
    )
),
-- ── Same scaffolding as analytics.top_rated_directors (migration 001):
--    global rating average + Bayesian prior threshold.
global_stats AS (
    SELECT
        AVG(my_rating) as global_avg,
        5.0 as min_project_threshold
    FROM (
        SELECT my_rating FROM movies WHERE my_rating IS NOT NULL
        UNION ALL
        SELECT my_rating FROM shows WHERE my_rating IS NOT NULL
    ) all_media
),
-- Per (person, category) — biggest collection an actor's category contributed to.
-- Used as the concentration multiplier (one franchise shouldn't carry the score).
max_collection_stats AS (
    SELECT
        person_tmdb_id, category,
        MAX(count_per_collection) as max_movies_in_single_collection
    FROM (
        SELECT
            mcc.person_tmdb_id,
            mcc.category,
            m.collection_id,
            COUNT(*)::int as count_per_collection
        FROM movie_crew_cat mcc
        JOIN movies m         ON m.tmdb_id  = mcc.movie_tmdb_id
        JOIN watch_history wh ON wh.tmdb_id = m.tmdb_id AND wh.media_type = 'movie'
        WHERE m.my_rating IS NOT NULL
          AND m.collection_id IS NOT NULL
        GROUP BY mcc.person_tmdb_id, mcc.category, m.collection_id
    ) inner_stats
    GROUP BY person_tmdb_id, category
),
-- Per (person, category) movie aggregates.
person_movie_stats AS (
    SELECT
        mcc.person_tmdb_id,
        mcc.category,
        COUNT(DISTINCT m.tmdb_id)::int as movie_count,
        SUM(m.my_rating)            as pure_movie_rating_sum,
        SUM(m.my_rating)            as weighted_movie_rating_sum,
        COUNT(DISTINCT m.tmdb_id)::float as movie_weight_denominator_raw
    FROM movie_crew_cat mcc
    JOIN movies m         ON m.tmdb_id  = mcc.movie_tmdb_id
    JOIN watch_history wh ON wh.tmdb_id = m.tmdb_id AND wh.media_type = 'movie'
    WHERE m.my_rating IS NOT NULL
    GROUP BY mcc.person_tmdb_id, mcc.category
),
watched_shows AS (
    SELECT e.show_tmdb_id, COUNT(*)::int as watched_eps_count
    FROM episodes e
    JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
    GROUP BY e.show_tmdb_id
),
-- Per (person, category) show aggregates with the same project-weight formula
-- the directors view used: episodes-watched factor capped at 3.0 per project.
person_show_stats AS (
    SELECT
        scc.person_tmdb_id,
        scc.category,
        COUNT(DISTINCT s.tmdb_id)::int as show_count,
        SUM(s.my_rating)            as pure_show_rating_sum,
        SUM(
            LEAST(
                (1.0 + SQRT(LEAST(COALESCE(scc.episode_count, 1), ws.watched_eps_count)::float)) *
                LEAST(COALESCE(scc.episode_count, 1)::float / ws.watched_eps_count::float, 1.0),
                3.0
            )
        )::float as show_project_weight,
        SUM(LEAST(COALESCE(scc.episode_count, 1), ws.watched_eps_count))::int as total_episodes,
        SUM(
            s.my_rating *
            LEAST(
                (1.0 + SQRT(LEAST(COALESCE(scc.episode_count, 1), ws.watched_eps_count)::float)) *
                LEAST(COALESCE(scc.episode_count, 1)::float / ws.watched_eps_count::float, 1.0),
                3.0
            )
        ) as weighted_show_rating_sum
    FROM show_crew_cat scc
    JOIN shows s ON s.tmdb_id = scc.show_tmdb_id
    JOIN watched_shows ws ON ws.show_tmdb_id = s.tmdb_id
    WHERE s.my_rating IS NOT NULL
    GROUP BY scc.person_tmdb_id, scc.category
),
-- Per (person, category) — biggest single-show contribution for the show
-- concentration penalty (one mega-show shouldn't dominate).
max_show_stats AS (
    SELECT person_tmdb_id, category,
           MAX(eps_count) as max_episodes_in_single_show
    FROM (
        SELECT
            scc.person_tmdb_id,
            scc.category,
            scc.show_tmdb_id,
            SUM(LEAST(COALESCE(scc.episode_count, 1), ws.watched_eps_count))::int as eps_count
        FROM show_crew_cat scc
        JOIN watched_shows ws ON ws.show_tmdb_id = scc.show_tmdb_id
        JOIN shows s          ON s.tmdb_id = scc.show_tmdb_id
        WHERE s.my_rating IS NOT NULL
        GROUP BY scc.person_tmdb_id, scc.category, scc.show_tmdb_id
    ) inner_stats
    GROUP BY person_tmdb_id, category
),
-- Person × category list (every (person, category) that has ≥1 contribution).
person_categories AS (
    SELECT person_tmdb_id, category FROM person_movie_stats
    UNION
    SELECT person_tmdb_id, category FROM person_show_stats
),
combined_metrics AS (
    SELECT
        p.tmdb_id,
        p.name,
        p.profile_path,
        pc.category,
        COALESCE(ms.movie_count, 0)         as movie_count,
        COALESCE(ds.show_count, 0)          as show_count,
        COALESCE(ds.total_episodes, 0)      as episode_count,
        COALESCE(
            1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float
                  / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6,
            1.0
        ) as movie_concentration_multiplier,
        COALESCE(
            1.0 - POWER(COALESCE(mss.max_episodes_in_single_show, 0)::float
                  / NULLIF(COALESCE(ds.total_episodes, 0), 0)::float, 3) * 0.6,
            1.0
        ) as show_concentration_multiplier,
        CASE
            WHEN (COALESCE(ms.movie_count, 0) + COALESCE(ds.show_count, 0)) > 0 THEN
                (COALESCE(ms.pure_movie_rating_sum, 0)::float + COALESCE(ds.pure_show_rating_sum, 0)::float)
                / (COALESCE(ms.movie_count, 0) + COALESCE(ds.show_count, 0))::float
            ELSE 0
        END as pure_average_rating,
        (
            COALESCE(ms.movie_count, 0)::float *
            COALESCE(1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float
                          / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6, 1.0)
            +
            (COALESCE(ds.show_project_weight, 0)::float *
             COALESCE(1.0 - POWER(COALESCE(mss.max_episodes_in_single_show, 0)::float
                          / NULLIF(COALESCE(ds.total_episodes, 0), 0)::float, 3) * 0.6, 1.0)) * 0.4
        ) as movie_equivalents,
        (
            COALESCE(ms.movie_weight_denominator_raw, 0)::float *
            COALESCE(1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float
                          / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6, 1.0)
            +
            (COALESCE(ds.show_project_weight, 0)::float *
             COALESCE(1.0 - POWER(COALESCE(mss.max_episodes_in_single_show, 0)::float
                          / NULLIF(COALESCE(ds.total_episodes, 0), 0)::float, 3) * 0.6, 1.0)) * 0.5
        ) as project_denominator,
        CASE
            WHEN (
                (COALESCE(ms.movie_weight_denominator_raw, 0)::float * COALESCE(1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6, 1.0))
              + ((COALESCE(ds.show_project_weight, 0) * COALESCE(1.0 - POWER(COALESCE(mss.max_episodes_in_single_show, 0)::float / NULLIF(COALESCE(ds.total_episodes, 0), 0)::float, 3) * 0.6, 1.0)) * 0.5)
            ) > 0 THEN
                (
                    (COALESCE(ms.weighted_movie_rating_sum, 0)::float * COALESCE(1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6, 1.0))
                  + ((COALESCE(ds.weighted_show_rating_sum, 0) * COALESCE(1.0 - POWER(COALESCE(mss.max_episodes_in_single_show, 0)::float / NULLIF(COALESCE(ds.total_episodes, 0), 0)::float, 3) * 0.6, 1.0)) * 0.5)
                )
                /
                (
                    (COALESCE(ms.movie_weight_denominator_raw, 0)::float * COALESCE(1.0 - POWER(COALESCE(mcs.max_movies_in_single_collection, 0)::float / NULLIF(COALESCE(ms.movie_count, 0), 0)::float, 3) * 0.6, 1.0))
                  + ((COALESCE(ds.show_project_weight, 0) * COALESCE(1.0 - POWER(COALESCE(mss.max_episodes_in_single_show, 0)::float / NULLIF(COALESCE(ds.total_episodes, 0), 0)::float, 3) * 0.6, 1.0)) * 0.5)
                )
            ELSE 0
        END as project_based_avg
    FROM person_categories pc
    JOIN people p ON p.tmdb_id = pc.person_tmdb_id
    LEFT JOIN person_movie_stats   ms  ON ms.person_tmdb_id  = pc.person_tmdb_id AND ms.category  = pc.category
    LEFT JOIN person_show_stats    ds  ON ds.person_tmdb_id  = pc.person_tmdb_id AND ds.category  = pc.category
    LEFT JOIN max_collection_stats mcs ON mcs.person_tmdb_id = pc.person_tmdb_id AND mcs.category = pc.category
    LEFT JOIN max_show_stats       mss ON mss.person_tmdb_id = pc.person_tmdb_id AND mss.category = pc.category
    WHERE p.profile_path IS NOT NULL
)
SELECT
    c.tmdb_id,
    c.name,
    c.profile_path,
    c.category,
    c.movie_count,
    c.show_count,
    c.episode_count,
    ROUND(c.movie_equivalents::numeric, 1) as movie_equivalents,
    ROUND(c.project_based_avg::numeric, 2) as raw_project_avg,
    ROUND(c.pure_average_rating::numeric, 2) as raw_rating,
    ROUND(
        LEAST(
            (
                ((c.project_denominator * c.project_based_avg) + (g.min_project_threshold * g.global_avg))
                / (c.project_denominator + g.min_project_threshold)
            )
            *
            (
                1.0
                + (CASE WHEN (c.movie_count + c.show_count) > 5  THEN LN(c.movie_count + c.show_count) * 0.05  ELSE 0 END)
                + (CASE WHEN (c.movie_count + c.show_count) > 15 THEN LN(c.movie_count + c.show_count) * 0.005 ELSE 0 END)
                + (CASE WHEN (c.movie_count) > 15 THEN LN(c.movie_count) * 0.03
                        WHEN (c.movie_count) > 5  THEN LN(c.movie_count) * 0.015
                        ELSE 0 END)
                + (CASE WHEN (c.episode_count) > 100 THEN LN(c.episode_count) * 0.03
                        WHEN (c.episode_count) > 40  THEN LN(c.episode_count) * 0.015
                        WHEN (c.episode_count) > 10  THEN LN(c.episode_count) * 0.005
                        ELSE 0 END)
                + (CASE WHEN c.movie_count >= 3 AND c.show_count >= 2 AND c.episode_count >= 8  THEN 0.04 ELSE 0 END)
                + (CASE WHEN c.movie_count >= 5 AND c.show_count >= 3 AND c.episode_count >= 20 THEN 0.08 ELSE 0 END)
                + (CASE WHEN c.movie_count >= 10 AND c.pure_average_rating >= 6.5 THEN 0.01
                        WHEN c.movie_count >= 5  AND c.pure_average_rating >= 7.0 THEN 0.005
                        ELSE 0 END)
                + (CASE WHEN c.pure_average_rating >= 7.0 THEN 0.005 ELSE 0 END)
                + (CASE WHEN c.pure_average_rating >= 8.5 THEN 0.01  ELSE 0 END)
            ),
            10.0
        )::numeric,
        2
    ) as weighted_rating
FROM combined_metrics c
CROSS JOIN global_stats g
-- Same coverage threshold as the original directors view: enough credits to
-- be a meaningful entry in any single category.
WHERE c.movie_equivalents >= 2.0
   OR c.movie_count >= 3
   OR c.episode_count >= 10
   OR c.show_count >= 2;

-- ── Indexes ────────────────────────────────────────────────────────────────
-- Composite PK enables CONCURRENTLY refresh and per-category lookups.
CREATE UNIQUE INDEX idx_top_rated_crew_pk
    ON analytics.top_rated_crew (category, tmdb_id);
CREATE INDEX idx_top_rated_crew_category_rating
    ON analytics.top_rated_crew (category, weighted_rating DESC);
