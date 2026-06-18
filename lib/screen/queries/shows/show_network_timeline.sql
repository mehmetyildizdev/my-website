-- Shows watched per year per network (top networks) with show names
SELECT
  n.name AS network_name,
  EXTRACT(YEAR FROM wh.watched_at AT TIME ZONE 'Europe/Istanbul')::int AS year,
  COUNT(DISTINCT e.show_tmdb_id)::int AS show_count,
  ROUND(AVG(s.trakt_rating), 2) AS avg_rating,
  ARRAY_AGG(DISTINCT s.name ORDER BY s.name) AS show_names
FROM watch_history wh
JOIN episodes e ON e.tmdb_id = wh.tmdb_id
JOIN shows s ON s.tmdb_id = e.show_tmdb_id
JOIN show_networks sn ON sn.show_tmdb_id = s.tmdb_id
JOIN networks n ON n.tmdb_id = sn.network_tmdb_id
WHERE wh.media_type = 'episode'
  AND wh.watched_at IS NOT NULL
  AND s.trakt_rating IS NOT NULL
GROUP BY n.name, year
HAVING COUNT(DISTINCT e.show_tmdb_id) >= 1
ORDER BY n.name, year;
