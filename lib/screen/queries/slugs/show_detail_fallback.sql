-- Fallback query for show detail when slug_details cache row is missing
SELECT 
  s.tmdb_id,
  s.imdb_id,
  s.name,
  s.original_name,
  s.original_language,
  s.first_air_date::text AS first_air_date,
  s.poster_path,
  s.backdrop_path,
  s.overview,
  s.number_of_episodes,
  s.number_of_seasons,
  s.tmdb_rating,
  s.my_rating,
  (
    SELECT COUNT(*)::int 
    FROM public.watch_history wh 
    WHERE wh.media_type = 'episode' 
      AND (
        wh.tmdb_id IN (SELECT e.tmdb_id FROM public.episodes e WHERE e.show_tmdb_id = s.tmdb_id)
        OR wh.media_key LIKE 'episode:' || s.tmdb_id || ':%'
      )
  ) AS episodes_watched,
  (
    SELECT MAX(wh.watched_at)::text 
    FROM public.watch_history wh 
    WHERE wh.media_type = 'episode' 
      AND (
        wh.tmdb_id IN (SELECT e.tmdb_id FROM public.episodes e WHERE e.show_tmdb_id = s.tmdb_id)
        OR wh.media_key LIKE 'episode:' || s.tmdb_id || ':%'
      )
  ) AS last_watched_at,
  COALESCE(
    (SELECT json_agg(json_build_object('name', g.name))
     FROM public.show_genres sg JOIN public.genres g ON g.id = sg.genre_id
     WHERE sg.show_tmdb_id = s.tmdb_id), '[]'::json
  ) AS genres,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'tmdb_id', p.tmdb_id,
       'name', p.name,
       'profile_path', p.profile_path,
       'character', sc.character,
       'episode_count', sc.episode_count
     ) ORDER BY COALESCE(sc.episode_count, 0) DESC)
     FROM public.show_cast sc JOIN public.people p ON p.tmdb_id = sc.person_tmdb_id
     WHERE sc.show_tmdb_id = s.tmdb_id), '[]'::json
  ) AS cast,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'tmdb_id', p.tmdb_id,
       'name', p.name,
       'profile_path', p.profile_path,
       'job', scr.job
     ))
     FROM public.show_crew scr JOIN public.people p ON p.tmdb_id = scr.person_tmdb_id
     WHERE scr.show_tmdb_id = s.tmdb_id), '[]'::json
  ) AS crew,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'iso_3166_1', co.iso_3166_1,
       'name', co.name
     ))
     FROM public.show_countries sc JOIN public.countries co ON co.iso_3166_1 = sc.country_iso
     WHERE sc.show_tmdb_id = s.tmdb_id), '[]'::json
  ) AS countries,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'tmdb_id', pc.tmdb_id,
       'name', pc.name,
       'logo_path', pc.logo_path,
       'country_iso', pc.country_iso
     ))
     FROM public.show_production_companies spc JOIN public.production_companies pc ON pc.tmdb_id = spc.company_tmdb_id
     WHERE spc.show_tmdb_id = s.tmdb_id), '[]'::json
  ) AS companies,
  COALESCE(
    (SELECT json_agg(json_build_object(
       'tmdb_id', n.tmdb_id,
       'name', n.name,
       'logo_path', n.logo_path
     ))
     FROM public.show_networks sn JOIN public.networks n ON n.tmdb_id = sn.network_tmdb_id
     WHERE sn.show_tmdb_id = s.tmdb_id), '[]'::json
  ) AS networks
FROM public.shows s
WHERE s.tmdb_id = $1;
