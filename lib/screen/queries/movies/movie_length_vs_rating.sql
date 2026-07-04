-- Movie runtime vs personal rating scatter data (D1/SQLite version)
SELECT
  title,
  tmdb_id,
  runtime,
  my_rating AS rating,
  release_year
FROM chart_ratings_comparison
WHERE media_type = 'movie' AND runtime IS NOT NULL AND runtime > 0
ORDER BY rating DESC;
