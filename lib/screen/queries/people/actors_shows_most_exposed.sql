-- Shows-only: actors ranked by show exposure score (show_exposure_bonus * face_value_bonus).
-- Joins actor_stats with actor_adjusted_metrics materialized view.
-- Min 5 episodes so guest-star outliers don't surface from a single long ep.
SELECT
    s.tmdb_id, s.name, s.profile_path,
    s.movie_count, s.episode_count, s.show_count,
    s.show_avg_rating as raw_rating,
    s.movie_runtime_min, s.show_runtime_min, s.total_runtime_min,
    (COALESCE(a.show_exposure_bonus, 0) * COALESCE(a.affinity_rating, 0) * COALESCE(a.likeness_rating, 0) * COALESCE(a.show_role_weight, 0) * SQRT(COALESCE(a.face_value_bonus, 0))) as exposure_score
FROM actor_stats s
JOIN actor_adjusted_metrics a ON s.tmdb_id = a.tmdb_id
WHERE s.show_runtime_min > 0 AND s.episode_count >= 5
ORDER BY (COALESCE(a.show_exposure_bonus, 0) * COALESCE(a.affinity_rating, 0) * COALESCE(a.likeness_rating, 0) * COALESCE(a.show_role_weight, 0) * SQRT(COALESCE(a.face_value_bonus, 0))) DESC, s.episode_count DESC
LIMIT 1000;

