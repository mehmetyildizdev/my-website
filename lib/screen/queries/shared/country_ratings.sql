-- Average rating per production country with movie/show breakdown
WITH movie_ratings AS (
    SELECT mc.country_iso, wh.my_rating::numeric as rating
    FROM watch_history wh
    JOIN movies m ON m.tmdb_id = wh.tmdb_id
    JOIN movie_countries mc ON mc.movie_tmdb_id = m.tmdb_id
    WHERE wh.media_type = 'movie' AND wh.my_rating IS NOT NULL
),
show_ratings AS (
    SELECT DISTINCT sc.country_iso, s.tmdb_id as show_tmdb_id, s.my_rating::numeric as rating
    FROM shows s
    JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
    JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
    JOIN show_countries sc ON sc.show_tmdb_id = s.tmdb_id
    WHERE s.my_rating IS NOT NULL
),
all_ratings AS (
    SELECT country_iso, rating FROM movie_ratings
    UNION ALL
    SELECT country_iso, rating FROM show_ratings
),
counts AS (
    SELECT
        c.iso_3166_1 as country_code,
        c.name as country_name,
        (SELECT COUNT(*) FROM movie_ratings mr WHERE mr.country_iso = c.iso_3166_1)::int as movie_count,
        (SELECT COUNT(*) FROM show_ratings sr WHERE sr.country_iso = c.iso_3166_1)::int as show_count
    FROM countries c
)
SELECT
    ar.country_iso as country_code,
    c.name as country_name,
    ROUND(AVG(ar.rating)::numeric, 2) as avg_rating,
    ct.movie_count,
    ct.show_count
FROM all_ratings ar
JOIN countries c ON c.iso_3166_1 = ar.country_iso
JOIN counts ct ON ct.country_code = ar.country_iso
GROUP BY ar.country_iso, c.name, ct.movie_count, ct.show_count
HAVING COUNT(*) >= 3
ORDER BY avg_rating DESC;
