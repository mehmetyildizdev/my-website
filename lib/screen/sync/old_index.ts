// lib/screen/sync/index.ts
// Main entry point for the Trakt history sync pipeline.
//
// Concurrency design:
//   Shows: 2 at a time — each fires 2 TMDB calls (show detail + aggregate_credits).
//          Aggregate_credits can be large (500+ KB) for long-running shows.
//   Movies: 4 at a time — 1 TMDB call each, much lighter.
//
// Timeouts: handled entirely at the TMDB fetch layer (30s per call, including body parsing).
//   This ensures the transaction always gets to rollback + release its pool connection.
//   Wrapping the outer transaction in an additional timeout causes connection pool exhaustion.

import { transaction, query } from "../db";
import { fetchTraktHistory } from "../trakt";
import { makeSyncStats, printStats, SyncStats, SyncOptions } from "./constants";
import { syncMovieMetadata } from "./movies";
import { syncShow } from "./shows";
import { syncEpisode, recordWatchHistory } from "./history";
import { syncTraktRatings } from "./ratings";

// ── In-place terminal logger ──────────────────────────────────────────────────
let _statusTimer: ReturnType<typeof setInterval> | null = null;
let _statusStart = Date.now();
let _statusLine = "";

function statusStart(msg: string) {
  _statusLine = msg;
  _statusStart = Date.now();
  process.stdout.write(`  ⟳  ${msg}\r`);
  _statusTimer = setInterval(() => {
    const secs = Math.floor((Date.now() - _statusStart) / 1000);
    process.stdout.write(`  ⟳  ${_statusLine} (${secs}s)\r`);
  }, 1000);
}

function statusDone(msg: string) {
  if (_statusTimer) {
    clearInterval(_statusTimer);
    _statusTimer = null;
  }
  const secs = ((Date.now() - _statusStart) / 1000).toFixed(1);
  process.stdout.write(`  ✓  ${msg} [${secs}s]\n`);
}

function statusLog(msg: string) {
  if (_statusTimer) {
    clearInterval(_statusTimer);
    _statusTimer = null;
  }
  process.stdout.write(`\n${msg}\n`);
}

// Run an array of async tasks with a concurrency limit.
async function runConcurrent<T>(
  items: T[],
  runner: (item: T) => Promise<void>,
  concurrency: number,
) {
  for (let i = 0; i < items.length; i += concurrency) {
    await Promise.all(items.slice(i, i + concurrency).map(runner));
  }
}

