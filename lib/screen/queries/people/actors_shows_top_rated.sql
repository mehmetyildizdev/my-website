-- Shows-only: actors with highest raw average rating across watched shows.
-- Floor at 2 shows AND 5 episodes to avoid single-guest-spot outliers.
SELECT
    tmdb_id, name, profile_path,
    movie_count, episode_count, show_count,
    show_avg_rating as raw_rating,
    movie_runtime_min, show_runtime_min, total_runtime_min
FROM analytics.actor_stats
WHERE show_count >= 2 AND episode_count >= 15 AND show_avg_rating IS NOT NULL
ORDER BY show_avg_rating DESC, show_count DESC
LIMIT 1000;
