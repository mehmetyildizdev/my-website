-- Show completion progress: seasons/episodes watched vs total (D1/SQLite version)
SELECT
  show_tmdb_id,
  show_name,
  total_seasons,
  watched_seasons,
  total_episodes,
  watched_eps AS watched_episodes,
  CAST(completion_rate AS numeric) AS completion_pct,
  rating AS avg_rating,
  status
FROM watched_show_info
ORDER BY 
  CASE status
    WHEN 'watching' THEN 1
    WHEN 'complete' THEN 2
    WHEN 'dropped' THEN 3
    ELSE 4
  END ASC,
  completion_pct DESC,
  watched_episodes DESC;
