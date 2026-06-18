(SELECT 'movie' as entity_type, to_jsonb(m.*) as data
 FROM movies m WHERE m.tmdb_id = 120 LIMIT 1)
UNION ALL
(SELECT 'show', to_jsonb(s.*)
 FROM shows s WHERE s.tmdb_id = 1411 LIMIT 1)
UNION ALL
(SELECT 'person', to_jsonb(p.*)
 FROM people p WHERE p.tmdb_id = 43286 LIMIT 1);
