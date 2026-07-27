-- Top genres by watch count (D1/SQLite version)
SELECT name, SUM(watch_count) as watch_count
FROM chart_genre_metrics
GROUP BY name
ORDER BY watch_count DESC
LIMIT 5;
