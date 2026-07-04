-- Biggest binge days: most episodes of a single show watched in one day (D1/SQLite version)
SELECT show_name, show_tmdb_id, binge_date, episodes_watched, total_runtime_min
FROM chart_binge_patterns
ORDER BY episodes_watched DESC, total_runtime_min DESC
LIMIT 30;
