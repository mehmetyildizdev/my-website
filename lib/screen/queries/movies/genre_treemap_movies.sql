-- Genre distribution for movies only
SELECT 
    g.name as name,
    COUNT(DISTINCT mg.movie_tmdb_id)::int as movie_count,
    0 as show_count,
    COUNT(DISTINCT mg.movie_tmdb_id)::int as total_count
FROM movie_genres mg
JOIN genres g ON g.id = mg.genre_id
JOIN watch_history wh ON wh.tmdb_id = mg.movie_tmdb_id AND wh.media_type = 'movie'
GROUP BY g.name
ORDER BY total_count DESC;
