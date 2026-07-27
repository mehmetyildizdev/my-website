-- Shows-only: actors with highest raw average rating across watched shows.
-- Floor at 2 shows AND 5 episodes to avoid single-guest-spot outliers.
SELECT
    s.tmdb_id, s.name, s.profile_path,
    s.movie_count, s.episode_count, s.show_count,
    ROUND(((ar.my_rating + ar.avgr + ar.mr) / 3.0)::numeric, 2) as raw_rating,
    s.movie_runtime_min, s.show_runtime_min, s.total_runtime_min
FROM actor_stats s
JOIN actor__ratings ar ON ar.tmdb_id = s.tmdb_id
WHERE s.show_count >= 2 AND s.episode_count >= 15 AND s.show_avg_rating IS NOT NULL
ORDER BY ROUND(((ar.my_rating + ar.avgr + ar.mr) / 3.0)::numeric, 2) DESC, s.show_count DESC
LIMIT 1000;
