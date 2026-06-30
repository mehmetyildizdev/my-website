-- Average rating per genre (shows only)
WITH watched_shows AS (
    SELECT DISTINCT s.tmdb_id, s.my_rating as rating
    FROM shows s
    JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
    JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
    WHERE s.my_rating IS NOT NULL
)
SELECT
    g.name as name,
    COUNT(*)::int as total_count,
    ROUND(AVG(ws.rating)::numeric, 2) as avg_rating,
    NULL::numeric as avg_movie_rating,
    ROUND(AVG(ws.rating)::numeric, 2) as avg_show_rating,
    0 as movie_count,
    COUNT(*)::int as show_count
FROM show_genres sg
JOIN genres g ON g.id = sg.genre_id
JOIN watched_shows ws ON ws.tmdb_id = sg.show_tmdb_id
GROUP BY g.name
HAVING COUNT(*) >= 3
ORDER BY avg_rating DESC, total_count DESC;
