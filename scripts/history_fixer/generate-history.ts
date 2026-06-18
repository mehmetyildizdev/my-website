/**
 * Trakt Watch History Generator
 * 
 * Usage:
 *   npx tsx scripts/history_fixer/generate-history.ts <show_name_or_tmdb_id> <start_date_or_year> <end_date_or_year> [season_count] [-binge | -relaxed | -heavy-binge]
 * 
 * Examples:
 *   npx tsx scripts/history_fixer/generate-history.ts "Friends" 2011-08-21 2013-08-21
 *   npx tsx scripts/history_fixer/generate-history.ts 1668 2011 2013 3 -heavy-binge
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
  type EpisodeRow,
  type EpisodeRowForScheduling,
  type ScheduledEpisode,
} from "./utils/scheduler";

async function main() {
  const isRelaxed = process.argv.includes("-relaxed");
  const isHeavyBinge = process.argv.includes("-heavy-binge");
  const isBinge = process.argv.includes("-binge") || isHeavyBinge || !isRelaxed;

  const cleanArgs = process.argv.filter(arg => arg !== "-relaxed" && arg !== "-binge" && arg !== "-heavy-binge");
  const showQuery = cleanArgs[2];
  const startDateStr = cleanArgs[3];
  const endDateStr = cleanArgs[4];
  const seasonCountStr = cleanArgs[5];

  if (!showQuery || !startDateStr || !endDateStr) {
    console.log("\n❌ Missing arguments!");
    console.log("Usage:");
    console.log("  npx tsx scripts/history_fixer/generate-history.ts <show_name_or_tmdb_id> <start_date_or_year> <end_date_or_year> [season_count] [-binge | -relaxed | -heavy-binge]");
    console.log("Example:");
    console.log("  npx tsx scripts/history_fixer/generate-history.ts \"Friends\" 2011 2013 3 -heavy-binge\n");
    process.exit(1);
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

  console.log("🔍 Searching for show in database...");

  // Search show by name or TMDB ID
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

  // Fetch watched episodes
  const episodesRes = await query(
    `SELECT e.tmdb_id, e.trakt_id, e.season_number, e.episode_number, e.title, e.runtime, e.air_date, wh.watched_at as old_watched_at
     FROM episodes e
     JOIN watch_history wh ON e.tmdb_id = wh.tmdb_id AND wh.media_type = 'episode'
     WHERE e.show_tmdb_id = $1
     ORDER BY e.season_number ASC, e.episode_number ASC`,
    [show.tmdb_id]
  );

  let watchedEpisodes: EpisodeRow[] = episodesRes.rows;
  if (watchedEpisodes.length === 0) {
    console.error(`❌ No watch history found for "${show.name}" in the database.`);
    process.exit(1);
  }

  // Filter episodes by season count if provided
  if (seasonCount !== null) {
    watchedEpisodes = watchedEpisodes.filter((ep) => ep.season_number <= seasonCount!);
    console.log(`ℹ️ Filtering watch history to first ${seasonCount} season(s) (${watchedEpisodes.length} episodes).`);
    if (watchedEpisodes.length === 0) {
      console.error(`❌ No watch history found for the first ${seasonCount} season(s) of "${show.name}" in the database.`);
      process.exit(1);
    }
  }

  console.log(`📺 Found ${watchedEpisodes.length} watched episodes in database.`);

  // Find earliest episode air date to adjust start date if needed
  let firstEpAirDate: Date | null = null;
  for (const ep of watchedEpisodes) {
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

  // Generate watch schedule
  const scheduled = generateSchedule(watchedEpisodes, start, end, isRelaxed, isHeavyBinge);

  // Create output directories
  const outputDir = path.join(process.cwd(), "scripts/history_fixer/output");
  fs.mkdirSync(outputDir, { recursive: true });

  const slug = show.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const outputPath = path.join(outputDir, `${slug}.json`);

  const payload = {
    show: {
      tmdb_id: show.tmdb_id,
      name: show.name,
      trakt_id: show.trakt_id,
    },
    config: {
      start_date: startDateStr,
      end_date: endDateStr,
      generated_at: new Date().toISOString(),
    },
    episodes: scheduled,
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");

  // Generate beautiful Markdown report
  const reportPath = path.join(outputDir, `${slug}-report.md`);
  let totalRuntime = 0;
  const monthlyStats = new Map<string, number>(); // "Month Year" -> count
  const weeklyStats = new Map<string, { count: number; minDate: Date; maxDate: Date }>(); // "YYYY-WXX" -> details
  const dailyCounts = new Map<string, number>(); // "YYYY-MM-DD" -> count
  
  for (const ep of scheduled) {
    totalRuntime += ep.runtime;
    const dateObj = new Date(ep.new_watched_at);
    
    // Monthly
    const monthKey = getIstanbulMonthYearString(dateObj);
    monthlyStats.set(monthKey, (monthlyStats.get(monthKey) || 0) + 1);
    
    // Daily
    const dateStr = getIstanbulDateString(dateObj);
    dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
    
    // Weekly
    const weekNum = getISOWeek(dateObj);
    const year = getIstanbulYear(dateObj);
    const weekKey = `${year}-W${String(weekNum).padStart(2, "0")}`;
    const currWeek = weeklyStats.get(weekKey) || { count: 0, minDate: dateObj, maxDate: dateObj };
    currWeek.count++;
    if (dateObj < currWeek.minDate) currWeek.minDate = dateObj;
    if (dateObj > currWeek.maxDate) currWeek.maxDate = dateObj;
    weeklyStats.set(weekKey, currWeek);
  }
  
  // Daily count distribution
  const distribution = new Map<number, number>();
  for (const c of dailyCounts.values()) {
    distribution.set(c, (distribution.get(c) || 0) + 1);
  }

  const firstEp = scheduled[0];
  const lastEp = scheduled[scheduled.length - 1];

  let md = `# Watch History Report: ${show.name}\n\n`;
  md += `Generated on: ${new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" })}\n\n`;
  md += `## 📊 General Statistics\n\n`;
  md += `- **Show Name**: ${show.name}\n`;
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
    const originalEp = watchedEpisodes.find(e => e.tmdb_id === item.tmdb_id);
    const airStr = originalEp?.air_date ? formatAirDate(originalEp.air_date) : "N/A";
    const dateObj = new Date(item.new_watched_at);
    const dateStr = getIstanbulDateString(dateObj);
    const timeStr = getIstanbulTimeString(dateObj);
    md += `| S${String(item.season).padStart(2, "0")}E${String(item.number).padStart(2, "0")} | ${item.title} | ${airStr} | ${dateStr} @ ${timeStr} |\n`;
  }

  fs.writeFileSync(reportPath, md, "utf8");

  // Output ASCII report
  const first = scheduled[0];
  const last = scheduled[scheduled.length - 1];

  console.log("\n════════════════════════════════════════════════════════════");
  console.log(` 🎉 Watch History Generated for "${show.name}"`);
  console.log("════════════════════════════════════════════════════════════");
  console.log(` 📂 Saved file : ${outputPath}`);
  console.log(` 📺 Episodes   : ${scheduled.length}`);
  console.log(` 📅 Range      : ${getIstanbulDateString(new Date(first.new_watched_at))} to ${getIstanbulDateString(new Date(last.new_watched_at))}`);
  console.log("────────────────────────────────────────────────────────────");
  console.log(" 📝 SAMPLE SCHEDULE (First 3 & Last 3):");
  console.log("────────────────────────────────────────────────────────────");

  const sampleCount = 3;
  const printSample = (item: ScheduledEpisode) => {
    const dateObj = new Date(item.new_watched_at);
    const datePart = getIstanbulDateString(dateObj);
    const timePart = getIstanbulTimeString(dateObj);
    console.log(
      `   S${String(item.season).padStart(2, "0")}E${String(item.number).padStart(2, "0")} - ${item.title.substring(0, 25).padEnd(25)} | Watch Date: ${datePart} @ ${timePart} (${item.runtime}m)`
    );
  };

  for (let i = 0; i < Math.min(sampleCount, scheduled.length); i++) {
    printSample(scheduled[i]);
  }
  if (scheduled.length > sampleCount * 2) {
    console.log("   ...");
  }
  const startIndex = Math.max(scheduled.length - sampleCount, sampleCount);
  for (let i = startIndex; i < scheduled.length; i++) {
    printSample(scheduled[i]);
  }
  console.log("════════════════════════════════════════════════════════════\n");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error running script:", err);
  pool.end();
  process.exit(1);
});
