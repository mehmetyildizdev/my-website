-- API Auth Tokens (Generic table for multiple providers)
CREATE TABLE IF NOT EXISTS api_auth (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'trakt', 'tmdb'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    extra_data JSONB, -- For any provider-specific metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------
-- COLLECTIONS (movie box sets / franchises)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collections (
    tmdb_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    original_name TEXT,
    original_language VARCHAR(10),
    overview TEXT,
    poster_path TEXT,
    backdrop_path TEXT,
    total_movies INTEGER -- TMDB parts.length; populated by /api/enrich/collections
);

-- Bridge: every movie in a TMDB collection (watched or not), with order.
-- No FK on movie_tmdb_id — siblings the user hasn't watched won't be in `movies`.
CREATE TABLE IF NOT EXISTS collection_movies (
    collection_tmdb_id INTEGER NOT NULL REFERENCES collections(tmdb_id) ON DELETE CASCADE,
    movie_tmdb_id      INTEGER NOT NULL,
    position           INTEGER,
    title              TEXT,
    poster_path        TEXT,
    release_date       DATE,
    PRIMARY KEY (collection_tmdb_id, movie_tmdb_id)
);

-- -----------------------------------------------------------------------
-- NETWORKS (TV broadcasters / streaming platforms)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS networks (
    tmdb_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    logo_path TEXT,
    country_iso VARCHAR(10)
);

-- -----------------------------------------------------------------------
-- PRODUCTION COMPANIES
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS production_companies (
    tmdb_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    logo_path TEXT,
    country_iso VARCHAR(10),
    parent_company_id INTEGER REFERENCES production_companies(tmdb_id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------
-- CORE ENTITIES
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movies (
    tmdb_id INTEGER PRIMARY KEY,
    imdb_id VARCHAR(50),
    media_key VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    original_title TEXT,
    original_language VARCHAR(20),
    release_date DATE,
    release_language VARCHAR(50),
    runtime INTEGER,
    poster_path TEXT,
    backdrop_path TEXT,
    overview TEXT,
    tmdb_rating DECIMAL(3,1),
    my_rating DECIMAL(3,1),
    collection_id INTEGER REFERENCES collections(tmdb_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shows (
    tmdb_id INTEGER PRIMARY KEY,
    imdb_id VARCHAR(50),
    media_key VARCHAR(255) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    original_name TEXT,
    original_language VARCHAR(20),
    first_air_date DATE,
    release_language VARCHAR(50),
    poster_path TEXT,
    backdrop_path TEXT,
    overview TEXT,
    number_of_episodes INTEGER,
    number_of_seasons INTEGER,
    tmdb_rating DECIMAL(3,1),
    my_rating DECIMAL(3,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------
-- SEASONS
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seasons (
    tmdb_id INTEGER PRIMARY KEY,
    show_tmdb_id INTEGER REFERENCES shows(tmdb_id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    media_key VARCHAR(255) UNIQUE NOT NULL,
    name TEXT,
    overview TEXT,
    poster_path TEXT,
    air_date DATE,
    episode_count INTEGER,
    my_rating DECIMAL(3,1),
    UNIQUE(show_tmdb_id, season_number)
);

CREATE TABLE IF NOT EXISTS episodes (
    tmdb_id INTEGER PRIMARY KEY,
    media_key VARCHAR(255) UNIQUE NOT NULL,
    show_tmdb_id INTEGER REFERENCES shows(tmdb_id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    title TEXT,
    runtime INTEGER,
    air_date DATE,
    my_rating DECIMAL(3,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(show_tmdb_id, season_number, episode_number)
);

-- Watch History Table (Single table for all scrobbles to easily query history in chronological order)
CREATE TABLE IF NOT EXISTS watch_history (
    id SERIAL PRIMARY KEY,
    -- For episodes, this would be the episode tmdb_id. For movies, the movie tmdb_id.
    tmdb_id INTEGER NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('movie', 'episode')),
    watched_at TIMESTAMP WITH TIME ZONE NOT NULL,
    my_rating INTEGER CHECK (my_rating >= 1 AND my_rating <= 10),
    media_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tmdb_id, media_type) -- Ensures only one record per movie or episode as requested
);

-- -----------------------------------------------------------------------
-- GENRES
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY, -- Using TMDB genre IDs
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS movie_genres (
    movie_tmdb_id INTEGER REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_tmdb_id, genre_id)
);

CREATE TABLE IF NOT EXISTS show_genres (
    show_tmdb_id INTEGER REFERENCES shows(tmdb_id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (show_tmdb_id, genre_id)
);

-- -----------------------------------------------------------------------
-- COUNTRIES
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS countries (
    iso_3166_1 VARCHAR(10) PRIMARY KEY, -- e.g. 'US', 'GB'
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS movie_countries (
    movie_tmdb_id INTEGER REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    country_iso VARCHAR(10) REFERENCES countries(iso_3166_1) ON DELETE CASCADE,
    PRIMARY KEY (movie_tmdb_id, country_iso)
);

CREATE TABLE IF NOT EXISTS show_countries (
    show_tmdb_id INTEGER REFERENCES shows(tmdb_id) ON DELETE CASCADE,
    country_iso VARCHAR(10) REFERENCES countries(iso_3166_1) ON DELETE CASCADE,
    PRIMARY KEY (show_tmdb_id, country_iso)
);

-- -----------------------------------------------------------------------
-- PRODUCTION COMPANY LINKS
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movie_production_companies (
    movie_tmdb_id INTEGER REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    company_tmdb_id INTEGER REFERENCES production_companies(tmdb_id) ON DELETE CASCADE,
    PRIMARY KEY (movie_tmdb_id, company_tmdb_id)
);

CREATE TABLE IF NOT EXISTS show_production_companies (
    show_tmdb_id INTEGER REFERENCES shows(tmdb_id) ON DELETE CASCADE,
    company_tmdb_id INTEGER REFERENCES production_companies(tmdb_id) ON DELETE CASCADE,
    PRIMARY KEY (show_tmdb_id, company_tmdb_id)
);

-- -----------------------------------------------------------------------
-- NETWORK LINKS
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS show_networks (
    show_tmdb_id INTEGER REFERENCES shows(tmdb_id) ON DELETE CASCADE,
    network_tmdb_id INTEGER REFERENCES networks(tmdb_id) ON DELETE CASCADE,
    PRIMARY KEY (show_tmdb_id, network_tmdb_id)
);

-- -----------------------------------------------------------------------
-- PEOPLE AND CREDITS
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS people (
    tmdb_id INTEGER PRIMARY KEY,
    imdb_id VARCHAR(50),
    name TEXT NOT NULL,
    profile_path TEXT,
    known_for_department VARCHAR(100),
    popularity DECIMAL(10,3),
    birth_date DATE,
    deathday DATE,
    gender SMALLINT,
    place_of_birth TEXT
);

CREATE TABLE IF NOT EXISTS person_countries (
    person_tmdb_id INTEGER REFERENCES people(tmdb_id) ON DELETE CASCADE,
    country_iso VARCHAR(10) REFERENCES countries(iso_3166_1) ON DELETE CASCADE,
    PRIMARY KEY (person_tmdb_id, country_iso)
);

-- Movie Credits
-- role: 'lead' (order 0-3), 'supporting' (order 4-9), 'minor' (order 10+)
CREATE TABLE IF NOT EXISTS movie_cast (
    id SERIAL PRIMARY KEY,
    movie_tmdb_id INTEGER REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    person_tmdb_id INTEGER REFERENCES people(tmdb_id) ON DELETE CASCADE,
    character TEXT,
    cast_order INTEGER,
    role VARCHAR(20) CHECK (role IN ('lead', 'supporting', 'minor')),
    UNIQUE(movie_tmdb_id, person_tmdb_id, character)
);

CREATE TABLE IF NOT EXISTS movie_crew (
    id SERIAL PRIMARY KEY,
    movie_tmdb_id INTEGER REFERENCES movies(tmdb_id) ON DELETE CASCADE,
    person_tmdb_id INTEGER REFERENCES people(tmdb_id) ON DELETE CASCADE,
    job TEXT NOT NULL,
    UNIQUE(movie_tmdb_id, person_tmdb_id, job)
);

-- Show Credits (aggregate from all episodes)
-- episode_count: how many episodes this person appeared in
CREATE TABLE IF NOT EXISTS show_cast (
    id SERIAL PRIMARY KEY,
    show_tmdb_id INTEGER REFERENCES shows(tmdb_id) ON DELETE CASCADE,
    person_tmdb_id INTEGER REFERENCES people(tmdb_id) ON DELETE CASCADE,
    character TEXT,
    episode_count INTEGER,
    UNIQUE(show_tmdb_id, person_tmdb_id, character)
);

CREATE TABLE IF NOT EXISTS show_crew (
    id SERIAL PRIMARY KEY,
    show_tmdb_id INTEGER REFERENCES shows(tmdb_id) ON DELETE CASCADE,
    person_tmdb_id INTEGER REFERENCES people(tmdb_id) ON DELETE CASCADE,
    job TEXT NOT NULL,
    episode_count INTEGER,
    UNIQUE(show_tmdb_id, person_tmdb_id, job)
);

-- -----------------------------------------------------------------------
