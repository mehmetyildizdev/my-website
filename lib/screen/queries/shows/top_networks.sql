-- Top TV networks by average show rating (min 3 shows) (D1/SQLite version)
SELECT
    CAST(id_or_code AS integer) AS tmdb_id,
    name,
    logo_path,
    country_iso,
    avg_rating,
    count AS show_count
FROM chart_production_metrics
WHERE type = 'network' AND count >= 3
ORDER BY avg_rating DESC, show_count DESC
LIMIT 50;
