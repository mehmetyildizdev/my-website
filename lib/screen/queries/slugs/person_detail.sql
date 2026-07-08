-- Person detail (D1/SQLite & Postgres dynamic fallback version)
SELECT 
  COALESCE(
    sd.detail_json,
    jsonb_build_object(
      'tmdb_id', p.tmdb_id,
      'name', p.name,
      'profile_path', p.profile_path,
      'known_for_department', p.known_for_department,
      'biography', 'Biography not yet ingested. Check back after the next database sync.',
      'movies', COALESCE(
         (SELECT jsonb_agg(jsonb_build_object(
            'tmdb_id', mc.movie_tmdb_id,
            'title', m.title,
            'role', mc.character,
            'poster_path', m.poster_path,
            'release_date', m.release_date
          ))
          FROM public.movie_cast mc
          JOIN public.movies m ON m.tmdb_id = mc.movie_tmdb_id
          WHERE mc.person_tmdb_id = p.tmdb_id),
         '[]'::jsonb
      ),
      'shows', COALESCE(
         (SELECT jsonb_agg(jsonb_build_object(
            'tmdb_id', sc.show_tmdb_id,
            'title', s.name,
            'role', sc.character,
            'poster_path', s.poster_path,
            'release_date', s.first_air_date
          ))
          FROM public.show_cast sc
          JOIN public.shows s ON s.tmdb_id = sc.show_tmdb_id
          WHERE sc.person_tmdb_id = p.tmdb_id),
         '[]'::jsonb
      )
    )::text
  ) AS detail_json,
  ar.my_rating
FROM public.people p
LEFT JOIN slug_details sd ON sd.type = 'person' AND sd.tmdb_id = p.tmdb_id
LEFT JOIN actor__ratings ar ON ar.tmdb_id = p.tmdb_id
WHERE p.tmdb_id = $1;
