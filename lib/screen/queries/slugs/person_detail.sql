-- Person detail (D1/SQLite version)
SELECT 
  sd.detail_json,
  ar.my_rating
FROM slug_details sd
LEFT JOIN actor__ratings ar ON ar.tmdb_id = sd.tmdb_id
WHERE sd.type = 'person' AND sd.tmdb_id = $1;
