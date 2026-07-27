-- Database overview: row counts and sample data coverage for all tables
SELECT 
    'movies' as table_name,
    COUNT(*)::int as total_rows,
    COUNT(my_rating)::int as has_my_rating,
    COUNT(tmdb_rating)::int as has_tmdb_rating,
    COUNT(poster_path)::int as has_poster,
    COUNT(backdrop_path)::int as has_backdrop,
    COUNT(overview)::int as has_overview,
    COUNT(collection_id)::int as has_collection,
    COUNT(imdb_id)::int as has_imdb_id,
    COUNT(release_date)::int as has_release_date,
    COUNT(runtime)::int as has_runtime,
    0 as has_seasons,
    0 as has_episodes,
    0 as has_popularity,
    0 as has_gender,
    0 as has_deathday
FROM movies
UNION ALL
SELECT 
    'shows',
    COUNT(*),
    COUNT(my_rating),
    COUNT(tmdb_rating),
    COUNT(poster_path),
    COUNT(backdrop_path),
    COUNT(overview),
    0, -- no collection_id
    COUNT(imdb_id),
    COUNT(first_air_date),
    0, -- no runtime
    COUNT(number_of_seasons),
    COUNT(number_of_episodes),
    0, 0, 0
FROM shows
UNION ALL
SELECT 
    'people',
    COUNT(*),
    0, 0,
    COUNT(profile_path),
    0, 0, 0,
    COUNT(imdb_id),
    COUNT(birth_date),
    0, 0, 0,
    COUNT(popularity),
    COUNT(gender),
    COUNT(deathday)
FROM people
UNION ALL
SELECT 
    'episodes',
    COUNT(*),
    0, 0, 0, 0, 0, 0, 0,
    COUNT(air_date),
    COUNT(runtime),
    0, 0, 0, 0, 0
FROM episodes;
