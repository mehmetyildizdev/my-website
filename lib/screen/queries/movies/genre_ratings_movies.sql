-- Average rating per genre (movies only)
SELECT
    g.name as name,
    COUNT(*)::int as total_count,
    ROUND(AVG(wh.rating)::numeric, 2) as avg_rating,
    ROUND(AVG(wh.rating)::numeric, 2) as avg_movie_rating,
    NULL::numeric as avg_show_rating,
    COUNT(*)::int as movie_count,
    0 as show_count
FROM watch_history wh
JOIN movie_genres mg ON mg.movie_tmdb_id = wh.tmdb_id
JOIN genres g ON g.id = mg.genre_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
GROUP BY g.name
HAVING COUNT(*) >= 5
ORDER BY avg_rating DESC, total_count DESC;
