-- Overall: actors by weighted exposure (movies count fully, show runtime
-- halved). Without the weight, show binges dominate and the list becomes
-- a near-duplicate of the Shows tab. See migration 003 for the rationale.
--
-- The badge in the UI still shows raw total_runtime_min so the displayed
-- "X hours" stays intuitive — only the ordering uses weighted_exposure_min.
SELECT
    tmdb_id, name, profile_path,
    movie_count, episode_count, show_count,
    NULL as raw_rating,
    movie_runtime_min, show_runtime_min, total_runtime_min,
    total_count
FROM actor_stats
WHERE weighted_exposure_min > 0
ORDER BY weighted_exposure_min DESC, total_count DESC
LIMIT 1000;
