-- Movies-only: actors by total runtime in your watched films (minutes).
-- Min 2 movies so single-film entries don't dominate via one long runtime.
SELECT
    tmdb_id, name, profile_path,
    movie_count, episode_count, show_count,
    movie_avg_rating as raw_rating,
    movie_runtime_min, show_runtime_min, total_runtime_min
FROM analytics.actor_stats
WHERE movie_count >= 2 AND movie_runtime_min > 0
ORDER BY movie_runtime_min DESC, movie_count DESC
LIMIT 1000;
