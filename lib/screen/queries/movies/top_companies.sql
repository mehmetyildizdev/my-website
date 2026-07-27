-- Top production companies by average rating (min 5 items) (D1/SQLite version)
SELECT
    CAST(id_or_code AS integer) AS tmdb_id,
    name,
    logo_path,
    country_iso,
    avg_rating,
    count AS movie_count
FROM chart_production_metrics
WHERE type = 'company' AND count >= 5
ORDER BY avg_rating DESC, movie_count DESC
LIMIT 50;
