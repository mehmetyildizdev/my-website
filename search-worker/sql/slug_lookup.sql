SELECT
  sd.detail_json,
  CASE
    WHEN sd.tmdb_id IS NOT NULL THEN 'available'
    WHEN si.tmdb_id IS NOT NULL THEN 'excluded'
    ELSE 'pending'
  END AS state
FROM (SELECT ?1 AS type, ?2 AS tmdb_id) requested
LEFT JOIN slug_details sd
  ON sd.type = requested.type AND sd.tmdb_id = requested.tmdb_id
LEFT JOIN search_items si
  ON si.type = requested.type AND si.tmdb_id = requested.tmdb_id;
