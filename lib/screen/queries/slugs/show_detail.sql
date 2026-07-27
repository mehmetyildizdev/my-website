-- Show detail (D1/SQLite version)
SELECT detail_json
FROM slug_details
WHERE type = 'show' AND tmdb_id = $1;
