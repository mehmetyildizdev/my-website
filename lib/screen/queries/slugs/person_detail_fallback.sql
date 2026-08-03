-- Fallback query for person detail from Neon DB tables
SELECT 
  p.tmdb_id,
  p.name,
  p.profile_path,
  p.known_for_department,
  p.birth_date::text AS birth_date,
  p.deathday::text AS deathday,
  p.place_of_birth,
  p.gender,
  p.imdb_id,
  p.popularity,
  'Biography not yet ingested. Check back after the next database sync.' AS biography,
  COALESCE(
     (SELECT jsonb_agg(jsonb_build_object(
        'tmdb_id', mc.movie_tmdb_id,
        'title', m.title,
        'role', mc.character,
        'poster_path', m.poster_path,
        'release_date', m.release_date::text
      ))
      FROM public.movie_cast mc
      JOIN public.movies m ON m.tmdb_id = mc.movie_tmdb_id
      WHERE mc.person_tmdb_id = p.tmdb_id),
     '[]'::jsonb
  ) AS movies,
  COALESCE(
     (SELECT jsonb_agg(jsonb_build_object(
        'tmdb_id', sc.show_tmdb_id,
        'title', s.name,
        'role', sc.character,
        'poster_path', s.poster_path,
        'release_date', s.first_air_date::text
      ))
      FROM public.show_cast sc
      JOIN public.shows s ON s.tmdb_id = sc.show_tmdb_id
      WHERE sc.person_tmdb_id = p.tmdb_id),
     '[]'::jsonb
  ) AS shows
FROM public.people p
WHERE p.tmdb_id = $1;
