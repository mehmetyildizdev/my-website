/**
 * scripts/screen/db/fix_person_countries.ts
 *
 * DEDICATED REPAIR SCRIPT FOR PERSON COUNTRY LINKS
 *
 * 1. FAST-PATH (No TMDB calls):
 *    Parses `place_of_birth` for all people currently in PostgreSQL and links them to
 *    `countries` and `person_countries` using the expanded birthplace parser.
 *
 * 2. TMDB BACKFILL:
 *    For any people with missing `place_of_birth` (NULL or empty), fetches /person/{id} from
 *    TMDB in batches of 30 with a 350ms delay (~28.5 req/sec) to strictly observe the 30 req/sec limit,
 *    saves the birthplace to `people`, and inserts country links.
 *
 *    RUN:
 *    pnpm tsx -r dotenv/config scripts/screen/db/fix_person_countries.ts
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import { fetchTMDB } from '../../../lib/screen/tmdb';
import { parseBirthplaceToCountry } from '../../../lib/screen/utils/birthplace';

dotenv.config({ path: '.env.local' });

if (!process.env.NEON_DATABASE_URL) {
  console.error('❌ NEON_DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const BATCH_SIZE = 30;
const BATCH_DELAY_MS = 350; // Respects TMDB ~30 req/sec rate limit strictly

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: process.env.NEON_DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: true },
});

async function main() {
  const client = await pool.connect();
  const startTime = Date.now();

  try {
    console.log('\n============================================================');
    console.log('🌍 [Fix Person Countries] Dedicated Country Linking Script');
    console.log('============================================================\n');

    // ──────────────────────────────────────────────────────────────────────────
    // PHASE 1: FAST-PATH (Process existing birthplaces stored in DB)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('⚡ PHASE 1: Processing existing birthplaces in database...');

    const existingRes = await client.query(
      `SELECT tmdb_id, name, place_of_birth FROM people 
       WHERE place_of_birth IS NOT NULL AND place_of_birth != '' 
       ORDER BY tmdb_id`
    );

    const existingPeople = existingRes.rows;
    console.log(`  Found ${existingPeople.length} people with stored birthplace data.`);

    let phase1LinkedCount = 0;
    let phase1UnmatchedCount = 0;

    const isoList: string[] = [];
    const countryNames: string[] = [];
    const personIds: number[] = [];
    const personIsos: string[] = [];

    for (const p of existingPeople) {
      const isoCode = parseBirthplaceToCountry(p.place_of_birth);
      if (isoCode) {
        const countryName = p.place_of_birth.split(',').pop()?.trim() ?? '';
        isoList.push(isoCode);
        countryNames.push(countryName);
        personIds.push(p.tmdb_id);
        personIsos.push(isoCode);
        phase1LinkedCount++;
      } else {
        phase1UnmatchedCount++;
      }
    }

    // Bulk insert countries
    try {
      if (isoList.length > 0) {
        await client.query(
          `INSERT INTO countries (iso_3166_1, name)
           SELECT * FROM UNNEST($1::text[], $2::text[])
           ON CONFLICT DO NOTHING`,
          [isoList, countryNames]
        );
      }

      // Bulk insert person_countries in batches of 5000
      for (let i = 0; i < personIds.length; i += 5000) {
        const batchIds = personIds.slice(i, i + 5000);
        const batchIsos = personIsos.slice(i, i + 5000);
        await client.query(
          `INSERT INTO person_countries (person_tmdb_id, country_iso)
           SELECT * FROM UNNEST($1::int[], $2::text[])
           ON CONFLICT DO NOTHING`,
          [batchIds, batchIsos]
        );
      }
    } catch (phase1Err: any) {
      console.error(`  ✗ Phase 1 SQL Insert Error: ${phase1Err.message}`);
    }

    console.log(
      `  ✓ Phase 1 Complete: Linked ${phase1LinkedCount} person-country relationships (${phase1UnmatchedCount} unmatched).\n`
    );

    // ──────────────────────────────────────────────────────────────────────────
    // PHASE 2: TMDB BACKFILL (Fetch missing birthplaces from TMDB API)
    // ──────────────────────────────────────────────────────────────────────────
    console.log(
      '🌐 PHASE 2: Fetching missing birthplaces from TMDB (Rate limited to ~28 req/sec)...'
    );

    const missingRes = await client.query(
      `SELECT tmdb_id, name FROM people 
       WHERE place_of_birth IS NULL OR place_of_birth = '' 
       ORDER BY tmdb_id`
    );

    const missingPeople = missingRes.rows;
    console.log(`  Found ${missingPeople.length} people missing birthplace data.\n`);

    let phase2EnrichedCount = 0;
    let phase2LinkedCount = 0;
    let failedCount = 0;
    const errorLogs: string[] = [];

    if (missingPeople.length > 0) {
      for (let i = 0; i < missingPeople.length; i += BATCH_SIZE) {
        const batch = missingPeople.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (p) => {
            try {
              const d = await fetchTMDB(`/person/${p.tmdb_id}`);
              const birthplace = d.place_of_birth || '';

              await client.query(
                `UPDATE people SET
                   place_of_birth       = $1,
                   gender               = COALESCE(gender, $2::smallint),
                   imdb_id              = COALESCE(imdb_id, $3),
                   popularity           = CASE WHEN $4::decimal > 0 THEN $4::decimal ELSE popularity END,
                   birth_date           = COALESCE(birth_date, $5::date),
                   deathday             = COALESCE(deathday, $6::date),
                   known_for_department = COALESCE(known_for_department, $7)
                 WHERE tmdb_id = $8::integer`,
                [
                  birthplace,
                  d.gender ?? 0,
                  d.imdb_id ?? null,
                  d.popularity ?? 0,
                  d.birthday ? d.birthday : null,
                  d.deathday ? d.deathday : null,
                  d.known_for_department ?? null,
                  p.tmdb_id,
                ]
              );

              phase2EnrichedCount++;

              if (birthplace) {
                const isoCode = parseBirthplaceToCountry(birthplace);
                if (isoCode) {
                  const countryName = birthplace.split(',').pop()?.trim() ?? '';
                  await client.query(
                    `INSERT INTO countries (iso_3166_1, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [isoCode, countryName]
                  );
                  await client.query(
                    `INSERT INTO person_countries (person_tmdb_id, country_iso) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [p.tmdb_id, isoCode]
                  );
                  phase2LinkedCount++;
                }
              }
            } catch (err: any) {
              failedCount++;
              const errMsg = `[Person TMDB ID: ${p.tmdb_id}] "${p.name}": ${err.message}`;
              errorLogs.push(errMsg);
              console.error(`  ✗ ${errMsg}`);
            }
          })
        );

        const progress = Math.min(i + BATCH_SIZE, missingPeople.length);
        const percent = ((progress / missingPeople.length) * 100).toFixed(1);
        process.stdout.write(
          `  ⟳ Progress: ${progress}/${missingPeople.length} (${percent}%) | Enriched: ${phase2EnrichedCount} | Linked: ${phase2LinkedCount} | Errors: ${failedCount}\n`
        );

        if (i + BATCH_SIZE < missingPeople.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }
      process.stdout.write('\n');
    }

    const totalDurationSec = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n============================================================');
    console.log('🎉 [Fix Person Countries] Execution Summary');
    console.log('============================================================');
    console.log(`  • Execution Time:           ${totalDurationSec} seconds`);
    console.log(`  • Existing Birthplaces:      ${existingPeople.length} processed`);
    console.log(`  • Phase 1 Instant Links:     ${phase1LinkedCount} linked`);
    console.log(`  • Missing TMDB Birthplaces:  ${missingPeople.length} processed`);
    console.log(`  • Phase 2 TMDB Fetched:      ${phase2EnrichedCount} updated`);
    console.log(`  • Phase 2 Country Links:     ${phase2LinkedCount} linked`);
    console.log(`  • Total Country Links Added: ${phase1LinkedCount + phase2LinkedCount}`);
    console.log(`  • Failed Requests:           ${failedCount}`);

    if (errorLogs.length > 0) {
      console.log('\n[Errors Encountered]:');
      errorLogs.slice(0, 10).forEach((err, idx) => console.log(`  ${idx + 1}. ${err}`));
      if (errorLogs.length > 10) {
        console.log(`  ... and ${errorLogs.length - 10} more`);
      }
    }

    console.log('============================================================\n');
  } catch (err: any) {
    console.error('❌ Fatal Error running fix_person_countries script:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
