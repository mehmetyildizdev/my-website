-- Movie runtime vs personal rating scatter data
SELECT
  m.title,
  m.tmdb_id,
  m.runtime,
  wh.rating,
  EXTRACT(YEAR FROM m.release_date)::int AS release_year
FROM watch_history wh
JOIN movies m ON m.tmdb_id = wh.tmdb_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
  AND m.runtime IS NOT NULL
  AND m.runtime > 0
ORDER BY wh.rating DESC;
