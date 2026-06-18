-- Collection completion stats with overall context.
--
-- Source of truth:
--   • collection_movies (bridge) — every movie in a TMDB collection, watched or not.
--   • watch_history     — what the user has actually watched.
--
-- A collection appears in the result only if the user has watched at least one
-- of its movies (HAVING watched_movies > 0). Totals come from the bridge so
-- "3 of 5 watched" is accurate even when 2 siblings aren't in `movies`.

WITH collection_stats AS (
    SELECT
        c.tmdb_id,
        c.name,
        c.poster_path,
        COUNT(DISTINCT cm.movie_tmdb_id)::int as total_movies,
        COUNT(DISTINCT CASE WHEN wh.tmdb_id IS NOT NULL THEN cm.movie_tmdb_id END)::int as watched_movies,
        ROUND(
            COUNT(DISTINCT CASE WHEN wh.tmdb_id IS NOT NULL THEN cm.movie_tmdb_id END)::numeric /
            NULLIF(COUNT(DISTINCT cm.movie_tmdb_id), 0)::numeric * 100,
        0)::int as completion_pct,
        ROUND(AVG(CASE WHEN wh.rating IS NOT NULL THEN wh.rating END)::numeric, 1) as avg_rating
    FROM collections c
    JOIN collection_movies cm ON cm.collection_tmdb_id = c.tmdb_id
    LEFT JOIN watch_history wh
        ON wh.tmdb_id = cm.movie_tmdb_id AND wh.media_type = 'movie'
    GROUP BY c.tmdb_id, c.name, c.poster_path
    HAVING COUNT(DISTINCT CASE WHEN wh.tmdb_id IS NOT NULL THEN cm.movie_tmdb_id END) > 0
),
overall AS (
    SELECT
        (SELECT COUNT(*) FROM watch_history WHERE media_type = 'movie')::int as total_watched_movies,
        (SELECT SUM(watched_movies) FROM collection_stats)::int as movies_in_collections,
        (SELECT COUNT(*) FROM collection_stats)::int as total_collections,
        (SELECT COUNT(*) FROM collection_stats WHERE completion_pct = 100)::int as complete_collections
)
SELECT
    cs.tmdb_id,
    cs.name,
    cs.poster_path,
    cs.total_movies,
    cs.watched_movies,
    cs.completion_pct,
    cs.avg_rating,
    o.total_watched_movies,
    o.movies_in_collections,
    o.total_collections,
    o.complete_collections
FROM collection_stats cs
CROSS JOIN overall o
ORDER BY cs.avg_rating DESC NULLS LAST, cs.completion_pct DESC, cs.watched_movies DESC;
