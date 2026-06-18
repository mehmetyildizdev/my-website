-- Gender representation breakdown by role type in watched movies
SELECT
  CASE p.gender
    WHEN 1 THEN 'Female'
    WHEN 2 THEN 'Male'
    ELSE 'Unknown'
  END AS gender,
  'Acting' AS department,
  COUNT(DISTINCT p.tmdb_id)::int AS count,
  ROUND(AVG(wh.rating), 2) AS avg_rating
FROM watch_history wh
JOIN movie_cast mc ON mc.movie_tmdb_id = wh.tmdb_id
JOIN people p ON p.tmdb_id = mc.person_tmdb_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
GROUP BY 1

UNION ALL

SELECT
  CASE p.gender
    WHEN 1 THEN 'Female'
    WHEN 2 THEN 'Male'
    ELSE 'Unknown'
  END AS gender,
  'Directing' AS department,
  COUNT(DISTINCT p.tmdb_id)::int AS count,
  ROUND(AVG(wh.rating), 2) AS avg_rating
FROM watch_history wh
JOIN movie_crew mcr ON mcr.movie_tmdb_id = wh.tmdb_id
JOIN people p ON p.tmdb_id = mcr.person_tmdb_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
  AND mcr.job = 'Director'
GROUP BY 1

UNION ALL

SELECT
  CASE p.gender
    WHEN 1 THEN 'Female'
    WHEN 2 THEN 'Male'
    ELSE 'Unknown'
  END AS gender,
  'Writing' AS department,
  COUNT(DISTINCT p.tmdb_id)::int AS count,
  ROUND(AVG(wh.rating), 2) AS avg_rating
FROM watch_history wh
JOIN movie_crew mcr ON mcr.movie_tmdb_id = wh.tmdb_id
JOIN people p ON p.tmdb_id = mcr.person_tmdb_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
  AND mcr.job IN ('Writer', 'Screenplay', 'Story')
GROUP BY 1

UNION ALL

SELECT
  CASE p.gender
    WHEN 1 THEN 'Female'
    WHEN 2 THEN 'Male'
    ELSE 'Unknown'
  END AS gender,
  'Production' AS department,
  COUNT(DISTINCT p.tmdb_id)::int AS count,
  ROUND(AVG(wh.rating), 2) AS avg_rating
FROM watch_history wh
JOIN movie_crew mcr ON mcr.movie_tmdb_id = wh.tmdb_id
JOIN people p ON p.tmdb_id = mcr.person_tmdb_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
  AND mcr.job IN ('Producer', 'Executive Producer')
GROUP BY 1

ORDER BY department, count DESC;
