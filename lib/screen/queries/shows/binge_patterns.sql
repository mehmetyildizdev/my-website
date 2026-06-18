-- Biggest binge days: most episodes of a single show watched in one day
SELECT
  s.name AS show_name,
  s.tmdb_id AS show_tmdb_id,
  to_char(wh.watched_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') AS binge_date,
  COUNT(*)::int AS episodes_watched,
  COALESCE(SUM(e.runtime), COUNT(*) * 45)::int AS total_runtime_min
FROM watch_history wh
JOIN episodes e ON e.tmdb_id = wh.tmdb_id
JOIN shows s ON s.tmdb_id = e.show_tmdb_id
WHERE wh.media_type = 'episode'
  AND wh.watched_at IS NOT NULL
GROUP BY s.tmdb_id, s.name, to_char(wh.watched_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD')
HAVING COUNT(*) >= 3
ORDER BY episodes_watched DESC, total_runtime_min DESC
LIMIT 30;
