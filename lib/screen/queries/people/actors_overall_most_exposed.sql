-- Overall: actors ranked by overall exposure score (overall_exposure_bonus * face_value_bonus).
-- Joins actor_stats with actor_adjusted_metrics materialized view.
SELECT
    s.tmdb_id, s.name, s.profile_path,
    s.movie_count, s.episode_count, s.show_count,
    NULL as raw_rating,
    s.movie_runtime_min, s.show_runtime_min, s.total_runtime_min,
    s.total_count,
    (COALESCE(a.overall_exposure_bonus, 0) * COALESCE(a.affinity_rating, 0) * COALESCE(a.likeness_rating, 0) * COALESCE(a.overall_role_weight, 0) * SQRT(COALESCE(a.face_value_bonus, 0))) as exposure_score
FROM actor_stats s
JOIN actor_adjusted_metrics a ON s.tmdb_id = a.tmdb_id
WHERE s.weighted_exposure_min > 0
ORDER BY (COALESCE(a.overall_exposure_bonus, 0) * COALESCE(a.affinity_rating, 0) * COALESCE(a.likeness_rating, 0) * COALESCE(a.overall_role_weight, 0) * SQRT(COALESCE(a.face_value_bonus, 0))) DESC, s.total_count DESC
LIMIT 1000;

