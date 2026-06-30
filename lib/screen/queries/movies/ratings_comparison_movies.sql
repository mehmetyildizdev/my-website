-- Personal rating vs TMDB rating for rated movies only
SELECT
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
ORDER BY wh.my_rating DESC;
