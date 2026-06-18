-- INDEXES
-- -----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON watch_history(watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_media ON watch_history(media_type, tmdb_id);
CREATE INDEX IF NOT EXISTS idx_episodes_show_id ON episodes(show_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_seasons_show_id ON seasons(show_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movie_cast_person ON movie_cast(person_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movie_cast_role ON movie_cast(role);
CREATE INDEX IF NOT EXISTS idx_movie_crew_person ON movie_crew(person_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movie_genres_id ON movie_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_movie_countries_iso ON movie_countries(country_iso);
CREATE INDEX IF NOT EXISTS idx_movies_trakt_rating ON movies(trakt_rating DESC);
CREATE INDEX IF NOT EXISTS idx_movies_lang ON movies(original_language);
CREATE INDEX IF NOT EXISTS idx_movies_collection ON movies(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_movies_movie ON collection_movies(movie_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_collection_movies_position ON collection_movies(collection_tmdb_id, position);
CREATE INDEX IF NOT EXISTS idx_show_cast_person ON show_cast(person_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_show_crew_person ON show_crew(person_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_show_genres_id ON show_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_show_countries_iso ON show_countries(country_iso);
CREATE INDEX IF NOT EXISTS idx_shows_trakt_rating ON shows(trakt_rating DESC);
CREATE INDEX IF NOT EXISTS idx_shows_lang ON shows(original_language);
CREATE INDEX IF NOT EXISTS idx_show_networks_network ON show_networks(network_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movie_companies ON movie_production_companies(company_tmdb_id);
CREATE INDEX IF NOT EXISTS idx_show_companies ON show_production_companies(company_tmdb_id);

-- Additional Performance Indexes
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_shows_first_air_date ON shows(first_air_date DESC);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_rating ON movies(tmdb_rating DESC);
CREATE INDEX IF NOT EXISTS idx_shows_tmdb_rating ON shows(tmdb_rating DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_rating ON watch_history(rating DESC);
CREATE INDEX IF NOT EXISTS idx_people_department ON people(known_for_department);
CREATE INDEX IF NOT EXISTS idx_people_popularity ON people(popularity DESC);

-- Fuzzy Search Indexes (Requires pg_trgm)
CREATE INDEX IF NOT EXISTS idx_movies_title_trgm ON movies USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_shows_name_trgm ON shows USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_people_name_trgm ON people USING gin (name gin_trgm_ops);