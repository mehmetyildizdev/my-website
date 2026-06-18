-- Movie detail: full info for a single movie by tmdb_id consolidated with
-- genres, cast, crew, production companies, countries and collection.
SELECT 
  m.tmdb_id, m.imdb_id, m.title, m.original_title, m.original_language,
  m.release_date, m.runtime, m.poster_path, m.backdrop_path, m.overview,
  m.tmdb_rating, m.trakt_rating, m.collection_id,
  (SELECT COUNT(*)::int FROM watch_history wh WHERE wh.tmdb_id = m.tmdb_id AND wh.media_type = 'movie') as watch_count,
  (SELECT MAX(wh.watched_at) FROM watch_history wh WHERE wh.tmdb_id = m.tmdb_id AND wh.media_type = 'movie') as last_watched_at,

  -- Collection name (franchise / box set)
  (SELECT c.name FROM collections c WHERE c.tmdb_id = m.collection_id) as collection_name,

  -- Genres
  (SELECT COALESCE(json_agg(json_build_object('name', g.name)), '[]'::json)
   FROM movie_genres mg 
   JOIN genres g ON g.id = mg.genre_id 
   WHERE mg.movie_tmdb_id = m.tmdb_id) as genres,

  -- Production countries
  (SELECT COALESCE(json_agg(json_build_object('iso', co.iso_3166_1, 'name', co.name)), '[]'::json)
   FROM movie_countries mco
   JOIN countries co ON co.iso_3166_1 = mco.country_iso
   WHERE mco.movie_tmdb_id = m.tmdb_id) as countries,

  -- Production companies
  (SELECT COALESCE(json_agg(json_build_object('tmdb_id', pc.tmdb_id, 'name', pc.name, 'logo_path', pc.logo_path)), '[]'::json)
   FROM movie_production_companies mpc
   JOIN production_companies pc ON pc.tmdb_id = mpc.company_tmdb_id
   WHERE mpc.movie_tmdb_id = m.tmdb_id) as companies,

  -- Cast (with billing order)
  (SELECT COALESCE(json_agg(json_build_object(
     'tmdb_id', p.tmdb_id, 'name', p.name, 'profile_path', p.profile_path,
     'character', mc.character, 'cast_order', mc.cast_order
   ) ORDER BY mc.cast_order NULLS LAST), '[]'::json)
   FROM movie_cast mc 
   JOIN people p ON p.tmdb_id = mc.person_tmdb_id 
   WHERE mc.movie_tmdb_id = m.tmdb_id) as cast,

  -- Crew
  (SELECT COALESCE(json_agg(json_build_object(
     'tmdb_id', p.tmdb_id, 'name', p.name, 'profile_path', p.profile_path, 'job', mcr.job
   )), '[]'::json)
   FROM movie_crew mcr 
   JOIN people p ON p.tmdb_id = mcr.person_tmdb_id 
   WHERE mcr.movie_tmdb_id = m.tmdb_id) as crew

FROM movies m
WHERE m.tmdb_id = $1;
