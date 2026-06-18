/**
 * Trakt Watch History Pusher & Database Syncer
 * 
 * Usage:
 *   npx tsx scripts/history_fixer/push-history.ts <path_to_json_file_or_dir>
 * 
 * Examples:
 *   # Push a single show:
 *   npx tsx scripts/history_fixer/push-history.ts scripts/history_fixer/output/friends.json
 * 
 *   # Push all shows in output directory:
 *   npx tsx scripts/history_fixer/push-history.ts scripts/history_fixer/output/
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
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

interface ScheduledEpisode {
  tmdb_id: number;
  trakt_id: number | null;
  season: number;
  number: number;
  title: string;
  runtime: number;
  old_watched_at: string;
  new_watched_at: string;
}

interface HistoryPayload {
  show: {
    tmdb_id: number;
    name: string;
    trakt_id: number | null;
  };
  config: {
    start_date: string;
    end_date: string;
    generated_at: string;
  };
  episodes: ScheduledEpisode[];
}

async function resolveTraktShowId(tmdbId: number, token: string): Promise<number | null> {
  const TRAKT_BASE_URL = "https://api.trakt.tv";
  const url = `${TRAKT_BASE_URL}/search/tmdb/${tmdbId}?type=show`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processSingleFile(resolvedPath: string, token: string) {
  console.log(`\n============================================================`);
  console.log(`📖 Reading watch history file: ${path.basename(resolvedPath)}`);
  const fileData = fs.readFileSync(resolvedPath, "utf8");
  const payload: HistoryPayload = JSON.parse(fileData);

  const { show, episodes } = payload;
  console.log(`🎬 Target Show: "${show.name}" (TMDB: ${show.tmdb_id}, Trakt: ${show.trakt_id})`);
  console.log(`📺 Total episodes to push: ${episodes.length}`);

  // Chunk and POST to Trakt
  const chunkSize = 100;
  let successCount = 0;

  console.log("🚀 Pushing watch history to Trakt in chunks of 100...");
  for (let i = 0; i < episodes.length; i += chunkSize) {
    if (i > 0) {
      await sleep(1000); // Respect Trakt POST rate limit of 1 call per second
    }
    const chunk = episodes.slice(i, i + chunkSize);
    
    // Format episodes for Trakt API
    const traktEpisodesPayload = chunk.map((ep) => {
      const ids: Record<string, number> = {};
      if (ep.trakt_id) {
        ids.trakt = ep.trakt_id;
      } else {
        ids.tmdb = ep.tmdb_id;
      }

      return {
        watched_at: ep.new_watched_at,
        ids,
      };
    });

    const response = await fetch(`${TRAKT_BASE_URL}/sync/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ episodes: traktEpisodesPayload }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to push chunk ${i / chunkSize + 1}:`, errorText);
      throw new Error(`Trakt API error: ${response.statusText}`);
    }

    const resData = await response.json();
    successCount += resData.added.episodes;
    console.log(`   ✓ Chunk ${i / chunkSize + 1}: Added ${resData.added.episodes} episodes to Trakt.`);
  }

  console.log(`🎉 Trakt sync completed! Total episodes added to Trakt: ${successCount}`);

  // Fetch updated Trakt history for this show to get the new scrobble/history item IDs
  console.log("📥 Fetching new scrobble history from Trakt to obtain unique history IDs...");
  
  let showTraktId = show.trakt_id;
  if (!showTraktId) {
    console.log(`🔍 Show Trakt ID is missing. Attempting to resolve via TMDB ID (${show.tmdb_id})...`);
    showTraktId = await resolveTraktShowId(show.tmdb_id, token);
    if (showTraktId) {
      console.log(`   ✓ Resolved Trakt ID from Trakt API: ${showTraktId}`);
      // Also update database shows table!
      await query(
        `UPDATE shows SET trakt_id = $1 WHERE tmdb_id = $2 AND trakt_id IS NULL`,
        [showTraktId, show.tmdb_id]
      );
    } else {
      showTraktId = show.tmdb_id;
    }
  }
  let page = 1;
  let hasMore = true;
  const traktHistory: any[] = [];
  let fetchFailed = false;

  try {
    while (hasMore) {
      const url = `${TRAKT_BASE_URL}/sync/history/shows/${showTraktId}?limit=250&page=${page}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "trakt-api-version": "2",
          "trakt-api-key": process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`[${response.status}] ${response.statusText}`);
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
  } catch (err: any) {
    console.warn(`⚠️ Warning: Failed to fetch scrobble IDs from Trakt: ${err.message}.`);
    fetchFailed = true;
  }

  // Map Trakt Episode ID -> TMDB Episode ID
  console.log("🗄️ Mapping database episodes...");
  const dbEpisodesRes = await query(
    `SELECT tmdb_id, trakt_id FROM episodes WHERE show_tmdb_id = $1`,
    [show.tmdb_id]
  );
  
  const traktToTmdbMap = new Map<number, number>();
  for (const row of dbEpisodesRes.rows) {
    if (row.trakt_id) {
      traktToTmdbMap.set(Number(row.trakt_id), Number(row.tmdb_id));
    }
  }

  // Sync with local database
  console.log("💾 Updating local database watch_history...");
  
  const activeTmdbIds: number[] = [];
  let dbUpdatesCount = 0;

  if (fetchFailed) {
    console.log("⚠️ Using local JSON schedule fallback to update database...");
    for (const ep of episodes) {
      activeTmdbIds.push(ep.tmdb_id);
      await query(
        `INSERT INTO watch_history (tmdb_id, media_type, watched_at, trakt_id)
         VALUES ($1, 'episode', $2, $3)
         ON CONFLICT (tmdb_id, media_type) 
         DO UPDATE SET 
           watched_at = EXCLUDED.watched_at,
           trakt_id = EXCLUDED.trakt_id`,
        [ep.tmdb_id, ep.new_watched_at, ep.trakt_id || null]
      );
      dbUpdatesCount++;
    }
  } else {
    for (const item of traktHistory) {
      if (item.type !== "episode") continue;

      const traktEpId = item.episode?.ids?.trakt;
      const tmdbEpId = item.episode?.ids?.tmdb;
      
      let localTmdbId = traktEpId ? traktToTmdbMap.get(Number(traktEpId)) : undefined;
      if (!localTmdbId && tmdbEpId) {
        localTmdbId = Number(tmdbEpId);
      }

      if (localTmdbId) {
        activeTmdbIds.push(localTmdbId);
        
        // Upsert watch_history record (preserves existing ratings)
        await query(
          `INSERT INTO watch_history (tmdb_id, media_type, watched_at, trakt_id)
           VALUES ($1, 'episode', $2, $3)
           ON CONFLICT (tmdb_id, media_type) 
           DO UPDATE SET 
             watched_at = EXCLUDED.watched_at,
             trakt_id = EXCLUDED.trakt_id`,
          [localTmdbId, item.watched_at, item.id]
        );
        dbUpdatesCount++;
      }
    }
  }

  // Delete local watch history records for episodes that are no longer in the Trakt history
  if (activeTmdbIds.length > 0) {
    const deleteRes = await query(
      `DELETE FROM watch_history
       WHERE media_type = 'episode'
         AND tmdb_id IN (SELECT tmdb_id FROM episodes WHERE show_tmdb_id = $1)
         AND tmdb_id NOT IN (SELECT unnest($2::integer[]))`,
      [show.tmdb_id, activeTmdbIds]
    );
    if (deleteRes.rowCount && deleteRes.rowCount > 0) {
      console.log(`   ✓ Deleted ${deleteRes.rowCount} stale watch history records from local DB.`);
    }
  } else {
    // If no watched episodes remain on Trakt, wipe all history for this show locally
    const deleteRes = await query(
      `DELETE FROM watch_history
       WHERE media_type = 'episode'
         AND tmdb_id IN (SELECT tmdb_id FROM episodes WHERE show_tmdb_id = $1)`,
      [show.tmdb_id]
    );
    if (deleteRes.rowCount && deleteRes.rowCount > 0) {
      console.log(`   ✓ Cleared all ${deleteRes.rowCount} watch history records locally.`);
    }
  }

  console.log(`   ✓ Database update complete. ${dbUpdatesCount} rows upserted.`);

  // Move JSON and report to completed/ folder
  const completedDir = path.join(process.cwd(), "scripts/history_fixer/completed");
  fs.mkdirSync(completedDir, { recursive: true });

  const destPath = path.join(completedDir, path.basename(resolvedPath));
  if (resolvedPath !== destPath) {
    try {
      fs.renameSync(resolvedPath, destPath);
      console.log(`🚚 Moved schedule file to completed: ${destPath}`);
    } catch (err: any) {
      console.warn(`⚠️ Warning: could not move JSON file to completed directory: ${err.message}`);
    }
  }

  const dirName = path.dirname(resolvedPath);
  const baseNameWithoutExt = path.basename(resolvedPath, ".json");
  const reportPath = path.join(dirName, `${baseNameWithoutExt}-report.md`);
  const destReportPath = path.join(completedDir, `${baseNameWithoutExt}-report.md`);
  if (fs.existsSync(reportPath) && reportPath !== destReportPath) {
    try {
      fs.renameSync(reportPath, destReportPath);
      console.log(`🚚 Moved report file to completed: ${destReportPath}`);
    } catch (err: any) {
      console.warn(`⚠️ Warning: could not move report file to completed directory: ${err.message}`);
    }
  }

  console.log(`============================================================`);
}

async function main() {
  const filePathArg = process.argv[2];

  if (!filePathArg) {
    console.log("\n❌ Path to JSON history file or output directory is required!");
    console.log("Usage:");
    console.log("  npx tsx scripts/history_fixer/push-history.ts <path_to_json_file_or_dir>");
    console.log("Examples:");
    console.log("  npx tsx scripts/history_fixer/push-history.ts scripts/history_fixer/output/friends.json");
    console.log("  npx tsx scripts/history_fixer/push-history.ts scripts/history_fixer/output/\n");
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePathArg);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Path not found: ${resolvedPath}`);
    process.exit(1);
  }

  // Retrieve Trakt token once at start
  console.log("🔐 Authenticating with Trakt...");
  const { getValidTraktToken } = await import("../../lib/screen/trakt");
  const token = await getValidTraktToken();
  console.log("🔑 Trakt authentication successful.");

  const stat = fs.statSync(resolvedPath);
  let filesToProcess: string[] = [];

  if (stat.isDirectory()) {
    const files = fs.readdirSync(resolvedPath);
    filesToProcess = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(resolvedPath, file));
    
    if (filesToProcess.length === 0) {
      console.log(`⚠️ No JSON files found in directory: ${resolvedPath}`);
      await pool.end();
      process.exit(0);
    }
    console.log(`📂 Found ${filesToProcess.length} JSON schedule files to process.`);
  } else {
    filesToProcess = [resolvedPath];
  }

  for (const file of filesToProcess) {
    try {
      await processSingleFile(file, token);
    } catch (err: any) {
      console.error(`❌ Error processing file ${path.basename(file)}:`, err.message);
    }
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(" ✅ All scheduled watch history files have been pushed!");
  console.log("════════════════════════════════════════════════════════════\n");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error running script:", err);
  pool.end();
  process.exit(1);
});
