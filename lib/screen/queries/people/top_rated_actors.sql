-- Top rated actors ranked by personal my_rating (D1/SQLite version).
-- Joins top_rated_actors (for counts/metadata) with actor__ratings (for my_rating score).
SELECT
  tr.tmdb_id,
  tr.name,
  tr.profile_path,
  tr.movie_count,
  tr.show_count,
  tr.episode_count,
  tr.movie_equivalents,
  tr.raw_project_avg,
  tr.raw_rating,
  tr.weighted_rating,
  ar.my_rating
FROM top_rated_actors tr
JOIN actor__ratings ar ON ar.tmdb_id = tr.tmdb_id
ORDER BY CAST(ar.my_rating AS REAL) DESC, tr.movie_count DESC, tr.show_count DESC;
