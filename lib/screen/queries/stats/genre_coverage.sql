-- Count of movies and shows mapped per genre (to check for old combined genres)
SELECT 
    g.id,
    g.name,
    COUNT(DISTINCT mg.movie_tmdb_id)::int as movie_count,
    COUNT(DISTINCT sg.show_tmdb_id)::int as show_count
FROM genres g
LEFT JOIN movie_genres mg ON mg.genre_id = g.id
LEFT JOIN show_genres sg ON sg.genre_id = g.id
GROUP BY g.id, g.name
ORDER BY g.name ASC;
