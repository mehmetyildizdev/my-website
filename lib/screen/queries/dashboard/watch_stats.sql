-- Detailed watch stats per entry for client-side filtering by date
-- Returns one row per watch_history entry with runtime and country info
SELECT
    wh.media_type,
    to_char(wh.watched_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') as watched_at,
    CASE 
        WHEN wh.media_type = 'movie' THEN m.runtime
        WHEN wh.media_type = 'episode' THEN e.runtime
    END as runtime_minutes,
    CASE
        WHEN wh.media_type = 'movie' THEN m.tmdb_id
        WHEN wh.media_type = 'episode' THEN e.show_tmdb_id
    END as show_or_movie_id,
    CASE
        WHEN wh.media_type = 'movie' THEN (
            SELECT ARRAY_AGG(DISTINCT mc2.country_iso) 
            FROM movie_countries mc2 
            WHERE mc2.movie_tmdb_id = m.tmdb_id
        )
        WHEN wh.media_type = 'episode' THEN (
            SELECT ARRAY_AGG(DISTINCT sc2.country_iso) 
            FROM show_countries sc2 
            WHERE sc2.show_tmdb_id = e.show_tmdb_id
        )
    END as countries
FROM watch_history wh
LEFT JOIN movies m ON m.tmdb_id = wh.tmdb_id AND wh.media_type = 'movie'
LEFT JOIN episodes e ON e.tmdb_id = wh.tmdb_id AND wh.media_type = 'episode'
ORDER BY wh.watched_at ASC;
