-- Person detail: full info for a single person by tmdb_id consolidated with movies and shows
SELECT 
  p.tmdb_id, p.imdb_id, p.name, p.profile_path, p.known_for_department,
  p.popularity, p.birth_date, p.gender, p.deathday,
  (SELECT COUNT(*)::int FROM movie_cast mc 
   JOIN watch_history wh ON wh.tmdb_id = mc.movie_tmdb_id AND wh.media_type = 'movie'
   WHERE mc.person_tmdb_id = p.tmdb_id) as movies_watched,
  (SELECT AVG(m2.trakt_rating)::numeric(3,2)
   FROM movie_cast mc2
   JOIN movies m2 ON m2.tmdb_id = mc2.movie_tmdb_id
   WHERE mc2.person_tmdb_id = p.tmdb_id AND m2.trakt_rating IS NOT NULL) as avg_movie_rating,

  -- Consolidate movies (limiting to 60)
  (SELECT COALESCE(json_agg(json_build_object(
     'tmdb_id', m_sub.tmdb_id, 
     'title', m_sub.title, 
     'poster_path', m_sub.poster_path, 
     'release_date', m_sub.release_date, 
     'trakt_rating', m_sub.trakt_rating,
     'role', m_sub.role,
     'watched_at', m_sub.watched_at, 
     'user_rating', m_sub.user_rating
   )), '[]'::json)
   FROM (
     SELECT 
       m.tmdb_id, m.title, m.poster_path, m.release_date, m.trakt_rating,
       COALESCE(mc.character, mcr.job) as role,
       wh.watched_at, wh.rating as user_rating
     FROM movies m
     JOIN watch_history wh ON wh.tmdb_id = m.tmdb_id AND wh.media_type = 'movie'
     LEFT JOIN movie_cast mc ON mc.movie_tmdb_id = m.tmdb_id AND mc.person_tmdb_id = p.tmdb_id
     LEFT JOIN movie_crew mcr ON mcr.movie_tmdb_id = m.tmdb_id AND mcr.person_tmdb_id = p.tmdb_id
     WHERE mc.person_tmdb_id = p.tmdb_id OR mcr.person_tmdb_id = p.tmdb_id
     ORDER BY wh.watched_at DESC
     LIMIT 60
   ) m_sub) as movies,

  -- Consolidate shows
  (SELECT COALESCE(json_agg(json_build_object(
     'tmdb_id', s_sub.tmdb_id, 
     'title', s_sub.title, 
     'poster_path', s_sub.poster_path, 
     'release_date', s_sub.release_date, 
     'trakt_rating', s_sub.trakt_rating,
     'role', s_sub.role,
     'watched_eps', s_sub.watched_eps
   )), '[]'::json)
   FROM (
     WITH watched_episodes AS (
         SELECT 
             e.show_tmdb_id,
             COUNT(wh.id)::int as watched_eps
         FROM episodes e
         JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
         GROUP BY e.show_tmdb_id
     )
     SELECT DISTINCT ON (s.tmdb_id)
       s.tmdb_id, 
       s.name as title, 
       s.poster_path, 
       s.first_air_date as release_date, 
       s.trakt_rating,
       COALESCE(sc.character, scr.job) as role,
       we.watched_eps
     FROM shows s
     JOIN watched_episodes we ON we.show_tmdb_id = s.tmdb_id
     LEFT JOIN show_cast sc ON sc.show_tmdb_id = s.tmdb_id AND sc.person_tmdb_id = p.tmdb_id
     LEFT JOIN show_crew scr ON scr.show_tmdb_id = s.tmdb_id AND scr.person_tmdb_id = p.tmdb_id
     WHERE sc.person_tmdb_id = p.tmdb_id OR scr.person_tmdb_id = p.tmdb_id
     ORDER BY s.tmdb_id, we.watched_eps DESC
   ) s_sub) as shows

FROM people p
WHERE p.tmdb_id = $1;
