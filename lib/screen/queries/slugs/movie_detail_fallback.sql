-- Fallback query for movie detail when slug_details cache row is missing
SELECT 
  m.tmdb_id,
  m.imdb_id,
  m.title,
  m.original_title,
  m.original_language,
  m.release_date::text AS release_date,
  m.runtime,
  m.poster_path,
  m.backdrop_path,
  m.overview,
  m.tmdb_rating,
  m.my_rating,
  m.collection_id,
  c.name AS collection_name,
  (
    SELECT COUNT(*)::int 
    FROM public.watch_history wh 
    WHERE wh.tmdb_id = m.tmdb_id AND (wh.media_type = 'movie' OR wh.media_key LIKE 'movie:%')
  ) AS watch_count,
  (
    SELECT MAX(wh.watched_at)::text 
    FROM public.watch_history wh 
    WHERE wh.tmdb_id = m.tmdb_id AND (wh.media_type = 'movie' OR wh.media_key LIKE 'movie:%')
  ) AS last_watched_at,
  COALESCE(
    (SELECT json_agg(json_build_object('name', g.name))
     FROM public.movie_genres mg JOIN public.genres g ON g.id = mg.genre_id
     WHERE mg.movie_tmdb_id = m.tmdb_id), '[]'::json
  ) AS genres,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'tmdb_id', p.tmdb_id,
       'name', p.name,
       'profile_path', p.profile_path,
       'character', mc.character,
       'cast_order', mc.cast_order
     ) ORDER BY mc.cast_order ASC)
     FROM public.movie_cast mc JOIN public.people p ON p.tmdb_id = mc.person_tmdb_id
     WHERE mc.movie_tmdb_id = m.tmdb_id), '[]'::json
  ) AS cast,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'tmdb_id', p.tmdb_id,
       'name', p.name,
       'profile_path', p.profile_path,
       'job', mcr.job
     ))
     FROM public.movie_crew mcr JOIN public.people p ON p.tmdb_id = mcr.person_tmdb_id
     WHERE mcr.movie_tmdb_id = m.tmdb_id), '[]'::json
  ) AS crew,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'iso_3166_1', co.iso_3166_1,
       'name', co.name
     ))
     FROM public.movie_countries mc JOIN public.countries co ON co.iso_3166_1 = mc.country_iso
     WHERE mc.movie_tmdb_id = m.tmdb_id), '[]'::json
  ) AS countries,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'tmdb_id', pc.tmdb_id,
       'name', pc.name,
       'logo_path', pc.logo_path,
       'country_iso', pc.country_iso
     ))
     FROM public.movie_production_companies mpc JOIN public.production_companies pc ON pc.tmdb_id = mpc.company_tmdb_id
     WHERE mpc.movie_tmdb_id = m.tmdb_id), '[]'::json
  ) AS companies
FROM public.movies m
LEFT JOIN public.collections c ON c.tmdb_id = m.collection_id
WHERE m.tmdb_id = $1;
