-- Frequent crew collaborations in watched movies
-- Pairs crew members from different departments who work together often
-- Categories: Directing, Production, Screenwriting, Cinematography, Composition, Design, Source Material
WITH crew_categories AS (
  SELECT
    mcr.person_tmdb_id AS person_id,
    p.name AS person_name,
    m.tmdb_id AS title_id,
    m.title AS title_name,
    wh.rating,
    m.collection_id,
    c.name AS collection_name,
    CASE
      WHEN mcr.job = 'Director' THEN 'Directing'
      WHEN mcr.job IN ('Producer', 'Executive Producer') THEN 'Production'
      WHEN mcr.job IN ('Writer', 'Screenplay', 'Story') THEN 'Screenwriting'
      WHEN mcr.job IN ('Director of Photography', 'Cinematography') THEN 'Cinematography'
      WHEN mcr.job IN ('Original Music Composer', 'Music', 'Composer') THEN 'Composition'
      WHEN mcr.job IN ('Production Design', 'Art Direction', 'Costume Design') THEN 'Design'
      WHEN mcr.job IN ('Novel', 'Book', 'Characters', 'Comic Book') THEN 'Source Material'
      ELSE NULL
    END AS category
  FROM watch_history wh
  JOIN movies m ON m.tmdb_id = wh.tmdb_id
  JOIN movie_crew mcr ON mcr.movie_tmdb_id = m.tmdb_id
  JOIN people p ON p.tmdb_id = mcr.person_tmdb_id
  LEFT JOIN collections c ON c.tmdb_id = m.collection_id
  WHERE wh.media_type = 'movie'
    AND wh.rating IS NOT NULL
),
filtered AS (
  SELECT * FROM crew_categories WHERE category IS NOT NULL
),
pair_movies AS (
  SELECT
    a.person_name AS person_a_name,
    a.category AS category_a,
    b.person_name AS person_b_name,
    b.category AS category_b,
    a.title_id,
    a.title_name,
    a.collection_id,
    a.collection_name,
    a.rating
  FROM filtered a
  JOIN filtered b ON a.title_id = b.title_id
    AND a.person_id < b.person_id
    AND a.category != b.category
)
SELECT
  person_a_name,
  category_a,
  person_b_name,
  category_b,
  COUNT(DISTINCT title_id)::int AS shared_titles,
  COUNT(DISTINCT title_id) FILTER (WHERE collection_id IS NOT NULL)::int AS collection_movie_count,
  COUNT(DISTINCT title_id) FILTER (WHERE collection_id IS NULL)::int AS standalone_movie_count,
  ROUND(AVG(rating)::numeric, 2) AS avg_rating,
  json_agg(DISTINCT jsonb_build_object(
    'title', title_name,
    'collection', collection_name
  ) ORDER BY jsonb_build_object('title', title_name, 'collection', collection_name)) AS works
FROM pair_movies
GROUP BY person_a_name, category_a, person_b_name, category_b
HAVING COUNT(DISTINCT title_id) >= 3
ORDER BY shared_titles DESC, avg_rating DESC
LIMIT 100;
