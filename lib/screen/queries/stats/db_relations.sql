-- Relational table counts and coverage
SELECT 
    'watch_history' as relation,
    COUNT(*)::int as total_rows,
    COUNT(CASE WHEN media_type = 'movie' THEN 1 END)::int as movie_entries,
    COUNT(CASE WHEN media_type = 'episode' THEN 1 END)::int as episode_entries,
    COUNT(rating)::int as has_rating,
    0 as extra_stat_1,
    0 as extra_stat_2
FROM watch_history
UNION ALL
SELECT 
    'movie_cast',
    COUNT(*),
    COUNT(DISTINCT movie_tmdb_id),
    COUNT(DISTINCT person_tmdb_id),
    COUNT(CASE WHEN role = 'lead' THEN 1 END),
    COUNT(CASE WHEN role = 'supporting' THEN 1 END),
    COUNT(CASE WHEN role = 'minor' THEN 1 END)
FROM movie_cast
UNION ALL
SELECT 
    'movie_crew',
    COUNT(*),
    COUNT(DISTINCT movie_tmdb_id),
    COUNT(DISTINCT person_tmdb_id),
    COUNT(CASE WHEN job = 'Director' THEN 1 END),
    0, 0
FROM movie_crew
UNION ALL
SELECT 
    'show_cast',
    COUNT(*),
    COUNT(DISTINCT show_tmdb_id),
    COUNT(DISTINCT person_tmdb_id),
    COUNT(episode_count),
    0, 0
FROM show_cast
UNION ALL
SELECT 
    'show_crew',
    COUNT(*),
    COUNT(DISTINCT show_tmdb_id),
    COUNT(DISTINCT person_tmdb_id),
    COUNT(CASE WHEN job IN ('Director', 'Creator') THEN 1 END),
    0, 0
FROM show_crew
UNION ALL
SELECT 
    'movie_genres',
    COUNT(*),
    COUNT(DISTINCT movie_tmdb_id),
    COUNT(DISTINCT genre_id),
    0, 0, 0
FROM movie_genres
UNION ALL
SELECT 
    'show_genres',
    COUNT(*),
    COUNT(DISTINCT show_tmdb_id),
    COUNT(DISTINCT genre_id),
    0, 0, 0
FROM show_genres
UNION ALL
SELECT 
    'movie_countries',
    COUNT(*),
    COUNT(DISTINCT movie_tmdb_id),
    COUNT(DISTINCT country_iso),
    0, 0, 0
FROM movie_countries
UNION ALL
SELECT 
    'show_countries',
    COUNT(*),
    COUNT(DISTINCT show_tmdb_id),
    COUNT(DISTINCT country_iso),
    0, 0, 0
FROM show_countries
UNION ALL
SELECT 
    'seasons',
    COUNT(*),
    COUNT(DISTINCT show_tmdb_id),
    0,
    COUNT(poster_path),
    0, 0
FROM seasons
UNION ALL
SELECT 
    'collections',
    COUNT(*),
    0, 0,
    COUNT(poster_path),
    0, 0
FROM collections
UNION ALL
SELECT 
    'collection_movies',
    COUNT(*),
    COUNT(DISTINCT collection_tmdb_id),
    COUNT(DISTINCT movie_tmdb_id),
    COUNT(poster_path),
    0, 0
FROM collection_movies
UNION ALL
SELECT 
    'genres',
    COUNT(*),
    0, 0, 0, 0, 0
FROM genres
UNION ALL
SELECT 
    'countries',
    COUNT(*),
    0, 0, 0, 0, 0
FROM countries
UNION ALL
SELECT 
    'networks',
    COUNT(*),
    0, 0,
    COUNT(logo_path),
    0, 0
FROM networks
UNION ALL
SELECT 
    'production_companies',
    COUNT(*),
    0, 0,
    COUNT(logo_path),
    0, 0
FROM production_companies
UNION ALL
SELECT 
    'show_networks',
    COUNT(*),
    COUNT(DISTINCT show_tmdb_id),
    COUNT(DISTINCT network_tmdb_id),
    0, 0, 0
FROM show_networks
UNION ALL
SELECT 
    'movie_production_companies',
    COUNT(*),
    COUNT(DISTINCT movie_tmdb_id),
    COUNT(DISTINCT company_tmdb_id),
    0, 0, 0
FROM movie_production_companies
UNION ALL
SELECT 
    'show_production_companies',
    COUNT(*),
    COUNT(DISTINCT show_tmdb_id),
    COUNT(DISTINCT company_tmdb_id),
    0, 0, 0
FROM show_production_companies
UNION ALL
SELECT 
    'person_countries',
    COUNT(*),
    COUNT(DISTINCT person_tmdb_id),
    COUNT(DISTINCT country_iso),
    0, 0, 0
FROM person_countries;
