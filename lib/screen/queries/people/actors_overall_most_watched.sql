-- Overall: actors by total appearances (movies + shows).
-- Episode count breaks ties for show-heavy careers.
SELECT
    tmdb_id, name, profile_path,
    movie_count, episode_count, show_count,
    NULL as raw_rating,
    movie_runtime_min, show_runtime_min, total_runtime_min,
    total_count
FROM actor_stats
WHERE total_count > 0
ORDER BY total_count DESC, episode_count DESC, movie_count DESC
LIMIT 1000;
