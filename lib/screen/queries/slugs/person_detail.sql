-- Person detail (D1/SQLite version)
SELECT detail_json
FROM slug_details
WHERE type = 'person' AND tmdb_id = $1;
