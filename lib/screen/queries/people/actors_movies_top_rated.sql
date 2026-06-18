-- Movies-only: actors with highest raw average rating across watched films.
--
-- Threshold is meaningful_movie_count (lead + supporting) ≥ 3, NOT total
-- movie_count. This prevents a bit-part actor with three minor appearances
-- in well-rated films from outranking a real lead actor.
--
-- movie_avg_rating itself is already role-filtered in the MV — see
-- migration 003 for the rationale.
SELECT
    tmdb_id, name, profile_path,
    movie_count, episode_count, show_count,
    movie_avg_rating as raw_rating,
    movie_runtime_min, show_runtime_min, total_runtime_min,
    meaningful_movie_count, lead_count, supporting_count
FROM analytics.actor_stats
WHERE meaningful_movie_count >= 3 AND movie_avg_rating IS NOT NULL
ORDER BY movie_avg_rating DESC, meaningful_movie_count DESC, movie_count DESC
LIMIT 1000;
