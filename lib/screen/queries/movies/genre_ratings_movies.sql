-- Average rating per genre (movies only) (D1/SQLite version)
SELECT
    name,
    SUM(watch_count) AS total_count,
    ROUND(SUM(avg_rating * watch_count) / SUM(watch_count), 2) AS avg_rating,
    ROUND(SUM(avg_rating * watch_count) / SUM(watch_count), 2) AS avg_movie_rating,
    NULL AS avg_show_rating,
    SUM(watch_count) AS movie_count,
    0 AS show_count
FROM chart_genre_metrics
WHERE media_type = 'movie'
GROUP BY name
HAVING SUM(watch_count) >= 5
ORDER BY avg_rating DESC, total_count DESC;
