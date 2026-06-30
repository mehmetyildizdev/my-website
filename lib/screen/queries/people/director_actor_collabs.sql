-- Frequent director-actor collaborations in watched movies
-- Directors paired with lead/supporting actors across 3+ films
WITH director_movies AS (
  SELECT
    mcr.person_tmdb_id AS director_id,
    p.name AS director_name,
    m.tmdb_id AS title_id,
    m.title AS title_name,
    wh.my_rating,
    m.collection_id,
    c.name AS collection_name
  FROM watch_history wh
  JOIN movies m ON m.tmdb_id = wh.tmdb_id
  JOIN movie_crew mcr ON mcr.movie_tmdb_id = m.tmdb_id AND mcr.job = 'Director'
  JOIN people p ON p.tmdb_id = mcr.person_tmdb_id
  LEFT JOIN collections c ON c.tmdb_id = m.collection_id
  WHERE wh.media_type = 'movie'
    AND wh.my_rating IS NOT NULL
),
actor_movies AS (
  SELECT
    mc.person_tmdb_id AS actor_id,
    p.name AS actor_name,
    m.tmdb_id AS title_id,
    m.title AS title_name,
    m.collection_id
  FROM watch_history wh
  JOIN movies m ON m.tmdb_id = wh.tmdb_id
  JOIN movie_cast mc ON mc.movie_tmdb_id = m.tmdb_id
  JOIN people p ON p.tmdb_id = mc.person_tmdb_id
  WHERE wh.media_type = 'movie'
    AND wh.my_rating IS NOT NULL
    AND mc.role IN ('lead', 'supporting')
),
pair_movies AS (
  SELECT
    d.director_name AS person_a_name,
    a.actor_name AS person_b_name,
    d.title_id,
    d.title_name,
    d.collection_id,
    d.collection_name,
    d.my_rating
  FROM director_movies d
  JOIN actor_movies a ON d.title_id = a.title_id AND d.director_id != a.actor_id
)
SELECT
  person_a_name,
  person_b_name,
  COUNT(DISTINCT title_id)::int AS shared_titles,
  COUNT(DISTINCT title_id) FILTER (WHERE collection_id IS NOT NULL)::int AS collection_movie_count,
  COUNT(DISTINCT title_id) FILTER (WHERE collection_id IS NULL)::int AS standalone_movie_count,
  ROUND(AVG(my_rating)::numeric, 2) AS avg_rating,
  json_agg(DISTINCT jsonb_build_object(
    'title', title_name,
    'collection', collection_name
  ) ORDER BY jsonb_build_object('title', title_name, 'collection', collection_name)) AS works
FROM pair_movies
GROUP BY person_a_name, person_b_name
HAVING COUNT(DISTINCT title_id) >= 3
ORDER BY shared_titles DESC, avg_rating DESC
LIMIT 100;
