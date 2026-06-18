-- Top TV networks by average show rating (min 3 shows)
SELECT
    n.tmdb_id,
    n.name,
    n.logo_path,
    n.country_iso,
    ROUND(AVG(s.trakt_rating)::numeric, 2) as avg_rating,
    COUNT(DISTINCT s.tmdb_id)::int as show_count
FROM networks n
JOIN show_networks sn ON sn.network_tmdb_id = n.tmdb_id
JOIN shows s ON s.tmdb_id = sn.show_tmdb_id
JOIN episodes e ON e.show_tmdb_id = s.tmdb_id
JOIN watch_history wh ON wh.tmdb_id = e.tmdb_id AND wh.media_type = 'episode'
WHERE s.trakt_rating IS NOT NULL
GROUP BY n.tmdb_id, n.name, n.logo_path, n.country_iso
HAVING COUNT(DISTINCT s.tmdb_id) >= 3
ORDER BY avg_rating DESC, show_count DESC
LIMIT 50;