export async function syncRecentTraktHistory(
  limitPerPage = 100,
  fullSync = false,
  maxPages = Infinity,
) {
  const options: SyncOptions = { bulkMode: fullSync };

  // Keep show concurrency low — each show makes 2 TMDB calls and aggregate_credits
  // can be large. More than 2 concurrent shows risks rate-limiting and pool exhaustion.
  const showConcurrency = 2;
  const movieConcurrency = 4;

  let page = 1;
  let stopSyncing = false;
  let history: TraktHistoryItem[] = [];

  const stats: SyncStats = makeSyncStats();
  const syncedShows = new Set<number>();
  const syncedMovies = new Set<number>();

  statusLog(
    `\n${"─".repeat(50)}\n  Trakt Sync — ${fullSync ? "Full" : "Quick"} mode\n${"─".repeat(50)}`,
  );

  while (!stopSyncing) {
    statusStart(`Trakt page ${page} (limit ${limitPerPage})…`);
    history = await fetchTraktHistory(limitPerPage, page);
    statusDone(`Trakt page ${page}: ${history.length} records`);

    if (history.length === 0) break;

    stats.pages_processed++;
    if (page > maxPages) {
      statusLog(`  → Reached page limit (${maxPages}). Stopping.`);
      break;
    }

    const chunkSize = 30;
    for (let i = 0; i < history.length; i += chunkSize) {
      let chunk = history.slice(i, i + chunkSize);

      // Dedup against existing watch history
      const traktIdsInChunk = chunk.map((item) => item.id);
      const existingRes = await query(
        `SELECT trakt_id FROM watch_history WHERE trakt_id = ANY($1::bigint[])`,
        [traktIdsInChunk],
      );
      const existingTraktIds = new Set(
        existingRes.rows.map((r: any) => Number(r.trakt_id)),
      );
      chunk = chunk.filter((item) => !existingTraktIds.has(item.id));

      if (chunk.length === 0 && !fullSync) {
        statusLog("  → Up to date. Stopping early.");
        stopSyncing = true;
        break;
      } else if (chunk.length === 0 && fullSync) {
        continue;
      }

      // ── Phase 1: Parent metadata ──────────────────────────────────────────
      const showsToSync = new Map<number, TraktShow>();
      const moviesToSync = new Map<number, TraktMovie>();

      for (const item of chunk) {
        if (item.type === "episode" && item.show?.ids.tmdb) {
          if (!syncedShows.has(item.show.ids.tmdb)) {
            showsToSync.set(item.show.ids.tmdb, item.show);
            syncedShows.add(item.show.ids.tmdb);
          }
        } else if (item.type === "movie" && item.movie?.ids.tmdb) {
          if (!syncedMovies.has(item.movie.ids.tmdb)) {
            moviesToSync.set(item.movie.ids.tmdb, item.movie);
            syncedMovies.add(item.movie.ids.tmdb);
          }
        }
      }

      const showList = Array.from(showsToSync.values());
      const movieList = Array.from(moviesToSync.values());
      const total = showList.length + movieList.length;

      if (total > 0) {
        let done = 0;
        statusStart(
          `Metadata  [0/${total}]  shows:${showList.length}  movies:${movieList.length}`,
        );

        const runShow = async (show: TraktShow) => {
          try {
            await transaction((client) =>
              syncShow(client, show, stats, options),
            );
          } catch (err: any) {
            const msg = `Show "${show.title}": ${err.message}`;
            stats.errors.push(msg);
            process.stdout.write(`  ✗  ${msg}\n`);
          }
          done++;
          process.stdout.write(
            `  ⟳  Metadata  [${done}/${total}]  "${show.title}"\r`,
          );
        };

        const runMovie = async (movie: TraktMovie) => {
          try {
            await transaction((client) =>
              syncMovieMetadata(client, movie, stats, options),
            );
          } catch (err: any) {
            const msg = `Movie "${movie.title}": ${err.message}`;
            stats.errors.push(msg);
            process.stdout.write(`  ✗  ${msg}\n`);
          }
          done++;
          process.stdout.write(
            `  ⟳  Metadata  [${done}/${total}]  "${movie.title}"\r`,
          );
        };

        // Run shows and movies concurrently (each with their own lower limit)
        await Promise.all([
          runConcurrent(showList, runShow, showConcurrency),
          runConcurrent(movieList, runMovie, movieConcurrency),
        ]);

        statusDone(
          `Metadata  [${done}/${total}] complete  errors:${stats.errors.length}`,
        );
      }

      // ── Phase 2: Episodes + watch history ─────────────────────────────────
      const histTotal = chunk.length;
      let histDone = 0;
      const epiCount = chunk.filter((it) => it.type === "episode").length;
      const movCount = chunk.filter((it) => it.type === "movie").length;

      statusStart(
        `History   [0/${histTotal}]  episodes:${epiCount}  movies:${movCount}`,
      );

      await Promise.all(
        chunk.map(async (item) => {
          try {
            await transaction(async (client) => {
              if (item.type === "movie" && item.movie?.ids.tmdb) {
                const res = await recordWatchHistory(
                  client,
                  item.movie.ids.tmdb,
                  "movie",
                  item,
                );
                if (res) stats.new_history_added++;
              } else if (item.type === "episode" && item.show && item.episode) {
                const res = await syncEpisode(
                  client,
                  item.episode,
                  item.show,
                  item,
                  stats,
                  options,
                );
                if (res) stats.new_history_added++;
              }
            });
          } catch (error: any) {
            const tmdbId = item.movie?.ids.tmdb || item.episode?.ids.tmdb;
            stats.errors.push(
              `History Trakt:${item.id} TMDB:${tmdbId ?? "?"}: ${error.message}`,
            );
          }
          histDone++;
          process.stdout.write(`  ⟳  History   [${histDone}/${histTotal}]\r`);
        }),
      );

      statusDone(`History   [${histDone}/${histTotal}] complete`);
      await new Promise((res) => setTimeout(res, 100));
    }

    stats.history_records_checked += history.length;
    page++;
  }

  // ── Phase 3: Ratings ──────────────────────────────────────────────────────
  statusStart("Ratings sync…");
  await syncTraktRatings();
  statusDone("Ratings sync complete");

  if (_statusTimer) clearInterval(_statusTimer);
  printStats(stats);
  return { success: true, stats };
}
