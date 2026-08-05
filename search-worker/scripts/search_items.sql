SELECT 
  'movie' AS type,
  tmdb_id,
  title AS name,
  original_title AS extra_name,
  poster_path AS image_path,
  my_rating::float AS rating,
  release_date::text AS release_date
FROM public.movies

UNION ALL

SELECT 
  'show' AS type,
  tmdb_id,
  name,
  original_name AS extra_name,
  poster_path AS image_path,
  my_rating::float AS rating,
  first_air_date::text AS release_date
FROM public.shows

UNION ALL

SELECT 
  'person' AS type,
  people.tmdb_id,
  people.name,
  NULL AS extra_name,
  people.profile_path AS image_path,
  ROUND(ar.my_rating, 1)::float AS rating,
  people.known_for_department AS release_date
FROM public.people
LEFT JOIN analytics.actor__ratings ar ON ar.tmdb_id = people.tmdb_id
WHERE people.profile_path IS NOT NULL AND people.profile_path != '';
