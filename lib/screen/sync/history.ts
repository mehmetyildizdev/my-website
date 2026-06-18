// lib/screen/sync/history.ts
// Records watch history rows and syncs episode metadata from TMDB.
//
// bulkMode: skips the per-episode TMDB API call (runtime + air_date).
// This alone saves thousands of API calls during initial fill.
// A separate backfill script can populate episode runtimes later if needed.

import { getTMDBEpisode } from "../tmdb";
import { SyncStats, SyncOptions } from "./constants";

export async function recordWatchHistory(
  client: import("pg").PoolClient,
  tmdbId: number,
  type: "movie" | "episode",
  historyItem: TraktHistoryItem
) {
  const res = await client.query(
    `INSERT INTO watch_history (tmdb_id, media_type, watched_at, trakt_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (tmdb_id, media_type) 
     DO UPDATE SET 
       watched_at = EXCLUDED.watched_at,
       trakt_id = EXCLUDED.trakt_id
     RETURNING id`,
    [tmdbId, type, historyItem.watched_at, historyItem.id]
  );
  return res.rowCount && res.rowCount > 0;
}

export async function syncEpisode(
  client: import("pg").PoolClient,
  traktEpisode: TraktEpisode,
  traktShow: TraktShow,
  historyItem: TraktHistoryItem,
  stats: SyncStats,
  options: SyncOptions = {}
) {
  const showTmdbId = traktShow.ids.tmdb;
  const tmdbId = traktEpisode.ids.tmdb;
  if (!tmdbId || !showTmdbId) return false;

  const insertRes = await client.query(
    `INSERT INTO episodes (tmdb_id, show_tmdb_id, trakt_id, season_number, episode_number, title)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT DO NOTHING
     RETURNING tmdb_id`,
    [tmdbId, showTmdbId, traktEpisode.ids.trakt, traktEpisode.season, traktEpisode.number, traktEpisode.title]
  );

  if (insertRes.rowCount && insertRes.rowCount > 0) {
    stats.new_episodes_added++;

    if (!options.bulkMode) {
      // In normal mode, enrich each new episode with runtime + air_date from TMDB.
      // In bulk mode we skip this — saves thousands of API calls during initial fill.
      const tmdbData = await getTMDBEpisode(showTmdbId, traktEpisode.season, traktEpisode.number);
      await client.query(
        `UPDATE episodes SET runtime = $1, air_date = $2 WHERE tmdb_id = $3`,
        [tmdbData.runtime, tmdbData.air_date || null, tmdbId]
      );
    }
  }

  return recordWatchHistory(client, tmdbId, "episode", historyItem);
}
