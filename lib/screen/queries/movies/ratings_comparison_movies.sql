-- Personal rating vs TMDB rating for rated movies only (D1/SQLite version)
SELECT
    media_type,
    title,
    tmdb_id,
    my_rating,
    tmdb_rating,
    release_year,
    genres
FROM chart_ratings_comparison
WHERE media_type = 'movie'
ORDER BY my_rating DESC, ABS(my_rating - tmdb_rating) DESC;
