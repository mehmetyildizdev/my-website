-- Shows-only: actors by approximated runtime across watched shows.
-- Min 5 episodes so guest-star outliers don't surface from a single long ep.
-- See migration 003 for the runtime approximation note.
SELECT
    tmdb_id, name, profile_path,
    movie_count, episode_count, show_count,
    show_avg_rating as raw_rating,
    movie_runtime_min, show_runtime_min, total_runtime_min
FROM analytics.actor_stats
WHERE show_runtime_min > 0 AND episode_count >= 5
ORDER BY show_runtime_min DESC, episode_count DESC
LIMIT 1000;
