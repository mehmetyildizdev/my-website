-- Local SQLite/D1 search_items schema used by
-- build-search-snapshot-from-neon.ts and fetch-search-baseline.ts. The row
-- INSERT statements are generated from the current Neon/D1 snapshot by those
-- scripts.

DROP TRIGGER IF EXISTS search_items_fts_ai;
DROP TRIGGER IF EXISTS search_items_fts_ad;
DROP TRIGGER IF EXISTS search_items_fts_au;
DROP TABLE IF EXISTS search_items_fts;
DROP TABLE IF EXISTS search_items;

CREATE TABLE search_items (
  type TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  extra_name TEXT,
  image_path TEXT,
  rating REAL,
  release_date TEXT,
  PRIMARY KEY (type, tmdb_id)
);

CREATE INDEX idx_search_items_tmdb_id
  ON search_items(tmdb_id);

CREATE VIRTUAL TABLE search_items_fts USING fts5(
  name,
  extra_name,
  content='search_items',
  content_rowid='rowid',
  tokenize='trigram'
);

CREATE TRIGGER search_items_fts_ai
AFTER INSERT ON search_items
BEGIN
  INSERT INTO search_items_fts(rowid, name, extra_name)
  VALUES (new.rowid, new.name, new.extra_name);
END;

CREATE TRIGGER search_items_fts_ad
AFTER DELETE ON search_items
BEGIN
  INSERT INTO search_items_fts(search_items_fts, rowid, name, extra_name)
  VALUES ('delete', old.rowid, old.name, old.extra_name);
END;

CREATE TRIGGER search_items_fts_au
AFTER UPDATE OF name, extra_name ON search_items
BEGIN
  INSERT INTO search_items_fts(search_items_fts, rowid, name, extra_name)
  VALUES ('delete', old.rowid, old.name, old.extra_name);
  INSERT INTO search_items_fts(rowid, name, extra_name)
  VALUES (new.rowid, new.name, new.extra_name);
END;
