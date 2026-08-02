/**
 * scripts/screen/db/check_people_integrity.ts
 *
 * NEON DATABASE PEOPLE INTEGRITY & DUPLICATE AUDIT SCRIPT
 * --------------------------------------------------------
 * Audits the `people` table in Neon PostgreSQL for data integrity, missing links,
 * and duplicate records.
 *
 * Checks Performed:
 * 1. Missing Links / Orphans:
 *    - People with no link to movies (movie_cast or movie_crew)
 *    - People with no link to TV shows (show_cast or show_crew)
 *    - People with no media links (no movies AND no TV shows)
 *    - Country Link Breakdown:
 *      - No place of birth recorded (NULL or empty string in DB)
 *      - Has place of birth stored but no parsed country link in `person_countries`
 *      - Has valid country link
 *    - Isolated orphan records (no movies, no shows, AND no countries)
 *
 * 2. Duplicate Detection:
 *    - Duplicate records sharing the same normalized name (LOWER(TRIM(name)))
 *    - Duplicate records sharing the same IMDb ID
 *
 * 3. TMDB API Verification:
 *    - Fetches TMDB status for candidate duplicate/orphan people (strictly observing 30 req/sec limit)
 *    - Identifies if TMDB returned 404 (deleted person) or a merged ID
 *
 * 4. Categorization & Reporting:
 *    - Results partitioned separately by Cast (acting) vs Crew (non-acting)
 *    - Console logging output with clear visual formatting
 *    - Writes markdown report to `zone/people_integrity_report.md`
 *    - Contains a dedicated, separate report section for TMDB API results
 *
 * USAGE:
 *   pnpm tsx -r dotenv/config scripts/screen/db/check_people_integrity.ts
 *
 * FLAGS (Optional):
 *   --skip-tmdb    Skip TMDB API status verification calls
 *   --out=<path>   Custom output report path (default: zone/people_integrity_report.md)
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });

if (!process.env.NEON_DATABASE_URL) {
  console.error('❌ NEON_DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const skipTmdb = args.includes('--skip-tmdb');
const outArg = args.find((a) => a.startsWith('--out='));
const outputPath = outArg ? path.resolve(outArg.split('=')[1]) : path.resolve(process.cwd(), 'zone/people_integrity_report.md');

// Rate limiting: 25 requests per batch with 1000ms delay strictly respects TMDB 30 req/sec limit
const TMDB_BATCH_SIZE = 25;
const TMDB_BATCH_DELAY_MS = 1000;
const TMDB_TIMEOUT_MS = 10000;

interface PersonRecord {
  tmdb_id: number;
  name: string;
  known_for_department: string | null;
  imdb_id: string | null;
  profile_path: string | null;
  place_of_birth: string | null;
  popularity: number;
  movie_cast_count: number;
  movie_crew_count: number;
  show_cast_count: number;
  show_crew_count: number;
  country_count: number;
  // Computed fields
  movie_links_total: number;
  show_links_total: number;
  media_links_total: number;
  has_place_of_birth: boolean;
  is_cast: boolean;
  tmdb_status?: 'ACTIVE' | 'DELETED' | 'MERGED' | 'ERROR';
  tmdb_merged_id?: number;
  tmdb_details?: string;
}

interface DuplicateGroup {
  key: string;
  type: 'NAME' | 'IMDB_ID';
  people: PersonRecord[];
  is_cast: boolean;
}

interface TmdbVerifyResult {
  tmdb_id: number;
  name: string;
  status: 'ACTIVE' | 'DELETED' | 'MERGED' | 'ERROR';
  merged_id?: number;
  merged_name?: string;
  details: string;
}

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: process.env.NEON_DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: true },
});

async function checkTmdbPersonStatus(tmdbId: number, token: string): Promise<TmdbVerifyResult> {
  const url = `https://api.themoviedb.org/3/person/${tmdbId}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TMDB_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (res.status === 404) {
      return {
        tmdb_id: tmdbId,
        name: '',
        status: 'DELETED',
        details: 'Person record deleted from TMDB (HTTP 404)',
      };
    }

    if (!res.ok) {
      return {
        tmdb_id: tmdbId,
        name: '',
        status: 'ERROR',
        details: `TMDB API error HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = (await res.json()) as { id: number; name: string };
    if (data.id && data.id !== tmdbId) {
      return {
        tmdb_id: tmdbId,
        name: data.name || '',
        status: 'MERGED',
        merged_id: data.id,
        merged_name: data.name,
        details: `Person ID ${tmdbId} was merged into TMDB ID ${data.id} ("${data.name}")`,
      };
    }

    return {
      tmdb_id: tmdbId,
      name: data.name || '',
      status: 'ACTIVE',
      details: `Active in TMDB ("${data.name}")`,
    };
  } catch (err: any) {
    clearTimeout(timer);
    return {
      tmdb_id: tmdbId,
      name: '',
      status: 'ERROR',
      details: `Request failed: ${err.message || String(err)}`,
    };
  }
}

async function main() {
  const startTime = Date.now();
  const client = await pool.connect();

  console.log('\n============================================================');
  console.log('🔍 [Neon DB] People Integrity & Duplicate Audit Script');
  console.log('============================================================');
  console.log(`📌 Output Report Path: ${outputPath}`);
  console.log(`📌 TMDB Verification: ${skipTmdb ? 'DISABLED (--skip-tmdb)' : 'ENABLED (Limit: 30 req/sec)'}`);
  console.log('============================================================\n');

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // STEP 1: FETCH ALL PEOPLE AND AGGREGATE LINK COUNTS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('📊 STEP 1: Querying all people and link counts from Neon DB...');

    const peopleRes = await client.query(`
      SELECT 
        p.tmdb_id,
        p.name,
        p.known_for_department,
        p.imdb_id,
        p.profile_path,
        p.place_of_birth,
        COALESCE(p.popularity, 0)::float AS popularity,
        COALESCE(mc.cnt, 0)::int AS movie_cast_count,
        COALESCE(mcw.cnt, 0)::int AS movie_crew_count,
        COALESCE(sc.cnt, 0)::int AS show_cast_count,
        COALESCE(scw.cnt, 0)::int AS show_crew_count,
        COALESCE(pc.cnt, 0)::int AS country_count
      FROM people p
      LEFT JOIN (SELECT person_tmdb_id, COUNT(*) AS cnt FROM movie_cast GROUP BY person_tmdb_id) mc ON mc.person_tmdb_id = p.tmdb_id
      LEFT JOIN (SELECT person_tmdb_id, COUNT(*) AS cnt FROM movie_crew GROUP BY person_tmdb_id) mcw ON mcw.person_tmdb_id = p.tmdb_id
      LEFT JOIN (SELECT person_tmdb_id, COUNT(*) AS cnt FROM show_cast GROUP BY person_tmdb_id) sc ON sc.person_tmdb_id = p.tmdb_id
      LEFT JOIN (SELECT person_tmdb_id, COUNT(*) AS cnt FROM show_crew GROUP BY person_tmdb_id) scw ON scw.person_tmdb_id = p.tmdb_id
      LEFT JOIN (SELECT person_tmdb_id, COUNT(*) AS cnt FROM person_countries GROUP BY person_tmdb_id) pc ON pc.person_tmdb_id = p.tmdb_id
      ORDER BY p.tmdb_id
    `);

    const allPeople: PersonRecord[] = peopleRes.rows.map((row) => {
      const movie_links_total = row.movie_cast_count + row.movie_crew_count;
      const show_links_total = row.show_cast_count + row.show_crew_count;
      const media_links_total = movie_links_total + show_links_total;
      const has_place_of_birth = Boolean(row.place_of_birth && row.place_of_birth.trim().length > 0);
      const is_cast = row.known_for_department === 'Acting' || row.movie_cast_count > 0 || row.show_cast_count > 0;

      return {
        ...row,
        movie_links_total,
        show_links_total,
        media_links_total,
        has_place_of_birth,
        is_cast,
      };
    });

    const peopleMap = new Map<number, PersonRecord>(allPeople.map((p) => [p.tmdb_id, p]));

    console.log(`  ✓ Loaded ${allPeople.length} total people records from database.\n`);

    // Partition into Cast and Crew
    const castPeople = allPeople.filter((p) => p.is_cast);
    const crewPeople = allPeople.filter((p) => !p.is_cast);

    // Filter subsets for Cast
    const castNoMovie = castPeople.filter((p) => p.movie_links_total === 0);
    const castNoShow = castPeople.filter((p) => p.show_links_total === 0);
    const castNoCountry = castPeople.filter((p) => p.country_count === 0);
    const castNoBirthplace = castPeople.filter((p) => !p.has_place_of_birth);
    const castUnparsedBirthplace = castPeople.filter((p) => p.has_place_of_birth && p.country_count === 0);
    const castNoMedia = castPeople.filter((p) => p.media_links_total === 0);
    const castOrphans = castPeople.filter((p) => p.media_links_total === 0 && p.country_count === 0);

    // Filter subsets for Crew
    const crewNoMovie = crewPeople.filter((p) => p.movie_links_total === 0);
    const crewNoShow = crewPeople.filter((p) => p.show_links_total === 0);
    const crewNoCountry = crewPeople.filter((p) => p.country_count === 0);
    const crewNoBirthplace = crewPeople.filter((p) => !p.has_place_of_birth);
    const crewUnparsedBirthplace = crewPeople.filter((p) => p.has_place_of_birth && p.country_count === 0);
    const crewNoMedia = crewPeople.filter((p) => p.media_links_total === 0);
    const crewOrphans = crewPeople.filter((p) => p.media_links_total === 0 && p.country_count === 0);

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 2: DUPLICATE DETECTION CHECKS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('👯 STEP 2: Searching for duplicate people in database...');

    // 2a. Duplicates by Name
    const nameDupRes = await client.query(`
      SELECT LOWER(TRIM(name)) AS norm_name, COUNT(*) AS cnt
      FROM people
      GROUP BY LOWER(TRIM(name))
      HAVING COUNT(*) > 1
      ORDER BY cnt DESC, norm_name
    `);

    const nameDuplicateGroups: DuplicateGroup[] = [];
    for (const row of nameDupRes.rows) {
      const normName = row.norm_name;
      const matching = allPeople.filter((p) => p.name.trim().toLowerCase() === normName);
      if (matching.length > 1) {
        const isCastGroup = matching.some((p) => p.is_cast);
        nameDuplicateGroups.push({
          key: normName,
          type: 'NAME',
          people: matching,
          is_cast: isCastGroup,
        });
      }
    }

    // 2b. Duplicates by IMDb ID
    const imdbDupRes = await client.query(`
      SELECT imdb_id, COUNT(*) AS cnt
      FROM people
      WHERE imdb_id IS NOT NULL AND TRIM(imdb_id) != ''
      GROUP BY imdb_id
      HAVING COUNT(*) > 1
      ORDER BY cnt DESC, imdb_id
    `);

    const imdbDuplicateGroups: DuplicateGroup[] = [];
    for (const row of imdbDupRes.rows) {
      const imdbId = row.imdb_id;
      const matching = allPeople.filter((p) => p.imdb_id === imdbId);
      if (matching.length > 1) {
        const isCastGroup = matching.some((p) => p.is_cast);
        imdbDuplicateGroups.push({
          key: imdbId,
          type: 'IMDB_ID',
          people: matching,
          is_cast: isCastGroup,
        });
      }
    }

    const castNameDupGroups = nameDuplicateGroups.filter((g) => g.is_cast);
    const crewNameDupGroups = nameDuplicateGroups.filter((g) => !g.is_cast);
    const castImdbDupGroups = imdbDuplicateGroups.filter((g) => g.is_cast);
    const crewImdbDupGroups = imdbDuplicateGroups.filter((g) => !g.is_cast);

    console.log(`  ✓ Found ${nameDuplicateGroups.length} duplicate name clusters.`);
    console.log(`  ✓ Found ${imdbDuplicateGroups.length} duplicate IMDb ID clusters.\n`);

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 3: TMDB API VERIFICATION (FOR CANDIDATE DUPLICATES AND ORPHANS)
    // ──────────────────────────────────────────────────────────────────────────
    const tmdbResultsMap = new Map<number, TmdbVerifyResult>();
    const tmdbToken = process.env.TMDB_API_READ_ACCESS_TOKEN;

    if (!skipTmdb && tmdbToken) {
      // Collect IDs to verify
      const candidateIdSet = new Set<number>();

      // Isolated orphans
      [...castOrphans, ...crewOrphans].forEach((p) => candidateIdSet.add(p.tmdb_id));

      // Duplicates
      nameDuplicateGroups.forEach((g) => g.people.forEach((p) => candidateIdSet.add(p.tmdb_id)));
      imdbDuplicateGroups.forEach((g) => g.people.forEach((p) => candidateIdSet.add(p.tmdb_id)));

      const candidateIds = Array.from(candidateIdSet);
      console.log(`🌐 STEP 3: Verifying ${candidateIds.length} candidate records against TMDB API...`);
      console.log(`  ⚡ Rate limit enforced: 25 req/batch with 1000ms delay (strictly < 30 req/sec limit).\n`);

      for (let i = 0; i < candidateIds.length; i += TMDB_BATCH_SIZE) {
        const batch = candidateIds.slice(i, i + TMDB_BATCH_SIZE);

        await Promise.all(
          batch.map(async (id) => {
            const res = await checkTmdbPersonStatus(id, tmdbToken);
            const personObj = peopleMap.get(id);
            if (personObj) {
              if (!res.name && personObj.name) res.name = personObj.name;
              personObj.tmdb_status = res.status;
              personObj.tmdb_merged_id = res.merged_id;
              personObj.tmdb_details = res.details;
            }
            tmdbResultsMap.set(id, res);
          }),
        );

        const progress = Math.min(i + TMDB_BATCH_SIZE, candidateIds.length);
        const percent = ((progress / candidateIds.length) * 100).toFixed(1);
        process.stdout.write(`  ⟳ TMDB Verification Progress: ${progress}/${candidateIds.length} (${percent}%)\r`);

        if (i + TMDB_BATCH_SIZE < candidateIds.length) {
          await new Promise((resolve) => setTimeout(resolve, TMDB_BATCH_DELAY_MS));
        }
      }
      process.stdout.write('\n  ✓ TMDB API Verification Complete.\n\n');
    } else if (skipTmdb) {
      console.log('⏭️ STEP 3: Skipping TMDB API verification (--skip-tmdb flag passed).\n');
    } else {
      console.log('⚠️ STEP 3: TMDB_API_READ_ACCESS_TOKEN not set in .env.local, skipping TMDB API calls.\n');
    }

    // Categorize TMDB results for dedicated report section
    const tmdbDeleted = Array.from(tmdbResultsMap.values()).filter((r) => r.status === 'DELETED');
    const tmdbMerged = Array.from(tmdbResultsMap.values()).filter((r) => r.status === 'MERGED');
    const tmdbActive = Array.from(tmdbResultsMap.values()).filter((r) => r.status === 'ACTIVE');
    const tmdbError = Array.from(tmdbResultsMap.values()).filter((r) => r.status === 'ERROR');

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 4: CONSOLE SUMMARY OUTPUT
    // ──────────────────────────────────────────────────────────────────────────
    console.log('============================================================');
    console.log('📋 CONSOLE AUDIT SUMMARY');
    console.log('============================================================');
    console.log(`• Total Database People:        ${allPeople.length}`);
    console.log(`  ├─ 🎭 Cast (Acting):          ${castPeople.length}`);
    console.log(`  └─ 🎬 Crew (Non-Acting):      ${crewPeople.length}`);
    console.log('------------------------------------------------------------');
    console.log(`• 🎭 CAST (ACTING) METRICS:`);
    console.log(`  ├─ Missing Movie Links:       ${castNoMovie.length} (Only TV shows or unlinked)`);
    console.log(`  ├─ Missing Show Links:        ${castNoShow.length} (Only movies or unlinked)`);
    console.log(`  ├─ Missing Media Links:       ${castNoMedia.length} (No movies AND no shows)`);
    console.log(`  ├─ Country Breakdown:`);
    console.log(`  │  ├─ No Birthplace Stored:   ${castNoBirthplace.length} (No place_of_birth data)`);
    console.log(`  │  ├─ Unparsed Birthplace:    ${castUnparsedBirthplace.length} (Has place_of_birth string, 0 country link)`);
    console.log(`  │  └─ Linked Countries:       ${castPeople.length - castNoCountry.length}`);
    console.log(`  ├─ Completely Isolated:       ${castOrphans.length} (No movies, shows, or countries)`);
    console.log(`  ├─ Duplicate Name Groups:     ${castNameDupGroups.length}`);
    console.log(`  └─ Duplicate IMDb Groups:     ${castImdbDupGroups.length}`);
    console.log('------------------------------------------------------------');
    console.log(`• 🎬 CREW (NON-ACTING) METRICS:`);
    console.log(`  ├─ Missing Movie Links:       ${crewNoMovie.length} (Only TV shows or unlinked)`);
    console.log(`  ├─ Missing Show Links:        ${crewNoShow.length} (Only movies or unlinked)`);
    console.log(`  ├─ Missing Media Links:       ${crewNoMedia.length} (No movies AND no shows)`);
    console.log(`  ├─ Country Breakdown:`);
    console.log(`  │  ├─ No Birthplace Stored:   ${crewNoBirthplace.length} (No place_of_birth data)`);
    console.log(`  │  ├─ Unparsed Birthplace:    ${crewUnparsedBirthplace.length} (Has place_of_birth string, 0 country link)`);
    console.log(`  │  └─ Linked Countries:       ${crewPeople.length - crewNoCountry.length}`);
    console.log(`  ├─ Completely Isolated:       ${crewOrphans.length} (No movies, shows, or countries)`);
    console.log(`  ├─ Duplicate Name Groups:     ${crewNameDupGroups.length}`);
    console.log(`  └─ Duplicate IMDb Groups:     ${crewImdbDupGroups.length}`);

    if (tmdbResultsMap.size > 0) {
      console.log('------------------------------------------------------------');
      console.log(`• 🌐 TMDB API VERIFICATION SUMMARY (${tmdbResultsMap.size} checked):`);
      console.log(`  ├─ ❌ Deleted on TMDB (404):  ${tmdbDeleted.length}`);
      console.log(`  ├─ 🔀 Merged on TMDB (ID):    ${tmdbMerged.length}`);
      console.log(`  ├─ ✅ Active on TMDB:         ${tmdbActive.length}`);
      console.log(`  └─ ⚠️ Request Errors:          ${tmdbError.length}`);
    }

    console.log('============================================================\n');

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 5: GENERATE MARKDOWN REPORT IN /zone
    // ──────────────────────────────────────────────────────────────────────────
    console.log(`📝 Writing detailed markdown report to: ${outputPath}...`);

    const reportLines: string[] = [];
    const timestampStr = new Date().toISOString();

    reportLines.push(`# Neon Database People Integrity & Duplicate Audit Report`);
    reportLines.push(``);
    reportLines.push(`> **Generated At**: \`${timestampStr}\``);
    reportLines.push(`> **Database**: Neon PostgreSQL (\`people\` table)`);
    reportLines.push(`> **TMDB Rate Limit**: Max 30 req/sec strictly enforced`);
    reportLines.push(``);

    // Section 1: Executive Summary
    reportLines.push(`## 📊 Executive Summary`);
    reportLines.push(``);
    reportLines.push(`| Metric Category | Cast (Acting) | Crew (Non-Acting) | Combined Total |`);
    reportLines.push(`| :--- | :---: | :---: | :---: |`);
    reportLines.push(`| **Total People Records** | ${castPeople.length} | ${crewPeople.length} | **${allPeople.length}** |`);
    reportLines.push(
      `| **Missing Movie Links** | ${castNoMovie.length} | ${crewNoMovie.length} | ${castNoMovie.length + crewNoMovie.length} |`,
    );
    reportLines.push(`| **Missing Show Links** | ${castNoShow.length} | ${crewNoShow.length} | ${castNoShow.length + crewNoShow.length} |`);
    reportLines.push(
      `| **Missing Media Links (No Movies AND No Shows)** | **${castNoMedia.length}** | **${crewNoMedia.length}** | **${castNoMedia.length + crewNoMedia.length}** |`,
    );
    reportLines.push(
      `| **No Birthplace Data Stored** | ${castNoBirthplace.length} | ${crewNoBirthplace.length} | ${castNoBirthplace.length + crewNoBirthplace.length} |`,
    );
    reportLines.push(
      `| **Unparsed Birthplace (Has Text, 0 Country Link)** | ${castUnparsedBirthplace.length} | ${crewUnparsedBirthplace.length} | ${castUnparsedBirthplace.length + crewUnparsedBirthplace.length} |`,
    );
    reportLines.push(
      `| **Completely Isolated Orphans (No Movies, Shows, or Countries)** | **${castOrphans.length}** | **${crewOrphans.length}** | **${castOrphans.length + crewOrphans.length}** |`,
    );
    reportLines.push(
      `| **Duplicate Name Clusters** | ${castNameDupGroups.length} | ${crewNameDupGroups.length} | ${nameDuplicateGroups.length} |`,
    );
    reportLines.push(
      `| **Duplicate IMDb ID Clusters** | ${castImdbDupGroups.length} | ${crewImdbDupGroups.length} | ${imdbDuplicateGroups.length} |`,
    );
    reportLines.push(``);

    // Section 2: Dedicated TMDB API Verification Results
    reportLines.push(`## 🌐 TMDB API Verification Results`);
    reportLines.push(``);
    if (tmdbResultsMap.size === 0) {
      reportLines.push(`> ⚠️ TMDB API verification was skipped or no candidates were checked.`);
    } else {
      reportLines.push(`- **Total Checked**: \`${tmdbResultsMap.size}\` records`);
      reportLines.push(`- **Active Records (200)**: \`${tmdbActive.length}\``);
      reportLines.push(`- **Deleted Records (404)**: \`${tmdbDeleted.length}\``);
      reportLines.push(`- **Merged Records (Redirected ID)**: \`${tmdbMerged.length}\``);
      reportLines.push(`- **Request Errors**: \`${tmdbError.length}\``);
      reportLines.push(``);

      if (tmdbDeleted.length > 0) {
        reportLines.push(`### ❌ Deleted Records on TMDB (HTTP 404)`);
        reportLines.push(`These people exist in your Neon DB but have been removed from TMDB:`);
        reportLines.push(``);
        reportLines.push(`| DB TMDB ID | Person Name | Category | Movie Links | Show Links | Country Links |`);
        reportLines.push(`| :--- | :--- | :--- | :---: | :---: | :---: |`);
        for (const item of tmdbDeleted) {
          const p = peopleMap.get(item.tmdb_id);
          const cat = p?.is_cast ? 'Cast' : 'Crew';
          const name = p?.name || item.name || 'Unknown';
          const m = p?.movie_links_total ?? 0;
          const s = p?.show_links_total ?? 0;
          const c = p?.country_count ?? 0;
          reportLines.push(`| \`${item.tmdb_id}\` | ${name} | ${cat} | ${m} | ${s} | ${c} |`);
        }
        reportLines.push(``);
      }

      if (tmdbMerged.length > 0) {
        reportLines.push(`### 🔀 Merged Records on TMDB`);
        reportLines.push(`TMDB has merged these duplicate person IDs into new TMDB IDs:`);
        reportLines.push(``);
        reportLines.push(`| Old TMDB ID | Person Name | New TMDB ID | New Target Name | Details |`);
        reportLines.push(`| :--- | :--- | :--- | :--- | :--- |`);
        for (const item of tmdbMerged) {
          const p = peopleMap.get(item.tmdb_id);
          const oldName = p?.name || item.name || 'Unknown';
          reportLines.push(`| \`${item.tmdb_id}\` | ${oldName} | \`${item.merged_id}\` | ${item.merged_name || '-'} | ${item.details} |`);
        }
        reportLines.push(``);
      }
    }

    // Section 3: Cast (Acting) Analysis
    reportLines.push(`## 🎭 Cast (Acting) Analysis`);
    reportLines.push(``);
    reportLines.push(`Total Cast Records: **${castPeople.length}**`);
    reportLines.push(``);
    reportLines.push(`### Summary Breakdown:`);
    reportLines.push(`- **People with NO Movie Links**: \`${castNoMovie.length}\` (Appeared in TV shows or unlinked)`);
    reportLines.push(`- **People with NO Show Links**: \`${castNoShow.length}\` (Appeared in movies or unlinked)`);
    reportLines.push(`- **People with NO Media Links (No Movies AND No Shows)**: \`${castNoMedia.length}\``);
    reportLines.push(`- **Country Link Breakdown**:`);
    reportLines.push(`  - No birthplace data recorded: \`${castNoBirthplace.length}\``);
    reportLines.push(`  - Birthplace string present but unlinked: \`${castUnparsedBirthplace.length}\``);
    reportLines.push(`  - Valid country links: \`${castPeople.length - castNoCountry.length}\``);
    reportLines.push(`- **Completely Isolated Orphans (No Movies, Shows, or Countries)**: \`${castOrphans.length}\``);
    reportLines.push(``);

    if (castNameDupGroups.length > 0) {
      reportLines.push(`### 👯 Cast Duplicate Name Clusters (${castNameDupGroups.length} groups)`);
      reportLines.push(``);
      for (const group of castNameDupGroups) {
        reportLines.push(`#### Name: "${group.people[0].name}" (\`${group.people.length}\` duplicates)`);
        reportLines.push(`| TMDB ID | IMDb ID | Dept | Movies | Shows | Countries | TMDB Status |`);
        reportLines.push(`| :--- | :--- | :--- | :---: | :---: | :---: | :--- |`);
        for (const p of group.people) {
          const statusStr = p.tmdb_status ? (p.tmdb_status === 'MERGED' ? `MERGED → ${p.tmdb_merged_id}` : p.tmdb_status) : '-';
          reportLines.push(
            `| \`${p.tmdb_id}\` | ${p.imdb_id || '-'} | ${p.known_for_department || '-'} | ${p.movie_links_total} | ${p.show_links_total} | ${p.country_count} | ${statusStr} |`,
          );
        }
        reportLines.push(``);
      }
    } else {
      reportLines.push(`### 👯 Cast Duplicate Name Clusters`);
      reportLines.push(`> ✅ No duplicate name clusters found for Cast.\n`);
    }

    if (castImdbDupGroups.length > 0) {
      reportLines.push(`### 🆔 Cast Duplicate IMDb ID Clusters (${castImdbDupGroups.length} groups)`);
      reportLines.push(``);
      for (const group of castImdbDupGroups) {
        reportLines.push(`#### IMDb ID: \`${group.key}\` ("${group.people[0].name}")`);
        reportLines.push(`| TMDB ID | Name | Dept | Movies | Shows | Countries | TMDB Status |`);
        reportLines.push(`| :--- | :--- | :--- | :---: | :---: | :---: | :--- |`);
        for (const p of group.people) {
          const statusStr = p.tmdb_status ? (p.tmdb_status === 'MERGED' ? `MERGED → ${p.tmdb_merged_id}` : p.tmdb_status) : '-';
          reportLines.push(
            `| \`${p.tmdb_id}\` | ${p.name} | ${p.known_for_department || '-'} | ${p.movie_links_total} | ${p.show_links_total} | ${p.country_count} | ${statusStr} |`,
          );
        }
        reportLines.push(``);
      }
    }

    if (castOrphans.length > 0) {
      reportLines.push(`### 🏝️ Completely Isolated Cast Orphans (${castOrphans.length} records)`);
      reportLines.push(`These cast members have no movie links, show links, or country links in the database:`);
      reportLines.push(``);
      reportLines.push(`| TMDB ID | Name | IMDb ID | Dept | Popularity | TMDB Status |`);
      reportLines.push(`| :--- | :--- | :--- | :--- | :---: | :--- |`);
      for (const p of castOrphans.slice(0, 100)) {
        const statusStr = p.tmdb_status ? (p.tmdb_status === 'MERGED' ? `MERGED → ${p.tmdb_merged_id}` : p.tmdb_status) : '-';
        reportLines.push(
          `| \`${p.tmdb_id}\` | ${p.name} | ${p.imdb_id || '-'} | ${p.known_for_department || '-'} | ${p.popularity.toFixed(1)} | ${statusStr} |`,
        );
      }
      if (castOrphans.length > 100) {
        reportLines.push(``);
        reportLines.push(`*... showing first 100 of ${castOrphans.length} isolated cast orphans.*`);
      }
      reportLines.push(``);
    }

    // Section 4: Crew (Non-Acting) Analysis
    reportLines.push(`## 🎬 Crew (Non-Acting) Analysis`);
    reportLines.push(``);
    reportLines.push(`Total Crew Records: **${crewPeople.length}**`);
    reportLines.push(``);
    reportLines.push(`### Summary Breakdown:`);
    reportLines.push(`- **People with NO Movie Links**: \`${crewNoMovie.length}\` (Appeared in TV shows or unlinked)`);
    reportLines.push(`- **People with NO Show Links**: \`${crewNoShow.length}\` (Appeared in movies or unlinked)`);
    reportLines.push(`- **People with NO Media Links (No Movies AND No Shows)**: \`${crewNoMedia.length}\``);
    reportLines.push(`- **Country Link Breakdown**:`);
    reportLines.push(`  - No birthplace data recorded: \`${crewNoBirthplace.length}\``);
    reportLines.push(`  - Birthplace string present but unlinked: \`${crewUnparsedBirthplace.length}\``);
    reportLines.push(`  - Valid country links: \`${crewPeople.length - crewNoCountry.length}\``);
    reportLines.push(`- **Completely Isolated Orphans (No Movies, Shows, or Countries)**: \`${crewOrphans.length}\``);
    reportLines.push(``);

    if (crewNameDupGroups.length > 0) {
      reportLines.push(`### 👯 Crew Duplicate Name Clusters (${crewNameDupGroups.length} groups)`);
      reportLines.push(``);
      for (const group of crewNameDupGroups) {
        reportLines.push(`#### Name: "${group.people[0].name}" (\`${group.people.length}\` duplicates)`);
        reportLines.push(`| TMDB ID | IMDb ID | Dept | Movies | Shows | Countries | TMDB Status |`);
        reportLines.push(`| :--- | :--- | :--- | :---: | :---: | :---: | :--- |`);
        for (const p of group.people) {
          const statusStr = p.tmdb_status ? (p.tmdb_status === 'MERGED' ? `MERGED → ${p.tmdb_merged_id}` : p.tmdb_status) : '-';
          reportLines.push(
            `| \`${p.tmdb_id}\` | ${p.imdb_id || '-'} | ${p.known_for_department || '-'} | ${p.movie_links_total} | ${p.show_links_total} | ${p.country_count} | ${statusStr} |`,
          );
        }
        reportLines.push(``);
      }
    } else {
      reportLines.push(`### 👯 Crew Duplicate Name Clusters`);
      reportLines.push(`> ✅ No duplicate name clusters found for Crew.\n`);
    }

    if (crewImdbDupGroups.length > 0) {
      reportLines.push(`### 🆔 Crew Duplicate IMDb ID Clusters (${crewImdbDupGroups.length} groups)`);
      reportLines.push(``);
      for (const group of crewImdbDupGroups) {
        reportLines.push(`#### IMDb ID: \`${group.key}\` ("${group.people[0].name}")`);
        reportLines.push(`| TMDB ID | Name | Dept | Movies | Shows | Countries | TMDB Status |`);
        reportLines.push(`| :--- | :--- | :--- | :---: | :---: | :---: | :--- |`);
        for (const p of group.people) {
          const statusStr = p.tmdb_status ? (p.tmdb_status === 'MERGED' ? `MERGED → ${p.tmdb_merged_id}` : p.tmdb_status) : '-';
          reportLines.push(
            `| \`${p.tmdb_id}\` | ${p.name} | ${p.known_for_department || '-'} | ${p.movie_links_total} | ${p.show_links_total} | ${p.country_count} | ${statusStr} |`,
          );
        }
        reportLines.push(``);
      }
    }

    if (crewOrphans.length > 0) {
      reportLines.push(`### 🏝️ Completely Isolated Crew Orphans (${crewOrphans.length} records)`);
      reportLines.push(`These crew members have no movie links, show links, or country links in the database:`);
      reportLines.push(``);
      reportLines.push(`| TMDB ID | Name | IMDb ID | Dept | Popularity | TMDB Status |`);
      reportLines.push(`| :--- | :--- | :--- | :--- | :---: | :--- |`);
      for (const p of crewOrphans.slice(0, 100)) {
        const statusStr = p.tmdb_status ? (p.tmdb_status === 'MERGED' ? `MERGED → ${p.tmdb_merged_id}` : p.tmdb_status) : '-';
        reportLines.push(
          `| \`${p.tmdb_id}\` | ${p.name} | ${p.imdb_id || '-'} | ${p.known_for_department || '-'} | ${p.popularity.toFixed(1)} | ${statusStr} |`,
        );
      }
      if (crewOrphans.length > 100) {
        reportLines.push(``);
        reportLines.push(`*... showing first 100 of ${crewOrphans.length} isolated crew orphans.*`);
      }
      reportLines.push(``);
    }

    // Section 5: Recommended Action & Cleanup Instructions
    reportLines.push(`## 🛠️ Recommended Cleanup & Repair Tools`);
    reportLines.push(``);
    reportLines.push(`1. **To reconnect orphaned people with existing movies/shows in your DB**:`);
    reportLines.push(`   Run the dedicated repair script: \`pnpm tsx -r dotenv/config scripts/screen/db/fix_orphaned_people_links.ts\``);
    reportLines.push(``);
    reportLines.push(`2. **To purge remaining unlinked isolated orphans**:`);
    reportLines.push(`\`\`\`sql`);
    reportLines.push(`DELETE FROM people`);
    reportLines.push(`WHERE tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM movie_cast)`);
    reportLines.push(`  AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM movie_crew)`);
    reportLines.push(`  AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM show_cast)`);
    reportLines.push(`  AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM show_crew)`);
    reportLines.push(`  AND tmdb_id NOT IN (SELECT DISTINCT person_tmdb_id FROM person_countries);`);
    reportLines.push(`\`\`\``);
    reportLines.push(``);

    // Write file
    const targetDir = path.dirname(outputPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, reportLines.join('\n'), 'utf8');

    const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Audit Completed in ${durationSec} seconds.`);
    console.log(`📄 Report successfully written to: ${outputPath}\n`);
  } catch (err: any) {
    console.error('❌ Fatal Error running check_people_integrity script:', err.message || err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
