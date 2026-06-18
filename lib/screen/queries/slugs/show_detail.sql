-- Show detail: full info for a single show by tmdb_id consolidated with genres,
-- cast, crew, networks, production companies and countries.
SELECT 
  s.tmdb_id, s.imdb_id, s.name, s.original_name, s.original_language,
  s.first_air_date, s.poster_path, s.backdrop_path, s.overview,
  s.number_of_episodes, s.number_of_seasons,
  s.tmdb_rating, s.trakt_rating,
  (SELECT COUNT(*)::int FROM watch_history wh 
   JOIN episodes e ON e.tmdb_id = wh.tmdb_id AND wh.media_type = 'episode'
   WHERE e.show_tmdb_id = s.tmdb_id) as episodes_watched,
  (SELECT MAX(wh.watched_at) FROM watch_history wh 
   JOIN episodes e ON e.tmdb_id = wh.tmdb_id AND wh.media_type = 'episode'
   WHERE e.show_tmdb_id = s.tmdb_id) as last_watched_at,

  -- Genres
  (SELECT COALESCE(json_agg(json_build_object('name', g.name)), '[]'::json)
   FROM show_genres sg 
   JOIN genres g ON g.id = sg.genre_id 
   WHERE sg.show_tmdb_id = s.tmdb_id) as genres,

  -- Production countries
  (SELECT COALESCE(json_agg(json_build_object('iso', co.iso_3166_1, 'name', co.name)), '[]'::json)
   FROM show_countries sco
   JOIN countries co ON co.iso_3166_1 = sco.country_iso
   WHERE sco.show_tmdb_id = s.tmdb_id) as countries,

  -- Networks
  (SELECT COALESCE(json_agg(json_build_object('tmdb_id', n.tmdb_id, 'name', n.name, 'logo_path', n.logo_path)), '[]'::json)
   FROM show_networks sn
   JOIN networks n ON n.tmdb_id = sn.network_tmdb_id
   WHERE sn.show_tmdb_id = s.tmdb_id) as networks,

  -- Production companies
  (SELECT COALESCE(json_agg(json_build_object('tmdb_id', pc.tmdb_id, 'name', pc.name, 'logo_path', pc.logo_path)), '[]'::json)
   FROM show_production_companies spc
   JOIN production_companies pc ON pc.tmdb_id = spc.company_tmdb_id
   WHERE spc.show_tmdb_id = s.tmdb_id) as companies,

  -- Cast (with episode counts)
  (SELECT COALESCE(json_agg(json_build_object(
     'tmdb_id', p.tmdb_id, 'name', p.name, 'profile_path', p.profile_path,
     'character', sc.character, 'episode_count', sc.episode_count
   ) ORDER BY sc.episode_count DESC NULLS LAST), '[]'::json)
   FROM show_cast sc 
   JOIN people p ON p.tmdb_id = sc.person_tmdb_id 
   WHERE sc.show_tmdb_id = s.tmdb_id) as cast,

  -- Crew
  (SELECT COALESCE(json_agg(json_build_object(
     'tmdb_id', p.tmdb_id, 'name', p.name, 'profile_path', p.profile_path, 'job', scr.job
   )), '[]'::json)
   FROM show_crew scr 
   JOIN people p ON p.tmdb_id = scr.person_tmdb_id 
   WHERE scr.show_tmdb_id = s.tmdb_id) as crew

FROM shows s
WHERE s.tmdb_id = $1;
