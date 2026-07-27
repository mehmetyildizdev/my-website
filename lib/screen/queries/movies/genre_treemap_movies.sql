-- Genre distribution for movies only (D1/SQLite version)
SELECT 
    name,
    SUM(watch_count) AS movie_count,
    0 AS show_count,
    SUM(watch_count) AS total_count
FROM chart_genre_metrics
WHERE media_type = 'movie'
GROUP BY name
ORDER BY total_count DESC;
