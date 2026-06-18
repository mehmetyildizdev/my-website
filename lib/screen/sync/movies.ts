// lib/screen/sync/movies.ts
// Syncs movie metadata: TMDB details, genres, countries, production companies,
// collection membership, and cast/crew credits.
//
// DEADLOCK PREVENTION:
//   Shared lookup tables (genres, countries, production_companies, collections)
//   are inserted via the pool-level `query` (auto-committed) instead of the
//   per-movie transaction `client`. This eliminates race conditions when
//   multiple movies are synced in parallel and share the same genre/country rows.

import { getTMDBMovie } from "../tmdb";
import { query } from "../db";
import { SyncStats, SyncOptions, CREW_JOBS } from "./constants";
import { processPeopleCredits } from "./people";

export async function syncMovieMetadata(
  client: import("pg").PoolClient,
  traktMovie: TraktMovie,
  stats: SyncStats,
  options: SyncOptions = {}
) {
  const tmdbId = traktMovie.ids.tmdb;
  if (!tmdbId) return;

  const insertRes = await client.query(
    `INSERT INTO movies (tmdb_id, title, trakt_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (tmdb_id) DO NOTHING
     RETURNING tmdb_id`,
    [tmdbId, traktMovie.title, traktMovie.ids.trakt]
  );

  if (!(insertRes.rowCount && insertRes.rowCount > 0)) return;

  stats.new_movies_added++;
  const tmdbData = await getTMDBMovie(tmdbId);

  // ── Collection (shared lookup — pool query, not transaction) ─────────────
  let collectionId: number | null = null;
  if (tmdbData.belongs_to_collection) {
    const col = tmdbData.belongs_to_collection;
    await query(
      `INSERT INTO collections (tmdb_id, name, poster_path, backdrop_path)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tmdb_id) DO NOTHING`,
      [col.id, col.name, col.poster_path, col.backdrop_path]
    );
    collectionId = col.id;
  }

  // ── Core movie row (inside transaction) ──────────────────────────────────
  await client.query(
    `UPDATE movies SET
       imdb_id           = $2,
       original_title    = $3,
       original_language = $4,
       release_date      = $5,
       release_language  = $6,
       runtime           = $7,
       poster_path       = $8,
       backdrop_path     = $9,
       overview          = $10,
       tmdb_rating       = $11,
       collection_id     = $12
     WHERE tmdb_id = $1`,
    [
      tmdbId,
      tmdbData.imdb_id,
      tmdbData.original_title,
      tmdbData.original_language,
      tmdbData.release_date || null,
      tmdbData.original_language,
      tmdbData.runtime,
      tmdbData.poster_path,
      tmdbData.backdrop_path,
      tmdbData.overview,
      tmdbData.vote_average,
      collectionId,
    ]
  );

  // ── Genres (shared lookup — pool query) ───────────────────────────────────
  for (const genre of tmdbData.genres ?? []) {
    await query(
      `INSERT INTO genres (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
      [genre.id, genre.name]
    );
    // link table is movie-specific, safe in transaction
    await client.query(
      `INSERT INTO movie_genres (movie_tmdb_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tmdbId, genre.id]
    );
  }

  // ── Countries (shared lookup — pool query) ────────────────────────────────
  for (const country of tmdbData.production_countries ?? []) {
    await query(
      `INSERT INTO countries (iso_3166_1, name) VALUES ($1, $2) ON CONFLICT (iso_3166_1) DO NOTHING`,
      [country.iso_3166_1, country.name]
    );
    await client.query(
      `INSERT INTO movie_countries (movie_tmdb_id, country_iso) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tmdbId, country.iso_3166_1]
    );
  }

  // ── Production companies (shared lookup — pool query) ─────────────────────
  for (const company of tmdbData.production_companies ?? []) {
    await query(
      `INSERT INTO production_companies (tmdb_id, name, logo_path, country_iso)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tmdb_id) DO NOTHING`,
      [company.id, company.name, company.logo_path ?? null, company.origin_country ?? null]
    );
    await client.query(
      `INSERT INTO movie_production_companies (movie_tmdb_id, company_tmdb_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tmdbId, company.id]
    );
  }

  // ── Credits ────────────────────────────────────────────────────────────────────────
  if (tmdbData.credits) {
    const crewToSync = (tmdbData.credits.crew ?? []).filter((c: any) => CREW_JOBS.has(c.job));
    const castToSync = (tmdbData.credits.cast ?? []).filter((c: any) => c.profile_path);
    await processPeopleCredits(client, tmdbId, crewToSync, castToSync, "movie", stats);
  }
}
