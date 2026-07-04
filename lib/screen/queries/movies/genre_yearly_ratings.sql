-- Average personal rating per genre per release year (1980+) for movies (D1/SQLite version)
SELECT
    name,
    year,
    avg_rating,
    watch_count AS count
FROM chart_genre_metrics
WHERE media_type = 'movie' AND year >= 1980 AND watch_count >= 2
ORDER BY name, year;
