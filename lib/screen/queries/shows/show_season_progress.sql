-- Show completion progress: seasons/episodes watched vs total
SELECT
  s.tmdb_id AS show_tmdb_id,
  s.name AS show_name,
  s.number_of_seasons AS total_seasons,
  COUNT(DISTINCT e.season_number)::int AS watched_seasons,
  s.number_of_episodes AS total_episodes,
  COUNT(*)::int AS watched_episodes,
  ROUND((COUNT(*)::numeric / NULLIF(s.number_of_episodes, 0)) * 100)::int AS completion_pct,
  ROUND(AVG(wh.my_rating), 1) AS avg_rating,
  CASE
    WHEN COUNT(*)::numeric / NULLIF(s.number_of_episodes, 0) >= 0.95 THEN 'complete'
    WHEN MAX(wh.watched_at) > NOW() - INTERVAL '90 days' THEN 'watching'
    ELSE 'dropped'
  END AS status
FROM watch_history wh
JOIN episodes e ON e.tmdb_id = wh.tmdb_id
JOIN shows s ON s.tmdb_id = e.show_tmdb_id
WHERE wh.media_type = 'episode'
  AND s.number_of_episodes > 0
GROUP BY s.tmdb_id, s.name, s.number_of_seasons, s.number_of_episodes
ORDER BY completion_pct DESC, watched_episodes DESC;
