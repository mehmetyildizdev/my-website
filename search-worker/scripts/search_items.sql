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
  tmdb_id,
  name,
  NULL AS extra_name,
  profile_path AS image_path,
  popularity::float AS rating,
  known_for_department AS release_date
FROM public.people
WHERE profile_path IS NOT NULL AND profile_path != '';
