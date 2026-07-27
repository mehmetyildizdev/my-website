-- Shows watched per year per network (top networks) with show names (D1/SQLite version)
SELECT
  network_name,
  year,
  show_count,
  avg_rating,
  show_names
FROM chart_network_timeline
ORDER BY network_name, year;
