-- Makes /db substring searches use one FTS5 trigram index. Run this file once
-- against the live D1 database, before deploying the Worker that queries it:
-- pnpm exec wrangler d1 execute screen --remote --config=search-worker/wrangler.toml --file=search-worker/sql/migrations/0001_search_lookup_indexes.sql
--
-- The final REBUILD statement is intentionally one-time. Do not rerun this
-- file after the index has been populated unless a full rebuild is intended.

-- The FTS index replaces the old name/extra_name B-tree indexes. Keep only the
-- exact-ID index because tmdb_id searches do not need full-text tokenization.
DROP INDEX IF EXISTS idx_search_items_name_nocase;
DROP INDEX IF EXISTS idx_search_items_extra_name_nocase;
DROP INDEX IF EXISTS idx_search_items_name;
DROP INDEX IF EXISTS idx_search_items_extra_name;
CREATE INDEX IF NOT EXISTS idx_search_items_tmdb_id
  ON search_items(tmdb_id);

CREATE VIRTUAL TABLE IF NOT EXISTS search_items_fts USING fts5(
  name,
  extra_name,
  content='search_items',
  content_rowid='rowid',
  tokenize='trigram'
);

-- Keep the external-content FTS index synchronized only when searchable text
-- changes. Rating, image, and release-date updates do not touch FTS.
CREATE TRIGGER IF NOT EXISTS search_items_fts_ai
AFTER INSERT ON search_items
BEGIN
  INSERT INTO search_items_fts(rowid, name, extra_name)
  VALUES (new.rowid, new.name, new.extra_name);
END;

CREATE TRIGGER IF NOT EXISTS search_items_fts_ad
AFTER DELETE ON search_items
BEGIN
  INSERT INTO search_items_fts(search_items_fts, rowid, name, extra_name)
  VALUES ('delete', old.rowid, old.name, old.extra_name);
END;

CREATE TRIGGER IF NOT EXISTS search_items_fts_au
AFTER UPDATE OF name, extra_name ON search_items
BEGIN
  INSERT INTO search_items_fts(search_items_fts, rowid, name, extra_name)
  VALUES ('delete', old.rowid, old.name, old.extra_name);
  INSERT INTO search_items_fts(rowid, name, extra_name)
  VALUES (new.rowid, new.name, new.extra_name);
END;

INSERT INTO search_items_fts(search_items_fts) VALUES ('rebuild');
