-- Top production companies by average rating (min 5 items)
SELECT
    pc.tmdb_id,
    pc.name,
    pc.logo_path,
    pc.country_iso,
    ROUND(AVG(wh.my_rating)::numeric, 2) as avg_rating,
    COUNT(*)::int as movie_count
FROM production_companies pc
JOIN movie_production_companies mpc ON mpc.company_tmdb_id = pc.tmdb_id
JOIN watch_history wh ON wh.tmdb_id = mpc.movie_tmdb_id AND wh.media_type = 'movie'
WHERE wh.my_rating IS NOT NULL
GROUP BY pc.tmdb_id, pc.name, pc.logo_path, pc.country_iso
HAVING COUNT(*) >= 5
ORDER BY avg_rating DESC, movie_count DESC
LIMIT 50;
