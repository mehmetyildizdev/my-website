-- Show rating distribution: count of shows per rating bucket (1-10)
SELECT
  s.my_rating::int AS rating,
  COUNT(*)::int AS count,
  ARRAY_AGG(s.name ORDER BY s.name) AS show_names
FROM (
  SELECT DISTINCT s.tmdb_id, s.name, s.my_rating
  FROM shows s
  JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
  JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
  WHERE s.my_rating IS NOT NULL
) s
GROUP BY s.my_rating::int
ORDER BY rating;
