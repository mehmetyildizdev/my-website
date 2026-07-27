-- Average rating per genre (shows only) (D1/SQLite version)
SELECT
    name,
    SUM(watch_count) AS total_count,
    ROUND(SUM(avg_rating * watch_count) / SUM(watch_count), 2) AS avg_rating,
    NULL AS avg_movie_rating,
    ROUND(SUM(avg_rating * watch_count) / SUM(watch_count), 2) AS avg_show_rating,
    0 AS movie_count,
    SUM(watch_count) AS show_count
FROM chart_genre_metrics
WHERE media_type = 'show'
GROUP BY name
HAVING SUM(watch_count) >= 3
ORDER BY avg_rating DESC, total_count DESC;
