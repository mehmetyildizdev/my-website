-- Show rating distribution: count of shows per rating bucket (1-10) (D1/SQLite version)
SELECT
  CAST(my_rating AS integer) AS rating,
  COUNT(*) AS count,
  '[' || string_agg('"' || replace(title, '"', '\"') || '"', ',') || ']' AS show_names
FROM chart_ratings_comparison
WHERE media_type = 'show' AND my_rating IS NOT NULL
GROUP BY CAST(my_rating AS integer)
ORDER BY rating;
