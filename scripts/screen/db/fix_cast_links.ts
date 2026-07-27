/**
 * scripts/screen/db/fix_cast_links.ts
 *
 * HIGH-SPEED REPAIR SCRIPT FOR MOVIE & SHOW CAST/CREW LINKS
 * ---------------------------------------------------------
 * Restores missing `movie_cast`, `movie_crew`, `show_cast`, and `show_crew` links
 * for both movies and TV shows in parallel batches (~28.5 req/sec) without fetching
 * any unnecessary season or episode data.
 *
 * RUN:
 *   pnpm tsx -r dotenv/config scripts/screen/db/fix_cast_links.ts
 *
 * FORCE RE-LINK ALL (even if cast already exists):
 *   pnpm tsx -r dotenv/config scripts/screen/db/fix_cast_links.ts --all
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import { fetchTMDB } from '../../../lib/screen/tmdb';
import { processPeopleCredits } from '../../../lib/screen/sync/people';
import { CREW_JOBS, makeSyncStats } from '../../../lib/screen/sync/constants';

dotenv.config({ path: '.env.local' });

if (!process.env.NEON_DATABASE_URL) {
  console.error('❌ NEON_DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const BATCH_SIZE = 30;
const BATCH_DELAY_MS = 350; // Respects TMDB ~30 req/sec limit

const forceAll = process.argv.includes('--all');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: process.env.NEON_DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: true },
});

async function main() {
  const client = await pool.connect();
  const startTime = Date.now();
  const stats = makeSyncStats();

  try {
    console.log('\n============================================================');
    console.log('🎬 [Fix Cast Links] High-Speed Cast & Crew Repair Script');
    console.log(`📌 Mode: ${forceAll ? 'FORCE ALL MOVIES & SHOWS (--all)' : 'AUTO (Only items missing cast links)'}`);
    console.log('============================================================\n');

    // ──────────────────────────────────────────────────────────────────────────
    // PHASE 1: MOVIES CAST & CREW REPAIR
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🎬 PHASE 1: Scanning Movies...');

    const movieQuery = forceAll
      ? `SELECT tmdb_id, title FROM movies ORDER BY tmdb_id`
      : `SELECT tmdb_id, title FROM movies 
         WHERE tmdb_id NOT IN (SELECT DISTINCT movie_tmdb_id FROM movie_cast) 
         ORDER BY tmdb_id`;

    const moviesRes = await client.query(movieQuery);
    const movies = moviesRes.rows;
    console.log(`  Found ${movies.length} movies to process.\n`);

    let moviesProcessed = 0;
    let movieErrors = 0;

    if (movies.length > 0) {
      for (let i = 0; i < movies.length; i += BATCH_SIZE) {
        const batch = movies.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (m) => {
            try {
              const credits = await fetchTMDB(`/movie/${m.tmdb_id}/credits`);

              const crewToSync = (credits?.crew ?? [])
                .filter((c: any) => CREW_JOBS.has(c.job))
                .map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  profile_path: c.profile_path,
                  known_for_department: c.known_for_department,
                  popularity: c.popularity ?? 0,
                  job: c.job,
                }));

              const castToSync = (credits?.cast ?? [])
                .filter((c: any) => c.profile_path)
                .map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  profile_path: c.profile_path,
                  known_for_department: c.known_for_department,
                  popularity: c.popularity ?? 0,
                  character: c.character ?? null,
                  order: c.order,
                }));

              await processPeopleCredits(client, m.tmdb_id, crewToSync, castToSync, 'movie', stats);
              moviesProcessed++;
            } catch (err: any) {
              movieErrors++;
              console.error(`  ✗ [Movie ID: ${m.tmdb_id}] "${m.title}": ${err.message}`);
            }
          })
        );

        const progress = Math.min(i + BATCH_SIZE, movies.length);
        const percent = ((progress / movies.length) * 100).toFixed(1);
        process.stdout.write(
          `  ⟳ Movies: ${progress}/${movies.length} (${percent}%) | Cast Added: ${stats.new_cast_added} | Crew Added: ${stats.new_crew_added} | Errors: ${movieErrors}\n`
        );

        if (i + BATCH_SIZE < movies.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }
      console.log(`  ✓ Phase 1 Complete: Processed ${moviesProcessed} movies.\n`);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PHASE 2: TV SHOWS CAST & CREW REPAIR
    // ──────────────────────────────────────────────────────────────────────────
    console.log('📺 PHASE 2: Scanning TV Shows...');

    const showQuery = forceAll
      ? `SELECT tmdb_id, name FROM shows ORDER BY tmdb_id`
      : `SELECT tmdb_id, name FROM shows 
         WHERE tmdb_id NOT IN (SELECT DISTINCT show_tmdb_id FROM show_cast) 
         ORDER BY tmdb_id`;

    const showsRes = await client.query(showQuery);
    const shows = showsRes.rows;
    console.log(`  Found ${shows.length} shows to process.\n`);

    let showsProcessed = 0;
    let showErrors = 0;

    if (shows.length > 0) {
      for (let i = 0; i < shows.length; i += BATCH_SIZE) {
        const batch = shows.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (s) => {
            try {
              const aggCredits = await fetchTMDB(`/tv/${s.tmdb_id}/aggregate_credits`);

              const crewToSync: any[] = [];
              for (const member of aggCredits.crew ?? []) {
                for (const job of member.jobs ?? []) {
                  if (CREW_JOBS.has(job.job)) {
                    crewToSync.push({
                      id: member.id,
                      name: member.name,
                      profile_path: member.profile_path,
                      known_for_department: member.known_for_department,
                      popularity: member.popularity ?? 0,
                      job: job.job,
                      episode_count: job.episode_count ?? null,
                    });
                  }
                }
              }

              const castToSync = (aggCredits.cast ?? [])
                .filter((c: any) => c.profile_path)
                .map((c: any) => ({
                  id: c.id,
                  name: c.name,
                  profile_path: c.profile_path,
                  known_for_department: c.known_for_department,
                  popularity: c.popularity ?? 0,
                  character: c.roles?.[0]?.character ?? null,
                  episode_count: c.total_episode_count ?? null,
                }));

              await processPeopleCredits(client, s.tmdb_id, crewToSync, castToSync, 'show', stats);
              showsProcessed++;
            } catch (err: any) {
              showErrors++;
              console.error(`  ✗ [Show ID: ${s.tmdb_id}] "${s.name}": ${err.message}`);
            }
          })
        );

        const progress = Math.min(i + BATCH_SIZE, shows.length);
        const percent = ((progress / shows.length) * 100).toFixed(1);
        process.stdout.write(
          `  ⟳ Shows: ${progress}/${shows.length} (${percent}%) | Cast Added: ${stats.new_cast_added} | Crew Added: ${stats.new_crew_added} | Errors: ${showErrors}\n`
        );

        if (i + BATCH_SIZE < shows.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }
      console.log(`  ✓ Phase 2 Complete: Processed ${showsProcessed} TV shows.\n`);
    }

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('============================================================');
    console.log('🎉 [Fix Cast Links] Execution Summary');
    console.log('============================================================');
    console.log(`  • Execution Time:         ${durationSec} seconds`);
    console.log(`  • Movies Processed:       ${moviesProcessed}/${movies.length}`);
    console.log(`  • TV Shows Processed:     ${showsProcessed}/${shows.length}`);
    console.log(`  • New People Created:     ${stats.new_people_added}`);
    console.log(`  • New Cast Links Added:   ${stats.new_cast_added}`);
    console.log(`  • New Crew Links Added:   ${stats.new_crew_added}`);
    console.log(`  • Total Errors:           ${movieErrors + showErrors}`);
    console.log('============================================================\n');
  } catch (err: any) {
    console.error('❌ Fatal Error running fix_cast_links script:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
