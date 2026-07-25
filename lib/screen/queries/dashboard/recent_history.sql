-- Recent watch history — queries live public.watch_history
WITH parsed_history AS (
  SELECT 
    wh.*,
    CASE 
      WHEN wh.media_key LIKE 'episode:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$' 
      THEN SPLIT_PART(wh.media_key, ':', 2)::integer 
      ELSE NULL 
    END AS parsed_show_id,
    CASE 
      WHEN wh.media_key LIKE 'episode:%:%:%' AND SPLIT_PART(wh.media_key, ':', 3) ~ '^[0-9]+$' 
      THEN SPLIT_PART(wh.media_key, ':', 3)::integer 
      ELSE NULL 
    END AS parsed_season_number,
    CASE 
      WHEN wh.media_key LIKE 'episode:%:%:%' AND SPLIT_PART(wh.media_key, ':', 4) ~ '^[0-9]+$' 
      THEN SPLIT_PART(wh.media_key, ':', 4)::integer 
      ELSE NULL 
    END AS parsed_episode_number
  FROM public.watch_history wh
  ORDER BY wh.watched_at DESC
  LIMIT 16
)
SELECT 
  ph.id AS history_id,
  ph.watched_at,
  CASE
    WHEN ph.media_type = 'movie' THEN ph.my_rating
    WHEN ph.media_type = 'episode' THEN s.my_rating
    ELSE NULL
  END AS my_rating,
  ph.media_type,
  ph.tmdb_id,
  CASE
    WHEN ph.media_type = 'movie' THEN m.title
    WHEN ph.media_type = 'episode' THEN s.name
    ELSE NULL
  END AS title,
  CASE
    WHEN ph.media_type = 'episode' THEN e.title
    ELSE NULL
  END AS episode_title,
  CASE
    WHEN ph.media_type = 'episode' THEN COALESCE(e.season_number, ph.parsed_season_number)
    ELSE NULL
  END AS season_number,
  CASE
    WHEN ph.media_type = 'episode' THEN COALESCE(e.episode_number, ph.parsed_episode_number)
    ELSE NULL
  END AS episode_number,
  CASE
    WHEN ph.media_type = 'movie' THEN m.poster_path
    WHEN ph.media_type = 'episode' THEN COALESCE(se.poster_path, s.poster_path)
    ELSE NULL
  END AS poster_path,
  CASE
    WHEN ph.media_type = 'movie' THEN m.release_date::TEXT
    ELSE NULL
  END AS release_date,
  CASE
    WHEN ph.media_type = 'episode' THEN COALESCE(e.show_tmdb_id, ph.parsed_show_id)
    ELSE NULL
  END AS show_tmdb_id
FROM parsed_history ph
LEFT JOIN public.movies m ON m.tmdb_id = ph.tmdb_id AND ph.media_type = 'movie'
LEFT JOIN public.episodes e ON (
  (ph.media_type = 'episode' AND e.tmdb_id = ph.tmdb_id)
  OR (
    ph.media_type = 'episode'
    AND ph.parsed_show_id IS NOT NULL 
    AND ph.parsed_season_number IS NOT NULL 
    AND ph.parsed_episode_number IS NOT NULL
    AND e.show_tmdb_id = ph.parsed_show_id
    AND e.season_number = ph.parsed_season_number
    AND e.episode_number = ph.parsed_episode_number
  )
)
LEFT JOIN public.shows s ON s.tmdb_id = COALESCE(e.show_tmdb_id, ph.parsed_show_id)
LEFT JOIN public.seasons se ON se.show_tmdb_id = COALESCE(e.show_tmdb_id, ph.parsed_show_id)
                          AND se.season_number = COALESCE(e.season_number, ph.parsed_season_number)
ORDER BY ph.watched_at DESC;
