-- Movies-only: actors with highest raw average rating across watched films.
--
-- Threshold is meaningful_movie_count (lead + supporting) ≥ 3, NOT total
-- movie_count. This prevents a bit-part actor with three minor appearances
-- in well-rated films from outranking a real lead actor.
--
-- movie_avg_rating itself is already role-filtered in the MV — see
-- migration 003 for the rationale.
SELECT
    s.tmdb_id, s.name, s.profile_path,
    s.movie_count, s.episode_count, s.show_count,
    ROUND(((ar.my_rating + ar.avgr + ar.mr) / 3.0)::numeric, 2) as raw_rating,
    s.movie_runtime_min, s.show_runtime_min, s.total_runtime_min,
    s.meaningful_movie_count, s.lead_count, s.supporting_count
FROM actor_stats s
JOIN actor__ratings ar ON ar.tmdb_id = s.tmdb_id
WHERE s.meaningful_movie_count >= 3 AND s.movie_avg_rating IS NOT NULL
ORDER BY ROUND(((ar.my_rating + ar.avgr + ar.mr) / 3.0)::numeric, 2) DESC, s.meaningful_movie_count DESC, s.movie_count DESC
LIMIT 1000;
