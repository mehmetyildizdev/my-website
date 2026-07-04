-- Movies-only: actors with the most watched-films appearances.
-- Min 2 movies (single-film entries get filtered).
SELECT
    tmdb_id, name, profile_path,
    movie_count, episode_count, show_count,
    movie_avg_rating as raw_rating,
    movie_runtime_min, show_runtime_min, total_runtime_min
FROM actor_stats
WHERE movie_count >= 2
ORDER BY movie_count DESC, movie_avg_rating DESC NULLS LAST
LIMIT 1000;
