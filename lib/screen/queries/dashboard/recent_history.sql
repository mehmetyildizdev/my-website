SELECT 
  wh.id as history_id,
  wh.watched_at, 
  wh.my_rating, 
  wh.media_type,
  wh.tmdb_id,
  COALESCE(m.title, s.name) as title,
  e.title as episode_title,
  e.season_number,
  e.episode_number,
  COALESCE(m.poster_path, s.poster_path) as poster_path,
  COALESCE(m.release_date, e.air_date) as release_date,
  s.tmdb_id as show_tmdb_id
FROM watch_history wh
LEFT JOIN movies m ON wh.media_type = 'movie' AND wh.tmdb_id = m.tmdb_id
LEFT JOIN episodes e ON wh.media_type = 'episode' AND wh.tmdb_id = e.tmdb_id
LEFT JOIN shows s ON e.show_tmdb_id = s.tmdb_id
ORDER BY wh.watched_at DESC
LIMIT 16;
