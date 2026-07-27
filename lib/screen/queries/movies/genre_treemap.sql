-- Genre distribution with movies and shows
SELECT
    m.name,
    COALESCE(m.movie_count, 0) AS movie_count,
    COALESCE(s.show_count, 0) AS show_count,
    (COALESCE(m.movie_count, 0) + COALESCE(s.show_count, 0)) AS total_count
FROM (
    SELECT name, SUM(watch_count) AS movie_count FROM chart_genre_metrics WHERE media_type = 'movie' GROUP BY name
) m
LEFT JOIN (
    SELECT name, SUM(watch_count) AS show_count FROM chart_genre_metrics WHERE media_type = 'show' GROUP BY name
) s ON s.name = m.name
ORDER BY total_count DESC;
