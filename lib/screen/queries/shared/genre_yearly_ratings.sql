-- Average personal rating per genre per release year (1980+) (D1/SQLite version)
SELECT
    name,
    year,
    ROUND(SUM(avg_rating * watch_count) / SUM(watch_count), 2) AS avg_rating,
    SUM(watch_count) AS count
FROM chart_genre_metrics
WHERE year >= 1980
GROUP BY name, year
HAVING SUM(watch_count) >= 1
ORDER BY name, year;
