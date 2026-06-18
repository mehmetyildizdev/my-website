/**
 * Trakt to Local DB Watch History Synchronizer & Checker
 * 
 * Usage:
 *   npx tsx scripts/history_fixer/sync-trakt-to-db.ts <show_name_or_tmdb_id> [--sync]
 * 
 * Examples:
 *   # Dry-run check differences:
 *   npx tsx scripts/history_fixer/sync-trakt-to-db.ts "Dexter"
 * 
 *   # Sync local DB to match Trakt:
 *   npx tsx scripts/history_fixer/sync-trakt-to-db.ts "Dexter" --sync
 */
import dotenv from "dotenv";
import { Pool } from "pg";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

const TRAKT_BASE_URL = "https://api.trakt.tv";

async function resolveTraktShowId(tmdbId: number, token: string): Promise<number | null> {
  const url = `${TRAKT_BASE_URL}/search/tmdb/${tmdbId}?type=show`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && data[0].show?.ids?.trakt) {
      return Number(data[0].show.ids.trakt);
    }
  } catch (err) {
    console.error("Error resolving Trakt ID:", err);
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldSync = args.includes("--sync");
  const cleanArgs = args.filter((arg) => arg !== "--sync");
  const showQuery = cleanArgs[0];

  if (!showQuery) {
    console.log("\n❌ Missing arguments!");
    console.log("Usage:");
    console.log("  npx tsx scripts/history_fixer/sync-trakt-to-db.ts <show_name_or_tmdb_id> [--sync]\n");
    process.exit(1);
  }

  console.log("🔍 Searching for show in database...");
  const showRes = await query(
    `SELECT tmdb_id, name, trakt_id FROM shows WHERE name ILIKE $1 OR tmdb_id::text = $2 LIMIT 5`,
    [showQuery.includes("%") ? showQuery : `%${showQuery}%`, showQuery]
  );

  if (showRes.rows.length === 0) {
    console.error(`❌ Show not found matching query: "${showQuery}"`);
    process.exit(1);
  }

  if (showRes.rows.length > 1) {
    console.log(`⚠️ Multiple shows found. Please specify the exact TMDB ID:`);
    for (const row of showRes.rows) {
      console.log(`  - [${row.tmdb_id}] ${row.name}`);
    }
    process.exit(1);
  }

  const show = showRes.rows[0];
  console.log(`🎬 Found show: "${show.name}" (TMDB: ${show.tmdb_id}, Trakt: ${show.trakt_id})`);

  console.log("🔐 Authenticating with Trakt...");
  const { getValidTraktToken } = await import("../../lib/screen/trakt");
  const token = await getValidTraktToken();
  console.log("🔑 Trakt authentication successful.");

  let showTraktId = show.trakt_id;
  if (!showTraktId) {
    console.log(`🔍 Show Trakt ID is missing. Resolving via TMDB ID (${show.tmdb_id})...`);
    showTraktId = await resolveTraktShowId(show.tmdb_id, token);
    if (showTraktId) {
      console.log(`   ✓ Resolved Trakt ID from Trakt API: ${showTraktId}`);
      await query(
        `UPDATE shows SET trakt_id = $1 WHERE tmdb_id = $2 AND trakt_id IS NULL`,
        [showTraktId, show.tmdb_id]
      );
    } else {
      console.error("❌ Could not resolve Trakt ID for this show.");
      process.exit(1);
    }
  }

  console.log("📥 Fetching watch history from Trakt...");
  let page = 1;
  let hasMore = true;
  const traktHistory: any[] = [];

  while (hasMore) {
    const url = `${TRAKT_BASE_URL}/sync/history/shows/${showTraktId}?limit=250&page=${page}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch history from Trakt: [${response.status}] ${response.statusText}`);
      process.exit(1);
    }

    const data = await response.json();
    if (data.length === 0) {
      hasMore = false;
    } else {
      traktHistory.push(...data);
      page++;
    }
  }

  console.log(`   ✓ Retrieved ${traktHistory.length} history records from Trakt.`);

  // Get local DB episodes mapping
  const dbEpisodesRes = await query(
    `SELECT tmdb_id, trakt_id, season_number, episode_number, title 
     FROM episodes 
     WHERE show_tmdb_id = $1`,
    [show.tmdb_id]
  );
  
  const traktToTmdbMap = new Map<number, number>();
  const dbEpisodesMap = new Map<number, typeof dbEpisodesRes.rows[0]>();
  for (const row of dbEpisodesRes.rows) {
    dbEpisodesMap.set(Number(row.tmdb_id), row);
    if (row.trakt_id) {
      traktToTmdbMap.set(Number(row.trakt_id), Number(row.tmdb_id));
    }
  }

  // Get local DB watch history records
  const localHistoryRes = await query(
    `SELECT wh.tmdb_id, wh.watched_at, wh.trakt_id, e.season_number, e.episode_number, e.title
     FROM watch_history wh
     JOIN episodes e ON wh.tmdb_id = e.tmdb_id
     WHERE e.show_tmdb_id = $1 AND wh.media_type = 'episode'`,
    [show.tmdb_id]
  );

  const localHistoryMap = new Map<number, typeof localHistoryRes.rows[0]>();
  for (const row of localHistoryRes.rows) {
    localHistoryMap.set(Number(row.tmdb_id), row);
  }

  console.log(`🏠 Local DB has ${localHistoryRes.rows.length} watch history records.`);

  // Compare history
  const dbMissingOnTrakt: any[] = [];
  const traktMissingInDb: any[] = [];
  const dateMismatches: any[] = [];

  // 1. Check Trakt -> Local DB
  const traktActiveTmdbIds = new Set<number>();
  for (const item of traktHistory) {
    if (item.type !== "episode") continue;
    const traktEpId = item.episode?.ids?.trakt;
    const tmdbEpId = item.episode?.ids?.tmdb;

    let localTmdbId = traktEpId ? traktToTmdbMap.get(Number(traktEpId)) : undefined;
    if (!localTmdbId && tmdbEpId) {
      localTmdbId = Number(tmdbEpId);
    }

    if (localTmdbId) {
      traktActiveTmdbIds.add(localTmdbId);
      const localRec = localHistoryMap.get(localTmdbId);
      if (!localRec) {
        const epMeta = dbEpisodesMap.get(localTmdbId);
        traktMissingInDb.push({
          tmdb_id: localTmdbId,
          season: epMeta?.season_number || item.episode?.season,
          number: epMeta?.episode_number || item.episode?.number,
          title: epMeta?.title || item.episode?.title,
          watched_at: item.watched_at,
          trakt_history_id: item.id,
        });
      } else {
        const traktDate = new Date(item.watched_at).getTime();
        const localDate = new Date(localRec.watched_at).getTime();
        // Allow tiny millisecond differences
        if (Math.abs(traktDate - localDate) > 1000 || localRec.trakt_id !== item.id) {
          dateMismatches.push({
            tmdb_id: localTmdbId,
            season: localRec.season_number,
            number: localRec.episode_number,
            title: localRec.title,
            local_date: localRec.watched_at,
            trakt_date: item.watched_at,
            local_trakt_id: localRec.trakt_id,
            trakt_history_id: item.id,
          });
        }
      }
    }
  }

  // 2. Check Local DB -> Trakt
  for (const row of localHistoryRes.rows) {
    const tmdbId = Number(row.tmdb_id);
    if (!traktActiveTmdbIds.has(tmdbId)) {
      dbMissingOnTrakt.push(row);
    }
  }

  console.log("\n📊 WATCH HISTORY DIFF REPORT:");
  console.log(`  - Episodes watched on Trakt but missing locally : ${traktMissingInDb.length}`);
  console.log(`  - Episodes watched locally but missing on Trakt : ${dbMissingOnTrakt.length}`);
  console.log(`  - Date/ID mismatches between local DB and Trakt : ${dateMismatches.length}`);

  if (traktMissingInDb.length > 0) {
    console.log("\n➕ Trakt watch history missing in database (Sample):");
    traktMissingInDb.slice(0, 5).forEach((item) => {
      console.log(`  - S${String(item.season).padStart(2, "0")}E${String(item.number).padStart(2, "0")} - ${item.title} (Trakt Date: ${item.watched_at})`);
    });
    if (traktMissingInDb.length > 5) console.log(`    ... and ${traktMissingInDb.length - 5} more.`);
  }

  if (dbMissingOnTrakt.length > 0) {
    console.log("\n➖ Local watch history missing on Trakt (Sample):");
    dbMissingOnTrakt.slice(0, 5).forEach((item) => {
      console.log(`  - S${String(item.season_number).padStart(2, "0")}E${String(item.episode_number).padStart(2, "0")} - ${item.title} (Local Date: ${item.watched_at})`);
    });
    if (dbMissingOnTrakt.length > 5) console.log(`    ... and ${dbMissingOnTrakt.length - 5} more.`);
  }

  if (dateMismatches.length > 0) {
    console.log("\n⚠️ Date/ID Mismatches (Sample):");
    dateMismatches.slice(0, 5).forEach((item) => {
      console.log(`  - S${String(item.season).padStart(2, "0")}E${String(item.number).padStart(2, "0")} - ${item.title}`);
      console.log(`      Local  : ${item.local_date} (ID: ${item.local_trakt_id})`);
      console.log(`      Trakt  : ${item.trakt_date} (ID: ${item.trakt_history_id})`);
    });
    if (dateMismatches.length > 5) console.log(`    ... and ${dateMismatches.length - 5} more.`);
  }

  if (!shouldSync) {
    console.log("\n💡 Run with --sync flag to synchronize local database to match Trakt's records.");
    await pool.end();
    return;
  }

  console.log("\n💾 Synchronizing local database to match Trakt history...");

  let upsertedCount = 0;
  // Upsert missing or mismatched records
  for (const item of [...traktMissingInDb, ...dateMismatches]) {
    const traktHistoryId = item.trakt_history_id;
    const watchedAt = item.watched_at || item.trakt_date;

    await query(
      `INSERT INTO watch_history (tmdb_id, media_type, watched_at, trakt_id)
       VALUES ($1, 'episode', $2, $3)
       ON CONFLICT (tmdb_id, media_type)
       DO UPDATE SET
         watched_at = EXCLUDED.watched_at,
         trakt_id = EXCLUDED.trakt_id`,
      [item.tmdb_id, watchedAt, traktHistoryId]
    );
    upsertedCount++;
  }

  let deletedCount = 0;
  // Delete records missing on Trakt
  if (dbMissingOnTrakt.length > 0) {
    const missingTmdbIds = dbMissingOnTrakt.map((item) => Number(item.tmdb_id));
    const deleteRes = await query(
      `DELETE FROM watch_history
       WHERE media_type = 'episode'
         AND tmdb_id IN (SELECT tmdb_id FROM episodes WHERE show_tmdb_id = $1)
         AND tmdb_id IN (SELECT unnest($2::integer[]))`,
      [show.tmdb_id, missingTmdbIds]
    );
    deletedCount = deleteRes.rowCount || 0;
  }

  console.log(`\n✅ Synchronization complete!`);
  console.log(`  - ${upsertedCount} episodes upserted/corrected locally.`);
  console.log(`  - ${deletedCount} stale episodes deleted locally.`);

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error running script:", err);
  pool.end();
  process.exit(1);
});
