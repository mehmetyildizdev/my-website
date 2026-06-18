-- Shows-only: actors by number of distinct watched shows. Episode count is
-- shown as secondary context (and breaks ties for binge-heavy actors).
-- Min 5 episodes so 1-episode guest stars don't fill the list.
SELECT
    tmdb_id, name, profile_path,
    movie_count, episode_count, show_count,
    show_avg_rating as raw_rating,
    movie_runtime_min, show_runtime_min, total_runtime_min
FROM analytics.actor_stats
WHERE show_count > 0 AND episode_count >= 5
ORDER BY show_count DESC, episode_count DESC
LIMIT 1000;
