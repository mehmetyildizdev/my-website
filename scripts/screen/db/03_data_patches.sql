-- Data patches for splitting combined genres (Action & Adventure, Sci-Fi & Fantasy, War & Politics)
-- Ensure split target genres exist
INSERT INTO genres (id, name) VALUES (28, 'Action') ON CONFLICT (id) DO NOTHING;
INSERT INTO genres (id, name) VALUES (12, 'Adventure') ON CONFLICT (id) DO NOTHING;
INSERT INTO genres (id, name) VALUES (878, 'Science Fiction') ON CONFLICT (id) DO NOTHING;
INSERT INTO genres (id, name) VALUES (14, 'Fantasy') ON CONFLICT (id) DO NOTHING;
INSERT INTO genres (id, name) VALUES (10752, 'War') ON CONFLICT (id) DO NOTHING;
INSERT INTO genres (id, name) VALUES (107681, 'Politics') ON CONFLICT (id) DO NOTHING;

-- Map Action & Adventure (10759) -> Action (28) + Adventure (12)
INSERT INTO show_genres (show_tmdb_id, genre_id)
SELECT show_tmdb_id, 28 FROM show_genres WHERE genre_id = 10759
ON CONFLICT DO NOTHING;

INSERT INTO show_genres (show_tmdb_id, genre_id)
SELECT show_tmdb_id, 12 FROM show_genres WHERE genre_id = 10759
ON CONFLICT DO NOTHING;

-- Map Sci-Fi & Fantasy (10765) -> Science Fiction (878) + Fantasy (14)
INSERT INTO show_genres (show_tmdb_id, genre_id)
SELECT show_tmdb_id, 878 FROM show_genres WHERE genre_id = 10765
ON CONFLICT DO NOTHING;

INSERT INTO show_genres (show_tmdb_id, genre_id)
SELECT show_tmdb_id, 14 FROM show_genres WHERE genre_id = 10765
ON CONFLICT DO NOTHING;

-- Map War & Politics (10768) -> War (10752) + Politics (107681)
INSERT INTO show_genres (show_tmdb_id, genre_id)
SELECT show_tmdb_id, 10752 FROM show_genres WHERE genre_id = 10768
ON CONFLICT DO NOTHING;

INSERT INTO show_genres (show_tmdb_id, genre_id)
SELECT show_tmdb_id, 107681 FROM show_genres WHERE genre_id = 10768
ON CONFLICT DO NOTHING;

-- Clean up associations
DELETE FROM show_genres WHERE genre_id IN (10759, 10765, 10768);

-- Clean up lookup table
DELETE FROM genres WHERE id IN (10759, 10765, 10768);
