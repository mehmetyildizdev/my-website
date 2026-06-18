-- Directors ranked by average rating (3+ movies watched)
SELECT
  p.name,
  p.tmdb_id,
  COUNT(DISTINCT m.tmdb_id)::int AS movie_count,
  ROUND(AVG(wh.rating)::numeric, 2) AS avg_rating,
  (SELECT m2.title FROM watch_history wh2
   JOIN movies m2 ON m2.tmdb_id = wh2.tmdb_id
   JOIN movie_crew mc2 ON mc2.movie_tmdb_id = m2.tmdb_id AND mc2.person_tmdb_id = p.tmdb_id AND mc2.job = 'Director'
   WHERE wh2.media_type = 'movie' AND wh2.rating IS NOT NULL
   ORDER BY wh2.rating DESC LIMIT 1) AS best_movie,
  (SELECT MAX(wh2.rating) FROM watch_history wh2
   JOIN movie_crew mc2 ON mc2.movie_tmdb_id = wh2.tmdb_id AND mc2.person_tmdb_id = p.tmdb_id AND mc2.job = 'Director'
   WHERE wh2.media_type = 'movie' AND wh2.rating IS NOT NULL) AS best_rating
FROM watch_history wh
JOIN movie_crew mcr ON mcr.movie_tmdb_id = wh.tmdb_id AND mcr.job = 'Director'
JOIN people p ON p.tmdb_id = mcr.person_tmdb_id
JOIN movies m ON m.tmdb_id = wh.tmdb_id
WHERE wh.media_type = 'movie'
  AND wh.rating IS NOT NULL
GROUP BY p.tmdb_id, p.name
HAVING COUNT(DISTINCT m.tmdb_id) >= 3
ORDER BY avg_rating DESC, movie_count DESC;
