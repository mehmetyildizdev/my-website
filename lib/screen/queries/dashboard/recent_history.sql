-- Recent watch history — queries live public.watch_history (never cached)
SELECT
  wh.id AS history_id,
  wh.watched_at,
  CASE
    WHEN wh.media_type = 'movie' THEN wh.my_rating
    WHEN wh.media_type = 'episode' THEN s.my_rating
    ELSE NULL
  END AS my_rating,
  wh.media_type,
  wh.tmdb_id,
  CASE
    WHEN wh.media_type = 'movie' THEN m.title
    WHEN wh.media_type = 'episode' THEN s.name
    ELSE NULL
  END AS title,
  CASE
    WHEN wh.media_type = 'episode' THEN e.title
    ELSE NULL
  END AS episode_title,
  CASE WHEN wh.media_type = 'episode' THEN e.season_number ELSE NULL END AS season_number,
  CASE WHEN wh.media_type = 'episode' THEN e.episode_number ELSE NULL END AS episode_number,
  CASE
    WHEN wh.media_type = 'movie' THEN m.poster_path
    WHEN wh.media_type = 'episode' THEN s.poster_path
    ELSE NULL
  END AS poster_path,
  CASE
    WHEN wh.media_type = 'movie' THEN m.release_date::TEXT
    ELSE NULL
  END AS release_date,
  CASE WHEN wh.media_type = 'episode' THEN e.show_tmdb_id ELSE NULL END AS show_tmdb_id
FROM public.watch_history wh
LEFT JOIN public.movies m ON m.tmdb_id = wh.tmdb_id AND wh.media_type = 'movie'
LEFT JOIN public.episodes e ON e.tmdb_id = wh.tmdb_id AND wh.media_type = 'episode'
LEFT JOIN public.shows s ON s.tmdb_id = e.show_tmdb_id
ORDER BY wh.watched_at DESC
LIMIT 16;
