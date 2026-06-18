-- Daily watch counts for heatmap (returns date as text to avoid timezone issues)
SELECT 
    to_char(watched_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') as watch_date,
    COUNT(*)::int as watch_count
FROM watch_history
GROUP BY to_char(watched_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD')
ORDER BY watch_date ASC;
