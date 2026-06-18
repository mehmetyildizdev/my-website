-- Average rating per production country (movies only)
SELECT
    mc.country_iso as country_code,
    c.name as country_name,
    ROUND(AVG(wh.rating)::numeric, 2) as avg_rating,
    COUNT(*)::int as movie_count,
    0 as show_count
FROM watch_history wh
JOIN movies m ON m.tmdb_id = wh.tmdb_id
JOIN movie_countries mc ON mc.movie_tmdb_id = m.tmdb_id
JOIN countries c ON c.iso_3166_1 = mc.country_iso
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
GROUP BY mc.country_iso, c.name
HAVING COUNT(*) >= 3
ORDER BY avg_rating DESC;
