-- Daily watch counts for heatmap (returns date as text) (D1/SQLite version)
SELECT
    watched_at AS watch_date,
    COUNT(*) AS watch_count
FROM chart_watch_activity
GROUP BY watched_at
ORDER BY watch_date ASC;
