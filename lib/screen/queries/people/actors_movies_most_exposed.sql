-- Movies-only: actors ranked by movie exposure score (movie_exposure_bonus * face_value_bonus).
-- Joins actor_stats with actor_adjusted_metrics materialized view.
-- Min 2 movies so single-film entries don't dominate via one long runtime.
SELECT
    s.tmdb_id, s.name, s.profile_path,
    s.movie_count, s.episode_count, s.show_count,
    s.movie_avg_rating as raw_rating,
    s.movie_runtime_min, s.show_runtime_min, s.total_runtime_min,
    (COALESCE(a.movie_exposure_bonus, 0) * COALESCE(a.affinity_rating, 0) * COALESCE(a.likeness_rating, 0) * COALESCE(a.movie_role_weight, 0) * SQRT(COALESCE(a.face_value_bonus, 0))) as exposure_score
FROM actor_stats s
JOIN actor_adjusted_metrics a ON s.tmdb_id = a.tmdb_id
WHERE s.movie_count >= 2 AND s.movie_runtime_min > 0
ORDER BY (COALESCE(a.movie_exposure_bonus, 0) * COALESCE(a.affinity_rating, 0) * COALESCE(a.likeness_rating, 0) * COALESCE(a.movie_role_weight, 0) * SQRT(COALESCE(a.face_value_bonus, 0))) DESC, s.movie_count DESC
LIMIT 1000;


