-- Single fetch for all crew categories. UI tabs filter the result in memory.
-- Cap LIMIT generous; the MV's coverage threshold already trims noise.
SELECT
    tmdb_id,
    name,
    profile_path,
    category,
    movie_count,
    show_count,
    episode_count,
    movie_equivalents,
    raw_project_avg,
    raw_rating,
    weighted_rating
FROM analytics.top_rated_crew
ORDER BY category, weighted_rating DESC, movie_count DESC, show_count DESC
LIMIT 5000;
