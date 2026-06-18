-- Movies grouped by release decade with count, avg rating, and total runtime
SELECT
  (EXTRACT(YEAR FROM m.release_date)::int / 10 * 10) AS decade,
  COUNT(*)::int AS count,
  ROUND(AVG(wh.rating), 2) AS avg_rating,
  ROUND(SUM(m.runtime) / 60.0)::int AS total_runtime_hours
FROM watch_history wh
JOIN movies m ON m.tmdb_id = wh.tmdb_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
  AND m.release_date IS NOT NULL
GROUP BY decade
HAVING COUNT(*) >= 3
ORDER BY decade;
