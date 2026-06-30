-- Average personal rating per genre per release year (1980+)
WITH genre_split AS (
    -- Movie genres
    SELECT g.name as genre_name, wh.my_rating::numeric as rating,
           EXTRACT(YEAR FROM m.release_date)::int as release_year
    FROM watch_history wh
    JOIN movies m ON m.tmdb_id = wh.tmdb_id
    JOIN movie_genres mg ON mg.movie_tmdb_id = m.tmdb_id
    JOIN genres g ON g.id = mg.genre_id
    WHERE wh.media_type = 'movie'
      AND wh.my_rating IS NOT NULL
      AND m.release_date IS NOT NULL
      AND EXTRACT(YEAR FROM m.release_date) >= 1980

    UNION ALL

    -- Show genres
    SELECT g.name as genre_name, s.my_rating::numeric as rating,
           EXTRACT(YEAR FROM s.first_air_date)::int as release_year
    FROM shows s
    JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
    JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
    JOIN show_genres sg ON sg.show_tmdb_id = s.tmdb_id
    JOIN genres g ON g.id = sg.genre_id
    WHERE s.my_rating IS NOT NULL
      AND s.first_air_date IS NOT NULL
      AND EXTRACT(YEAR FROM s.first_air_date) >= 1980
)
SELECT
    genre_name as name,
    release_year as year,
    ROUND(AVG(rating)::numeric, 2) as avg_rating,
    COUNT(*)::int as count
FROM genre_split
GROUP BY genre_name, release_year
HAVING COUNT(*) >= 2
ORDER BY genre_name, release_year;
