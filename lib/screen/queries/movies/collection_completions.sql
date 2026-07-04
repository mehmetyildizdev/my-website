-- Collection completion stats with overall context (D1/SQLite version)
SELECT *
FROM chart_collection_completions
ORDER BY 
  CASE WHEN avg_rating IS NULL THEN 1 ELSE 0 END, 
  avg_rating DESC, 
  completion_pct DESC, 
  watched_movies DESC;
