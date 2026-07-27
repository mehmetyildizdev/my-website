/**
 * TMDB Direct Show Importer & Watch History Generator
 * 
 * Usage:
 *   npx tsx scripts/history_fixer/import-show.ts <tmdb_show_id> <start_date_or_year> <end_date_or_year> [rating_1_to_10] [season_count] [-binge | -relaxed | -heavy-binge]
 * 
 * Examples:
 *   npx tsx scripts/history_fixer/import-show.ts 1668 2011-08-21 2013-08-21 9
 *   npx tsx scripts/history_fixer/import-show.ts 1434 2020 2021 8 3 -heavy-binge
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Pool } from "pg";
import {
  getIstanbulDateString,
  getIstanbulTimeString,
  getIstanbulMonthYearString,
  getIstanbulYear,
  formatAirDate,
  parseAirDateToUTC,
} from "./utils/timezone";

import {
  parseYearOrDate,
  generateSchedule,
  getISOWeek,
  type EpisodeRowForScheduling,
  type ScheduledEpisode,
} from "./utils/scheduler";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Helper to fetch from TMDB API
async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_API_READ_ACCESS_TOKEN is missing in environment");

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText} (${endpoint})`);
  }
  return response.json();
}


const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const isRelaxed = process.argv.includes("-relaxed");
  const isHeavyBinge = process.argv.includes("-heavy-binge");
  const isBinge = process.argv.includes("-binge") || isHeavyBinge || !isRelaxed;

  const cleanArgs = process.argv.filter(arg => arg !== "-relaxed" && arg !== "-binge" && arg !== "-heavy-binge");
  const tmdbIdStr = cleanArgs[2];
  const startDateStr = cleanArgs[3];
  const endDateStr = cleanArgs[4];
  const ratingStr = cleanArgs[5];
  const seasonCountStr = cleanArgs[6];

  if (!tmdbIdStr || !startDateStr || !endDateStr) {
    console.log("\n❌ Missing arguments!");
    console.log("Usage:");
    console.log("  npx tsx scripts/history_fixer/import-show.ts <tmdb_show_id> <start_date_or_year> <end_date_or_year> [rating_1_to_10] [season_count] [-binge | -relaxed | -heavy-binge]");
    console.log("Example:");
    console.log("  npx tsx scripts/history_fixer/import-show.ts 1668 2011 2013 8 3 -heavy-binge\n");
    process.exit(1);
  }

  const tmdbShowId = parseInt(tmdbIdStr, 10);
  if (isNaN(tmdbShowId)) {
    console.error("❌ Invalid TMDB Show ID. Must be a number.");
    process.exit(1);
  }

  let rating: number | null = null;
  if (ratingStr) {
    rating = parseInt(ratingStr, 10);
    if (isNaN(rating) || rating < 1 || rating > 10) {
      console.error("❌ Invalid rating. Must be a number between 1 and 10.");
      process.exit(1);
    }
  }

  let seasonCount: number | null = null;
  if (seasonCountStr) {
    seasonCount = parseInt(seasonCountStr, 10);
    if (isNaN(seasonCount) || seasonCount < 1) {
      console.error("❌ Invalid season count. Must be a positive number.");
      process.exit(1);
    }
  }

  let start = parseYearOrDate(startDateStr, false);
  let end = parseYearOrDate(endDateStr, true);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error("❌ Invalid start_date or end_date format (use YYYY-MM-DD or YYYY).");
    process.exit(1);
  }

  console.log(`📡 Querying TMDB for TV Show details (ID: ${tmdbShowId})...`);
  const showData = await fetchTMDB(`/tv/${tmdbShowId}`, { append_to_response: "external_ids" });
  console.log(`🎬 Found Show on TMDB: "${showData.name}"`);

  // 1. Insert Show, Seasons, Genres, Countries, Networks, Companies, Cast, and Crew into DB
  console.log("💾 Running full metadata synchronization (genres, countries, networks, production companies, cast, crew)...");
  const { syncShow } = await import("../../lib/screen/sync/shows");
  const { makeSyncStats } = await import("../../lib/screen/sync/constants");

  const client = await pool.connect();
  const stats = makeSyncStats();
  try {
    const traktShow = {
      title: showData.name,
      year: showData.first_air_date ? new Date(showData.first_air_date).getFullYear() : 0,
      ids: {
        trakt: null as any,
        tmdb: tmdbShowId,
        imdb: showData.external_ids?.imdb_id || undefined,
      }
    };
    await syncShow(client, traktShow, stats);
    console.log(`✓ Metadata synchronization complete. Added/updated "${showData.name}".`);
  } catch (err) {
    console.error("❌ Warning: failed to sync all metadata:", err);
  } finally {
    client.release();
  }

  const episodesToSchedule: EpisodeRowForScheduling[] = [];
  const seasonFinales = new Set<string>();

  // 2. Fetch and insert each season and its episodes
  for (const season of showData.seasons) {
    if (season.season_number === 0) {
      console.log("   ⏭️  Skipping Specials (Season 0)...");
      continue;
    }
    if (seasonCount !== null && season.season_number > seasonCount) {
      console.log(`   ⏭️  Skipping Season ${season.season_number} (limit is ${seasonCount})...`);
      continue;
    }

    console.log(`📡 Fetching Season ${season.season_number} episodes from TMDB...`);
    const seasonData = await fetchTMDB(`/tv/${tmdbShowId}/season/${season.season_number}`);


    // Upsert episodes and build queue
    let maxEpNum = 0;
    for (const ep of seasonData.episodes) {
      if (ep.episode_number > maxEpNum) {
        maxEpNum = ep.episode_number;
      }

      await query(
        `INSERT INTO episodes (tmdb_id, show_tmdb_id, season_number, episode_number, title, runtime, air_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (tmdb_id) DO UPDATE SET
           season_number = EXCLUDED.season_number,
           episode_number = EXCLUDED.episode_number,
           title = EXCLUDED.title,
           runtime = EXCLUDED.runtime,
           air_date = EXCLUDED.air_date`,
        [
          ep.id,
          tmdbShowId,
          ep.season_number,
          ep.episode_number,
          ep.name,
          ep.runtime || null,
          ep.air_date || null,
        ]
      );

      episodesToSchedule.push({
        tmdb_id: ep.id,
        season_number: ep.season_number,
        episode_number: ep.episode_number,
        title: ep.name,
        runtime: ep.runtime || null,
        air_date: ep.air_date || null,
      });
    }

    // Mark season finale
    if (maxEpNum > 0) {
      seasonFinales.add(`${seasonData.season_number}-${maxEpNum}`);
    }
  }

  console.log(`\n📺 DB Sync complete. Imported ${episodesToSchedule.length} episodes across ${showData.number_of_seasons} seasons.`);

  // Find earliest episode air date to adjust start date if needed
  let firstEpAirDate: Date | null = null;
  for (const ep of episodesToSchedule) {
    if (ep.air_date) {
      const airDateUTC = parseAirDateToUTC(ep.air_date);
      if (!firstEpAirDate || airDateUTC < firstEpAirDate) {
        firstEpAirDate = airDateUTC;
      }
    }
  }

  // Adjust start date to be after first episode air date if it is year-only random pick
  const isStartYearOnly = startDateStr.match(/^(\d{4})$/) !== null;
  if (isStartYearOnly && firstEpAirDate && start < firstEpAirDate) {
    console.log(`ℹ️ Adjusting start date to show's first watched episode air date: ${getIstanbulDateString(firstEpAirDate)}`);
    const startYear = parseInt(startDateStr, 10);
    const endOfYear = new Date(Date.UTC(startYear, 11, 31));
    if (firstEpAirDate < endOfYear) {
      const minMs = firstEpAirDate.getTime();
      const maxMs = endOfYear.getTime();
      start = new Date(minMs + Math.random() * (maxMs - minMs));
    } else {
      start = new Date(firstEpAirDate);
    }
  } else if (firstEpAirDate && start < firstEpAirDate) {
    console.log(`⚠️ Specified start date is before show air date. Adjusting to air date: ${getIstanbulDateString(firstEpAirDate)}`);
    start = new Date(firstEpAirDate);
  }

  // Ensure start is before end
  if (start > end) {
    console.log(`ℹ️ Adjusting end date to be after start date...`);
    end = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000); // Default to 90 days after start
  }

  console.log(`🗓️ Configured watch range: ${getIstanbulDateString(start)} to ${getIstanbulDateString(end)} (${isRelaxed ? "relaxed" : "binge"} mode)`);
  console.log(`🗓️ Scheduling episodes...`);

  // 3. Scheduling
  const scheduled = generateSchedule(episodesToSchedule, start, end, isRelaxed, isHeavyBinge);

  // 4. Save JSON schedule
  const completedDir = path.join(process.cwd(), "scripts/history_fixer/completed");
  fs.mkdirSync(completedDir, { recursive: true });

  const slug = showData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const outputPath = path.join(completedDir, `${slug}.json`);

  const payload = {
    show: {
      tmdb_id: showData.id,
      name: showData.name,
      media_key: "show:" + showData.id,
    },
    config: {
      start_date: startDateStr,
      end_date: endDateStr,
      generated_at: new Date().toISOString(),
    },
    episodes: scheduled,
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");

  // 5. Generate Markdown report
  const reportPath = path.join(completedDir, `${slug}-report.md`);
  let totalRuntime = 0;
  const monthlyStats = new Map<string, number>();
  const weeklyStats = new Map<string, { count: number; minDate: Date; maxDate: Date }>();
  const dailyCounts = new Map<string, number>();
  
  for (const ep of scheduled) {
    totalRuntime += ep.runtime;
    const dateObj = new Date(ep.new_watched_at);
    
    const monthKey = getIstanbulMonthYearString(dateObj);
    monthlyStats.set(monthKey, (monthlyStats.get(monthKey) || 0) + 1);
    
    const dateStr = getIstanbulDateString(dateObj);
    dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
    
    const weekNum = getISOWeek(dateObj);
    const year = getIstanbulYear(dateObj);
    const weekKey = `${year}-W${String(weekNum).padStart(2, "0")}`;
    const currWeek = weeklyStats.get(weekKey) || { count: 0, minDate: dateObj, maxDate: dateObj };
    currWeek.count++;
    if (dateObj < currWeek.minDate) currWeek.minDate = dateObj;
    if (dateObj > currWeek.maxDate) currWeek.maxDate = dateObj;
    weeklyStats.set(weekKey, currWeek);
  }
  
  const distribution = new Map<number, number>();
  for (const c of dailyCounts.values()) {
    distribution.set(c, (distribution.get(c) || 0) + 1);
  }

  const firstEp = scheduled[0];
  const lastEp = scheduled[scheduled.length - 1];

  let md = `# Watch History Report: ${showData.name}\n\n`;
  md += `Generated on: ${new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" })}\n\n`;
  md += `## 📊 General Statistics\n\n`;
  md += `- **Show Name**: ${showData.name}\n`;
  md += `- **Watch Date Range**: ${getIstanbulDateString(new Date(firstEp.new_watched_at))} to ${getIstanbulDateString(new Date(lastEp.new_watched_at))}\n`;
  md += `- **Total Episodes Watched**: ${scheduled.length}\n`;
  md += `- **Total Watch Time**: ${Math.floor(totalRuntime / 60)} hours ${totalRuntime % 60} minutes\n`;
  md += `- **Average Episodes per Watch Day**: ${(scheduled.length / dailyCounts.size).toFixed(2)} episodes/day\n\n`;
  
  md += `## 📅 Monthly Watch Statistics\n\n`;
  md += `| Month | Episodes Watched |\n`;
  md += `| :--- | :---: |\n`;
  const sortedMonths = Array.from(monthlyStats.entries()).sort((a, b) => {
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });
  for (const [month, c] of sortedMonths) {
    md += `| ${month} | ${c} |\n`;
  }
  md += `\n`;
  
  md += `## 🗓️ Weekly Watch Statistics\n\n`;
  md += `| Week | Date Range | Episodes Watched |\n`;
  md += `| :--- | :--- | :---: |\n`;
  const sortedWeeks = Array.from(weeklyStats.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [week, info] of sortedWeeks) {
    const minStr = getIstanbulDateString(info.minDate);
    const maxStr = getIstanbulDateString(info.maxDate);
    md += `| ${week} | ${minStr} to ${maxStr} | ${info.count} |\n`;
  }
  md += `\n`;
  
  md += `## 🎭 Daily watch count session sizes\n\n`;
  md += `| Episodes Watched in a Day | Number of Days | Percentage |\n`;
  md += `| :---: | :---: | :---: |\n`;
  const sortedDist = Array.from(distribution.entries()).sort((a, b) => a[0] - b[0]);
  const totalDays = dailyCounts.size;
  for (const [eps, days] of sortedDist) {
    const pct = ((days / totalDays) * 100).toFixed(1);
    md += `| ${eps} | ${days} | ${pct}% |\n`;
  }
  md += `\n`;
  
  md += `## 📋 Detailed Schedule\n\n`;
  md += `| Episode | Title | Original Air Date | Scheduled Watch Date |\n`;
  md += `| :--- | :--- | :---: | :---: |\n`;
  for (const item of scheduled) {
    const originalEp = episodesToSchedule.find(e => e.tmdb_id === item.tmdb_id);
    const airStr = originalEp?.air_date ? formatAirDate(originalEp.air_date) : "N/A";
    const dateObj = new Date(item.new_watched_at);
    const dateStr = getIstanbulDateString(dateObj);
    const timeStr = getIstanbulTimeString(dateObj);
    md += `| S${String(item.season).padStart(2, "0")}E${String(item.number).padStart(2, "0")} | ${item.title} | ${airStr} | ${dateStr} @ ${timeStr} |\n`;
  }

  fs.writeFileSync(reportPath, md, "utf8");
  console.log(`📝 Generated statistics report: ${reportPath}`);

  // 6. Write JSON schedule
  const finalEpisodes = scheduled;
  const updatedPayload = {
    show: {
      tmdb_id: showData.id,
      name: showData.name,
      media_key: "show:" + showData.id,
    },
    config: {
      start_date: startDateStr,
      end_date: endDateStr,
      generated_at: new Date().toISOString(),
    },
    episodes: finalEpisodes,
  };
  fs.writeFileSync(outputPath, JSON.stringify(updatedPayload, null, 2), "utf8");
  console.log(`✓ Wrote JSON schedule to ${outputPath}`);


  // 7. Database update for watch history!
  console.log("\n💾 Updating local database watch_history table...");
  let upsertCount = 0;
  for (const item of finalEpisodes) {
    await query(
      `INSERT INTO watch_history (tmdb_id, media_type, watched_at, media_key)
       VALUES ($1, 'episode', $2, $3)
       ON CONFLICT (tmdb_id, media_type)
       DO UPDATE SET
         watched_at = EXCLUDED.watched_at,
         media_key = EXCLUDED.media_key`,
      [item.tmdb_id, item.new_watched_at, item.media_key]
    );
    upsertCount++;
  }
  console.log(`   ✓ Database update complete. ${upsertCount} episodes upserted to watch_history.`);

  // Update local DB show's rating
  if (rating !== null) {
    await query(
      `UPDATE shows SET my_rating = $1 WHERE tmdb_id = $2`,
      [rating, tmdbShowId]
    );
    console.log(`   ✓ Local database updated: set "${showData.name}" rating to ${rating}.`);
  }

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(` ✅ Show "${showData.name}" successfully imported and scheduled!`);
  console.log("════════════════════════════════════════════════════════════\n");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error running script:", err);
  pool.end();
  process.exit(1);
});
