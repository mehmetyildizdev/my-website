-- Detailed watch stats per entry for client-side filtering by date (D1/SQLite version)
SELECT
  media_type,
  watched_at,
  runtime_minutes,
  COALESCE(show_tmdb_id, tmdb_id) AS show_or_movie_id,
  CASE 
    WHEN countries_str IS NOT NULL AND countries_str != '' 
    THEN '["' || replace(countries_str, ',', '","') || '"]' 
    ELSE '[]' 
  END AS countries
FROM chart_watch_activity
ORDER BY watched_at ASC;
