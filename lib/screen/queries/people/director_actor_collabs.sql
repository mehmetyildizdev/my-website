-- Director-actor collaborations in watched movies (D1/SQLite version)
SELECT
  person_a_name,
  person_b_name,
  shared_titles,
  collection_movie_count,
  standalone_movie_count,
  avg_rating,
  works
FROM director_actor_collabs
ORDER BY shared_titles DESC, avg_rating DESC
LIMIT 100;
