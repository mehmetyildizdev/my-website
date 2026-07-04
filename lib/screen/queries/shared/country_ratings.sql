-- Average rating per production country with movie/show breakdown (D1/SQLite version)
SELECT
    country_code,
    country_name,
    avg_rating,
    movie_count,
    show_count
FROM chart_country_ratings
ORDER BY avg_rating DESC;
