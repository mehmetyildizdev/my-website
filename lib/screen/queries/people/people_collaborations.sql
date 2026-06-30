-- Frequent actor collaborations in watched movies (lead and supporting roles)
-- Uses total movie count for ranking but groups collection movies together in display
WITH person_titles AS (
  SELECT
    mc.person_tmdb_id AS person_id,
    p.name AS person_name,
    m.tmdb_id AS title_id,
    m.title AS title_name,
    wh.my_rating,
    m.collection_id,
    c.name AS collection_name
  FROM watch_history wh
  JOIN movies m ON m.tmdb_id = wh.tmdb_id
  JOIN movie_cast mc ON mc.movie_tmdb_id = m.tmdb_id
  JOIN people p ON p.tmdb_id = mc.person_tmdb_id
  LEFT JOIN collections c ON c.tmdb_id = m.collection_id
  WHERE wh.media_type = 'movie'
    AND wh.my_rating IS NOT NULL
    AND mc.role IN ('lead', 'supporting')
),
pair_movies AS (
  SELECT
    a.person_name AS person_a_name,
    b.person_name AS person_b_name,
    a.title_id,
    a.title_name,
    a.collection_id,
    a.collection_name,
    a.my_rating
  FROM person_titles a
  JOIN person_titles b ON a.title_id = b.title_id AND a.person_id < b.person_id
)
SELECT
  person_a_name,
  person_b_name,
  COUNT(DISTINCT title_id)::int AS shared_titles,
  COUNT(DISTINCT title_id) FILTER (WHERE collection_id IS NOT NULL)::int AS collection_movie_count,
  COUNT(DISTINCT title_id) FILTER (WHERE collection_id IS NULL)::int AS standalone_movie_count,
  ROUND(AVG(my_rating)::numeric, 2) AS avg_rating,
  -- JSON array of works: collections grouped with their movies, standalones listed individually
  json_agg(DISTINCT jsonb_build_object(
    'title', title_name,
    'collection', collection_name
  ) ORDER BY jsonb_build_object('title', title_name, 'collection', collection_name)) AS works
FROM pair_movies
GROUP BY person_a_name, person_b_name
HAVING COUNT(DISTINCT title_id) >= 3
ORDER BY shared_titles DESC, avg_rating DESC
LIMIT 100;
