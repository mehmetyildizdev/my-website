-- Personal rating vs TMDB rating for rated shows only
SELECT
    'show' as media_type,
    s.name as title,
    s.tmdb_id,
    s.trakt_rating::int as my_rating,
    s.tmdb_rating,
    EXTRACT(YEAR FROM s.first_air_date)::int as release_year,
    ARRAY_AGG(DISTINCT g.name) as genres
FROM shows s
JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
LEFT JOIN show_genres sg ON sg.show_tmdb_id = s.tmdb_id
LEFT JOIN genres g ON g.id = sg.genre_id
WHERE s.trakt_rating IS NOT NULL
  AND s.tmdb_rating IS NOT NULL
GROUP BY s.tmdb_id, s.name, s.trakt_rating, s.tmdb_rating, s.first_air_date
ORDER BY s.trakt_rating DESC;
