-- Average rating per genre (movies + shows combined)
SELECT
    name,
    SUM(watch_count) AS total_count,
    ROUND(SUM(avg_rating * watch_count) / NULLIF(SUM(watch_count), 0), 2) AS avg_rating,
    ROUND(SUM(CASE WHEN media_type = 'movie' THEN avg_rating * watch_count END) / NULLIF(SUM(CASE WHEN media_type = 'movie' THEN watch_count END), 0), 2) AS avg_movie_rating,
    ROUND(SUM(CASE WHEN media_type = 'show' THEN avg_rating * watch_count END) / NULLIF(SUM(CASE WHEN media_type = 'show' THEN watch_count END), 0), 2) AS avg_show_rating,
    SUM(CASE WHEN media_type = 'movie' THEN watch_count ELSE 0 END) AS movie_count,
    SUM(CASE WHEN media_type = 'show' THEN watch_count ELSE 0 END) AS show_count
FROM chart_genre_metrics
GROUP BY name
HAVING SUM(watch_count) >= 20
ORDER BY avg_rating DESC, SUM(watch_count) DESC;
