-- Average personal rating per genre per release year (1980+) for shows
SELECT
    g.name as name,
    EXTRACT(YEAR FROM s.first_air_date)::int as year,
    ROUND(AVG(s.trakt_rating)::numeric, 2) as avg_rating,
    COUNT(*)::int as count
FROM shows s
JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
JOIN show_genres sg ON sg.show_tmdb_id = s.tmdb_id
JOIN genres g ON g.id = sg.genre_id
WHERE s.trakt_rating IS NOT NULL
  AND s.first_air_date IS NOT NULL
  AND EXTRACT(YEAR FROM s.first_air_date) >= 1980
GROUP BY g.name, EXTRACT(YEAR FROM s.first_air_date)
HAVING COUNT(*) >= 2
ORDER BY name, year;
