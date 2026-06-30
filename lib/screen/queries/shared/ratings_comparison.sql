-- Personal rating vs TMDB rating for all rated movies and shows
-- Returns individual items with genre and year info for client-side filtering
(SELECT
    'movie' as media_type,
    m.title,
    m.tmdb_id,
    wh.my_rating as my_rating,
    m.tmdb_rating,
    EXTRACT(YEAR FROM m.release_date)::int as release_year,
    ARRAY_AGG(DISTINCT g.name) as genres
FROM watch_history wh
JOIN movies m ON m.tmdb_id = wh.tmdb_id
LEFT JOIN movie_genres mg ON mg.movie_tmdb_id = m.tmdb_id
LEFT JOIN genres g ON g.id = mg.genre_id
WHERE wh.media_type = 'movie'
  AND wh.my_rating IS NOT NULL
  AND m.tmdb_rating IS NOT NULL
GROUP BY m.tmdb_id, m.title, wh.my_rating, m.tmdb_rating, m.release_date
ORDER BY wh.my_rating DESC)
UNION ALL
(SELECT
    'show' as media_type,
    s.name as title,
    s.tmdb_id,
    s.my_rating::int as my_rating,
    s.tmdb_rating,
    EXTRACT(YEAR FROM s.first_air_date)::int as release_year,
    ARRAY_AGG(DISTINCT g.name) as genres
FROM shows s
JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
LEFT JOIN show_genres sg ON sg.show_tmdb_id = s.tmdb_id
LEFT JOIN genres g ON g.id = sg.genre_id
WHERE s.my_rating IS NOT NULL
  AND s.tmdb_rating IS NOT NULL
GROUP BY s.tmdb_id, s.name, s.my_rating, s.tmdb_rating, s.first_air_date
ORDER BY s.my_rating DESC);
