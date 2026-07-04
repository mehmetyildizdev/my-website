-- Gender representation breakdown by role type (D1/SQLite version)
SELECT
  gender,
  department,
  count,
  avg_rating
FROM people_gender_diversity
ORDER BY department, count DESC;
