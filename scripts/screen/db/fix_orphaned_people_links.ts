/**
 * scripts/screen/db/fix_orphaned_people_links.ts
 *
 * DEDICATED REPAIR SCRIPT FOR UNLINKED / ORPHANED PEOPLE
 * -------------------------------------------------------
 * Re-connects orphaned people in Neon PostgreSQL with movies and TV shows that ALREADY
 * exist in your local database.
 *
 * How it works:
 * 1. Queries all people in `people` who currently have 0 media links (no movie or show cast/crew entries).
 * 2. Fetches movie_credits and tv_credits from TMDB API for each orphaned person (rate limited to < 30 req/sec).
 * 3. Cross-references TMDB credits against existing `movies` and `shows` in your Neon DB.
 * 4. Inserts missing credit links (`movie_cast`, `movie_crew`, `show_cast`, `show_crew`) for MATCHING existing media.
 * 5. STRICT RULE: Does NOT insert any new movies or shows into your database (link insertion only).
 * 6. Outputs progress to console and generates a report at `zone/fix_orphaned_people_links_report.md`.
 *
 * USAGE:
 *   pnpm tsx -r dotenv/config scripts/screen/db/fix_orphaned_people_links.ts
 *
 * FLAGS (Optional):
 *   --limit=<number>   Limit maximum number of people to process (e.g. --limit=500)
 *   --out=<path>       Custom output report path (default: zone/fix_orphaned_people_links_report.md)
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { CREW_JOBS, castRole } from '../../../lib/screen/sync/constants';
import { parseBirthplaceToCountry } from '../../../lib/screen/utils/birthplace';

dotenv.config({ path: '.env.local' });

if (!process.env.NEON_DATABASE_URL) {
  console.error('❌ NEON_DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const maxLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;

const outArg = args.find((a) => a.startsWith('--out='));
const outputPath = outArg ? path.resolve(outArg.split('=')[1]) : path.resolve(process.cwd(), 'zone/fix_orphaned_people_links_report.md');

// Rate limiting: 25 requests per batch with 1000ms delay strictly respects TMDB 30 req/sec limit
const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 1000;
const FETCH_TIMEOUT_MS = 15000;

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: process.env.NEON_DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: true },
});

async function fetchPersonCombinedCredits(tmdbId: number, token: string): Promise<any> {
  const url = `https://api.themoviedb.org/3/person/${tmdbId}?append_to_response=movie_credits,tv_credits`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`TMDB error HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timer);
    throw err;
  }
}

async function main() {
  const startTime = Date.now();
  const client = await pool.connect();
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;

  if (!token) {
    console.error('❌ TMDB_API_READ_ACCESS_TOKEN is missing in .env.local');
    client.release();
    await pool.end();
    process.exit(1);
  }

  console.log('\n============================================================');
  console.log('🛠️ [Fix Orphaned People Links] Repair Script');
  console.log('============================================================');
  console.log(`📌 Output Report Path: ${outputPath}`);
  console.log(`📌 Processing Limit: ${maxLimit > 0 ? maxLimit : 'ALL (Unlimited)'}`);
  console.log(`📌 Rate Limit: 25 req/batch with 1000ms delay (< 30 req/sec)`);
  console.log('============================================================\n');

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // STEP 1: FETCH EXISTING MOVIES AND SHOWS (LOOKUP SETS)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 STEP 1: Loading existing movie and show IDs from local database...');

    const moviesRes = await client.query('SELECT tmdb_id FROM movies');
    const existingMovieIds = new Set<number>(moviesRes.rows.map((r) => r.tmdb_id));

    const showsRes = await client.query('SELECT tmdb_id FROM shows');
    const existingShowIds = new Set<number>(showsRes.rows.map((r) => r.tmdb_id));

    console.log(`  ✓ Loaded ${existingMovieIds.size} existing movies in database.`);
    console.log(`  ✓ Loaded ${existingShowIds.size} existing shows in database.\n`);

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 2: FIND PEOPLE WITH NO MEDIA LINKS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('📊 STEP 2: Querying people with no media links (0 movie or show credits)...');

    const orphanQuery = `
      SELECT p.tmdb_id, p.name, p.known_for_department, p.place_of_birth
      FROM people p
      WHERE tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM movie_cast)
        AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM movie_crew)
        AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM show_cast)
        AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM show_crew)
      ORDER BY p.tmdb_id
      ${maxLimit > 0 ? `LIMIT ${maxLimit}` : ''}
    `;

    const orphansRes = await client.query(orphanQuery);
    const orphans = orphansRes.rows;

    console.log(`  Found ${orphans.length} orphaned people records to process.\n`);

    if (orphans.length === 0) {
      console.log('🎉 No orphaned people found! All people in DB are connected to media.');
      client.release();
      await pool.end();
      return;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 3: FETCH TMDB CREDITS & LINK EXISTING MEDIA
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🌐 STEP 3: Fetching TMDB credits and restoring links for existing media...\n');

    let processedCount = 0;
    let movieCastAdded = 0;
    let movieCrewAdded = 0;
    let showCastAdded = 0;
    let showCrewAdded = 0;
    let countriesAdded = 0;
    let errorCount = 0;
    const errorLogs: string[] = [];

    for (let i = 0; i < orphans.length; i += BATCH_SIZE) {
      const batch = orphans.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (person) => {
          try {
            const data = await fetchPersonCombinedCredits(person.tmdb_id, token);
            processedCount++;

            // Optional birthplace / country backfill
            const birthplace = data.place_of_birth || person.place_of_birth || '';
            if (birthplace) {
              const isoCode = parseBirthplaceToCountry(birthplace);
              if (isoCode) {
                const countryName = birthplace.split(',').pop()?.trim() ?? '';
                await client.query(`INSERT INTO countries (iso_3166_1, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
                  isoCode,
                  countryName,
                ]);
                const cRes = await client.query(
                  `INSERT INTO person_countries (person_tmdb_id, country_iso) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                  [person.tmdb_id, isoCode],
                );
                countriesAdded += cRes.rowCount ?? 0;
              }
            }

            // 1. Movie Cast
            const movieCast = data.movie_credits?.cast ?? [];
            for (const c of movieCast) {
              if (existingMovieIds.has(c.id)) {
                const order = c.order ?? 999;
                const role = castRole(order);
                const r = await client.query(
                  `INSERT INTO movie_cast (movie_tmdb_id, person_tmdb_id, character, cast_order, role)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT (movie_tmdb_id, person_tmdb_id, character) DO NOTHING`,
                  [c.id, person.tmdb_id, c.character ?? null, order, role],
                );
                movieCastAdded += r.rowCount ?? 0;
              }
            }

            // 2. Movie Crew
            const movieCrew = data.movie_credits?.crew ?? [];
            for (const c of movieCrew) {
              if (existingMovieIds.has(c.id) && CREW_JOBS.has(c.job)) {
                const r = await client.query(
                  `INSERT INTO movie_crew (movie_tmdb_id, person_tmdb_id, job)
                   VALUES ($1, $2, $3)
                   ON CONFLICT (movie_tmdb_id, person_tmdb_id, job) DO NOTHING`,
                  [c.id, person.tmdb_id, c.job],
                );
                movieCrewAdded += r.rowCount ?? 0;
              }
            }

            // 3. Show Cast
            const tvCast = data.tv_credits?.cast ?? [];
            for (const c of tvCast) {
              if (existingShowIds.has(c.id)) {
                const epCount = c.episode_count ?? null;
                const castOrder = c.order ?? null;
                const r = await client.query(
                  `INSERT INTO show_cast (show_tmdb_id, person_tmdb_id, character, cast_order, episode_count)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT (show_tmdb_id, person_tmdb_id, character)
                   DO UPDATE SET episode_count = EXCLUDED.episode_count, cast_order = EXCLUDED.cast_order`,
                  [c.id, person.tmdb_id, c.character ?? null, castOrder, epCount],
                );
                showCastAdded += r.rowCount ?? 0;
              }
            }

            // 4. Show Crew
            const tvCrew = data.tv_credits?.crew ?? [];
            for (const c of tvCrew) {
              if (existingShowIds.has(c.id) && CREW_JOBS.has(c.job)) {
                const epCount = c.episode_count ?? null;
                const r = await client.query(
                  `INSERT INTO show_crew (show_tmdb_id, person_tmdb_id, job, episode_count)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (show_tmdb_id, person_tmdb_id, job)
                   DO UPDATE SET episode_count = EXCLUDED.episode_count`,
                  [c.id, person.tmdb_id, c.job, epCount],
                );
                showCrewAdded += r.rowCount ?? 0;
              }
            }
          } catch (err: any) {
            errorCount++;
            const msg = `[Person ID: ${person.tmdb_id}] "${person.name}": ${err.message || String(err)}`;
            errorLogs.push(msg);
          }
        }),
      );

      const progress = Math.min(i + BATCH_SIZE, orphans.length);
      const percent = ((progress / orphans.length) * 100).toFixed(1);
      process.stdout.write(
        `  ⟳ Progress: ${progress}/${orphans.length} (${percent}%) | Movie Cast: +${movieCastAdded} | Movie Crew: +${movieCrewAdded} | Show Cast: +${showCastAdded} | Show Crew: +${showCrewAdded}\r`,
      );

      if (i + BATCH_SIZE < orphans.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    process.stdout.write('\n\n  ✓ Processing complete!\n\n');

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 4: VERIFY REMAINING ORPHANS AFTER REPAIR
    // ──────────────────────────────────────────────────────────────────────────
    const postOrphanRes = await client.query(`
      SELECT p.tmdb_id, p.name, p.known_for_department, p.imdb_id, p.place_of_birth, COALESCE(p.popularity, 0)::float AS popularity
      FROM people p
      WHERE tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM movie_cast)
        AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM movie_crew)
        AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM show_cast)
        AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM show_crew)
      ORDER BY p.tmdb_id
    `);

    const remainingOrphans = postOrphanRes.rows;
    const remainingOrphansCount = remainingOrphans.length;
    const totalLinksAdded = movieCastAdded + movieCrewAdded + showCastAdded + showCrewAdded;

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 5: CONSOLE SUMMARY & MARKDOWN REPORT
    // ──────────────────────────────────────────────────────────────────────────
    console.log('============================================================');
    console.log('📋 EXECUTION SUMMARY');
    console.log('============================================================');
    console.log(`• People Evaluated:             ${processedCount}/${orphans.length}`);
    console.log(`• Movie Cast Links Restored:    +${movieCastAdded}`);
    console.log(`• Movie Crew Links Restored:    +${movieCrewAdded}`);
    console.log(`• Show Cast Links Restored:     +${showCastAdded}`);
    console.log(`• Show Crew Links Restored:     +${showCrewAdded}`);
    console.log(`• Total Credit Links Restored:  +${totalLinksAdded}`);
    console.log(`• Country Links Added:          +${countriesAdded}`);
    console.log(`• Remaining Unlinked Orphans:   ${remainingOrphansCount}`);
    console.log(`• Errors Encountered:           ${errorCount}`);
    console.log('============================================================\n');

    const reportLines: string[] = [];
    const timestampStr = new Date().toISOString();

    reportLines.push(`# Fix Orphaned People Links Execution Report`);
    reportLines.push(``);
    reportLines.push(`> **Generated At**: \`${timestampStr}\``);
    reportLines.push(`> **Script**: \`scripts/screen/db/fix_orphaned_people_links.ts\``);
    reportLines.push(``);
    reportLines.push(`## 📊 Summary`);
    reportLines.push(``);
    reportLines.push(`| Metric | Count |`);
    reportLines.push(`| :--- | :---: |`);
    reportLines.push(`| **Orphaned People Evaluated** | ${processedCount} |`);
    reportLines.push(`| **Movie Cast Links Restored** | **+${movieCastAdded}** |`);
    reportLines.push(`| **Movie Crew Links Restored** | **+${movieCrewAdded}** |`);
    reportLines.push(`| **Show Cast Links Restored** | **+${showCastAdded}** |`);
    reportLines.push(`| **Show Crew Links Restored** | **+${showCrewAdded}** |`);
    reportLines.push(`| **Total Credit Links Restored** | **+${totalLinksAdded}** |`);
    reportLines.push(`| **Country Links Added** | +${countriesAdded} |`);
    reportLines.push(`| **Remaining Unlinked Orphans** | **${remainingOrphansCount}** |`);
    reportLines.push(`| **Request Errors** | ${errorCount} |`);
    reportLines.push(``);

    if (remainingOrphansCount > 0) {
      reportLines.push(`## 🔍 Remaining Unlinked Orphan Records (${remainingOrphansCount})`);
      reportLines.push(
        `These people remain unlinked after querying TMDB credits. They either have 0 credits on TMDB or their credits do not exist in your database:`,
      );
      reportLines.push(``);
      reportLines.push(`| TMDB ID | Name | IMDb ID | Known Dept | Place of Birth | Popularity |`);
      reportLines.push(`| :--- | :--- | :--- | :--- | :--- | :---: |`);
      for (const p of remainingOrphans.slice(0, 200)) {
        reportLines.push(
          `| \`${p.tmdb_id}\` | ${p.name} | ${p.imdb_id || '-'} | ${p.known_for_department || '-'} | ${p.place_of_birth || '-'} | ${p.popularity.toFixed(1)} |`,
        );
      }
      if (remainingOrphans.length > 200) {
        reportLines.push(``);
        reportLines.push(`*... showing first 200 of ${remainingOrphans.length} remaining unlinked records.*`);
      }
      reportLines.push(``);
    } else {
      reportLines.push(`## 🔍 Remaining Unlinked Orphan Records`);
      reportLines.push(`> ✅ **0 unlinked records remain.** All people in your database are now connected to media!\n`);
    }

    if (errorLogs.length > 0) {
      reportLines.push(`### ⚠️ Errors Encountered`);
      reportLines.push(``);
      for (const err of errorLogs.slice(0, 50)) {
        reportLines.push(`- \`${err}\``);
      }
      if (errorLogs.length > 50) {
        reportLines.push(`- *... and ${errorLogs.length - 50} more errors.*`);
      }
      reportLines.push(``);
    }

    reportLines.push(`## 🧹 Purge Recommendation`);
    reportLines.push(``);
    reportLines.push(
      `If ${remainingOrphansCount} people still remain unlinked, they genuinely have **no credits** for any movies or TV shows currently in your database.`,
    );
    reportLines.push(`You can safely purge them using SQL:`);
    reportLines.push(``);
    reportLines.push(`\`\`\`sql`);
    reportLines.push(`DELETE FROM people`);
    reportLines.push(`WHERE tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM movie_cast)`);
    reportLines.push(`  AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM movie_crew)`);
    reportLines.push(`  AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM show_cast)`);
    reportLines.push(`  AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM show_crew)`);
    reportLines.push(`  AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM person_countries);`);
    reportLines.push(`\`\`\``);

    const targetDir = path.dirname(outputPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, reportLines.join('\n'), 'utf8');

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`🎉 Repair Script Finished in ${durationSec} seconds.`);
    console.log(`📄 Report saved to: ${outputPath}\n`);
  } catch (err: any) {
    console.error('❌ Fatal Error running fix_orphaned_people_links script:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
