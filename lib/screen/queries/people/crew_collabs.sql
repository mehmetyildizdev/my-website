-- Crew-crew collaborations across categories in watched movies (D1/SQLite version)
SELECT
  person_a_name,
  category_a,
  person_b_name,
  category_b,
  shared_titles,
  collection_movie_count,
  standalone_movie_count,
  avg_rating,
  works
FROM crew_collabs
ORDER BY shared_titles DESC, avg_rating DESC
LIMIT 100;
