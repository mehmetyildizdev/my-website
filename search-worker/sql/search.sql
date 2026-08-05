WITH matched AS (
  SELECT si.type, si.tmdb_id, si.name, si.extra_name, si.image_path, si.rating, si.release_date
  FROM search_items_fts
  JOIN search_items si ON si.rowid = search_items_fts.rowid
  WHERE search_items_fts MATCH ?1

  UNION

  SELECT type, tmdb_id, name, extra_name, image_path, rating, release_date
  FROM search_items
  WHERE tmdb_id = ?2
)
SELECT type, tmdb_id, name, extra_name, image_path, rating, release_date
FROM matched
ORDER BY rating DESC, name ASC
LIMIT 60;
