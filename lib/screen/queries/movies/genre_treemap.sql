-- Genre distribution with movies and shows
WITH watched_movies AS (
    SELECT tmdb_id FROM watch_history WHERE media_type = 'movie'
),
watched_shows AS (
    SELECT DISTINCT e.show_tmdb_id
    FROM episodes e
    JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
),
-- Movie genres
movie_genre AS (
    SELECT mg.movie_tmdb_id, g.name as genre_name
    FROM movie_genres mg
    JOIN genres g ON g.id = mg.genre_id
    JOIN watched_movies wm ON wm.tmdb_id = mg.movie_tmdb_id
),
-- Show genres
show_genre AS (
    SELECT sg.show_tmdb_id, g.name as genre_name
    FROM show_genres sg
    JOIN genres g ON g.id = sg.genre_id
    JOIN watched_shows ws ON ws.show_tmdb_id = sg.show_tmdb_id
)
SELECT 
    genre_name as name,
    COUNT(DISTINCT movie_id)::int as movie_count,
    COUNT(DISTINCT show_id)::int as show_count,
    (COUNT(DISTINCT movie_id) + COUNT(DISTINCT show_id))::int as total_count
FROM (
    SELECT genre_name, movie_tmdb_id as movie_id, NULL::int as show_id
    FROM movie_genre
    UNION ALL
    SELECT genre_name, NULL::int as movie_id, show_tmdb_id as show_id
    FROM show_genre
) combined
GROUP BY genre_name
ORDER BY total_count DESC;
