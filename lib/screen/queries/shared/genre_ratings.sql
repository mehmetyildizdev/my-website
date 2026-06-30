-- Average rating per genre (movies + shows combined).
-- Only includes genres with 20+ rated items.
WITH watched_movies AS (
    SELECT tmdb_id, my_rating as rating FROM watch_history WHERE media_type = 'movie' AND my_rating IS NOT NULL
),
-- For shows, use the per-show my_rating (from `shows` table, populated by user's Trakt rating)
watched_shows AS (
    SELECT DISTINCT s.tmdb_id, s.my_rating as rating
    FROM shows s
    JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
    JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
    WHERE s.my_rating IS NOT NULL
),
genre_combined AS (
    -- Movie genres
    SELECT g.name as genre_name, wm.rating::numeric as rating, 'movie' as media_type
    FROM movie_genres mg
    JOIN genres g ON g.id = mg.genre_id
    JOIN watched_movies wm ON wm.tmdb_id = mg.movie_tmdb_id

    UNION ALL

    -- Show genres
    SELECT g.name as genre_name, ws.rating::numeric as rating, 'show' as media_type
    FROM show_genres sg
    JOIN genres g ON g.id = sg.genre_id
    JOIN watched_shows ws ON ws.tmdb_id = sg.show_tmdb_id
)
SELECT
    genre_name as name,
    COUNT(*)::int as total_count,
    ROUND(AVG(rating)::numeric, 2) as avg_rating,
    ROUND(AVG(CASE WHEN media_type = 'movie' THEN rating END)::numeric, 2) as avg_movie_rating,
    ROUND(AVG(CASE WHEN media_type = 'show'  THEN rating END)::numeric, 2) as avg_show_rating,
    COUNT(CASE WHEN media_type = 'movie' THEN 1 END)::int as movie_count,
    COUNT(CASE WHEN media_type = 'show'  THEN 1 END)::int as show_count
FROM genre_combined
GROUP BY genre_name
HAVING COUNT(*) >= 20
ORDER BY avg_rating DESC, total_count DESC;
