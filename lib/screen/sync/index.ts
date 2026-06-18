// lib/screen/sync/index.ts
import { transaction, query } from "../db";
import { fetchTraktHistory } from "../trakt";
import { makeSyncStats, printStats, SyncStats, SyncOptions } from "./constants";
import { syncMovieMetadata } from "./movies";
import { syncShow } from "./shows";
import { syncEpisode, recordWatchHistory } from "./history";
import { syncTraktRatings } from "./ratings";
import { log } from "../logger";

async function runConcurrent<T>(items: T[], runner: (item: T) => Promise<void>, concurrency: number) {
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
  const showConcurrency = 2;
  const movieConcurrency = 4;

  let page = 1;
  let stopSyncing = false;
  const stats: SyncStats = makeSyncStats();
  const syncedShows = new Set<number>();
  const syncedMovies = new Set<number>();

  log.section(`Trakt Sync — ${fullSync ? "FULL" : "QUICK"} mode`);

  while (!stopSyncing) {
    log.startTimer(`Trakt Page ${page}…`);
    const history = await fetchTraktHistory(limitPerPage, page);
    log.stopTimer(`Trakt Page ${page}: ${history.length} records`);

    if (history.length === 0) break;
    stats.pages_processed++;
    if (page > maxPages) { log.info(`Reached page limit (${maxPages}). Stopping.`); break; }

    const chunkSize = 50;
    for (let i = 0; i < history.length; i += chunkSize) {
      let chunk = history.slice(i, i + chunkSize);

      const traktIds = chunk.map(item => item.id);
      const existingRes = await query(
        `SELECT trakt_id FROM watch_history WHERE trakt_id = ANY($1::bigint[])`,
        [traktIds]
      );
      const existingIds = new Set(existingRes.rows.map((r: any) => Number(r.trakt_id)));
      chunk = chunk.filter(item => !existingIds.has(item.id));

      if (chunk.length === 0) {
        if (!fullSync) { log.info("Up to date. Stopping."); stopSyncing = true; break; }
        continue;
      }

      // ── Phase 1: Parent Metadata ──────────────────────────────────────────
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
        log.batch(showList.map(s => s.title), movieList.map(m => m.title));

        let done = 0;
        log.startTimer(`Metadata [0/${total}]`);

        const runShow = async (show: TraktShow) => {
          try {
            await transaction(client => syncShow(client, show, stats, options));
          } catch (err: any) {
            log.error(`Show "${show.title}": ${err.message}`);
            stats.errors.push(`Show "${show.title}": ${err.message}`);
          }
          done++;
          log.progress(`Metadata [${done}/${total}] — "${show.title}"`);
        };

        const runMovie = async (movie: TraktMovie) => {
          try {
            await transaction(client => syncMovieMetadata(client, movie, stats, options));
          } catch (err: any) {
            log.error(`Movie "${movie.title}": ${err.message}`);
            stats.errors.push(`Movie "${movie.title}": ${err.message}`);
          }
          done++;
          log.progress(`Metadata [${done}/${total}] — "${movie.title}"`);
        };

        await Promise.all([
          runConcurrent(showList, runShow, showConcurrency),
          runConcurrent(movieList, runMovie, movieConcurrency),
        ]);

        log.stopTimer(`Metadata [${done}/${total}] complete  errors:${stats.errors.length}`);
      }

      // ── Phase 2: History ──────────────────────────────────────────────────
      const histTotal = chunk.length;
      let histDone = 0;
      log.startTimer(`History [0/${histTotal}]`);

      await Promise.all(
        chunk.map(async item => {
          try {
            await transaction(async client => {
              if (item.type === "movie" && item.movie?.ids.tmdb) {
                const res = await recordWatchHistory(client, item.movie.ids.tmdb, "movie", item);
                if (res) stats.new_history_added++;
              } else if (item.type === "episode" && item.show && item.episode) {
                const res = await syncEpisode(client, item.episode, item.show, item, stats, options);
                if (res) stats.new_history_added++;
              }
            });
          } catch (error: any) {
            stats.errors.push(`History ${item.id}: ${error.message}`);
          }
          histDone++;
          log.progress(`History [${histDone}/${histTotal}]`);
        })
      );

      log.stopTimer(`History [${histDone}/${histTotal}] complete`);
    }

    stats.history_records_checked += history.length;
    page++;
  }

  // ── Phase 3: Ratings ──────────────────────────────────────────────────────
  log.startTimer("Ratings sync…");
  await syncTraktRatings();
  log.stopTimer("Ratings sync complete");

  log.clearTimer();
  printStats(stats);
  return { success: true, stats };
}
