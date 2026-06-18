-- Movies watched but not rated
(SELECT 
    'movie' as media_type,
    m.title,
    m.release_date,
    m.trakt_id,
    wh.watched_at
FROM watch_history wh
JOIN movies m ON m.tmdb_id = wh.tmdb_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NULL
ORDER BY wh.watched_at DESC)
UNION ALL
-- Shows without a trakt_rating (not yet rated on Trakt)
(SELECT 
    'show' as media_type,
    s.name as title,
    s.first_air_date as release_date,
    s.trakt_id,
    MAX(wh.watched_at) as watched_at
FROM watch_history wh
JOIN episodes e ON e.tmdb_id = wh.tmdb_id
JOIN shows s ON s.tmdb_id = e.show_tmdb_id
WHERE wh.media_type = 'episode'
  AND s.trakt_rating IS NULL
GROUP BY s.tmdb_id, s.name, s.first_air_date, s.trakt_id
ORDER BY MAX(wh.watched_at) DESC);
