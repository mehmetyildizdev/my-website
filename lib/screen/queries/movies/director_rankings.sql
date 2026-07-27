-- Directors ranked by average rating (3+ movies watched) (D1/SQLite version)
SELECT
  name,
  CAST(id_or_code AS integer) AS tmdb_id,
  count AS movie_count,
  avg_rating,
  best_title_name AS best_movie,
  best_title_rating AS best_rating
FROM chart_production_metrics
WHERE type = 'director' AND count >= 3
ORDER BY avg_rating DESC, movie_count DESC;
