-- Average personal rating per genre per release year (1980+) for movies
SELECT
    g.name as name,
    EXTRACT(YEAR FROM m.release_date)::int as year,
    ROUND(AVG(wh.my_rating)::numeric, 2) as avg_rating,
    COUNT(*)::int as count
FROM watch_history wh
JOIN movies m ON m.tmdb_id = wh.tmdb_id
JOIN movie_genres mg ON mg.movie_tmdb_id = m.tmdb_id
JOIN genres g ON g.id = mg.genre_id
WHERE wh.media_type = 'movie'
  AND wh.my_rating IS NOT NULL
  AND m.release_date IS NOT NULL
  AND EXTRACT(YEAR FROM m.release_date) >= 1980
GROUP BY g.name, EXTRACT(YEAR FROM m.release_date)
HAVING COUNT(*) >= 2
ORDER BY name, year;
