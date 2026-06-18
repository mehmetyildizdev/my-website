SELECT g.name, COUNT(*)::int as watch_count
FROM watch_history wh
LEFT JOIN movie_genres mg ON mg.movie_tmdb_id = wh.tmdb_id AND wh.media_type = 'movie'
LEFT JOIN show_genres sg ON sg.show_tmdb_id = wh.tmdb_id AND wh.media_type = 'show'
JOIN genres g ON g.id = COALESCE(mg.genre_id, sg.genre_id)
GROUP BY g.name
ORDER BY watch_count DESC
LIMIT 5;
