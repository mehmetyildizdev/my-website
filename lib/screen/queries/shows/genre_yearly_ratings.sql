-- Average personal rating per genre per release year (1980+) for shows (D1/SQLite version)
SELECT
    name,
    year,
    avg_rating,
    watch_count AS count
FROM chart_genre_metrics
WHERE media_type = 'show' AND year >= 1980 AND watch_count >= 1
ORDER BY name, year;
