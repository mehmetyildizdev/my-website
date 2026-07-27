-- Movies grouped by release decade with count, avg rating, and total runtime (D1/SQLite version)
SELECT
  (release_year / 10 * 10) AS decade,
  COUNT(*) AS count,
  ROUND(AVG(my_rating), 2) AS avg_rating,
  ROUND(SUM(runtime) / 60.0) AS total_runtime_hours
FROM chart_ratings_comparison
WHERE media_type = 'movie' AND release_year IS NOT NULL
GROUP BY (release_year / 10 * 10)
HAVING COUNT(*) >= 3
ORDER BY decade;
