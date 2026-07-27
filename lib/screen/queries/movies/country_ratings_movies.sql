-- Average rating per production country (movies only) (D1/SQLite version)
SELECT
    id_or_code AS country_code,
    name AS country_name,
    avg_rating,
    count AS movie_count,
    0 AS show_count
FROM chart_production_metrics
WHERE type = 'country' AND count >= 3
ORDER BY avg_rating DESC;
