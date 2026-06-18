// app/api/sync/latest/route.ts
// "Get Latest" — Quick Sync then auto-enriches all new data:
//   1. Quick Sync (Trakt history, stops at first known record)
//   2. Enrich new people (gender IS NULL)
//   3. Enrich new episodes (runtime/air_date IS NULL)
//   4. Enrich new collections (overview IS NULL)
// All runs in background — browser redirects immediately.

import { syncRecentTraktHistory } from '@/lib/screen/sync';
import { query, transaction } from '@/lib/screen/db';
import { fetchTMDB } from '@/lib/screen/tmdb';
import { log } from '@/lib/screen/logger';
import { redirectTo } from '@/lib/screen/utils/redirect';
import { parseBirthplaceToCountry } from '@/lib/screen/utils/birthplace';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const envSecret = process.env.MY_API_PHRASE || '';

  if (!envSecret || !secret || secret !== envSecret) {
    return new Response(
      JSON.stringify({ error: '🔒 Access Denied: Invalid sync secret phrase.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  runLatestPipeline().catch((err) => log.error(`[Get Latest] Fatal: ${err.message}`));
  return redirectTo('/collection/screen/stats');
}

async function runLatestPipeline() {
  log.section('Get Latest Pipeline');

  // ── 1. Quick Sync ─────────────────────────────────────────────────────────
  const result = await syncRecentTraktHistory(100, false, Infinity);
  const { stats } = result;

  const hasNew =
    stats.new_movies_added > 0 ||
    stats.new_shows_added > 0 ||
    stats.new_episodes_added > 0 ||
    stats.new_people_added > 0;

  if (!hasNew) {
    log.info('Nothing new to enrich. Pipeline complete.');
    return;
  }

  log.info(
    `New: ${stats.new_movies_added} movies · ${stats.new_shows_added} shows · ${stats.new_episodes_added} episodes · ${stats.new_people_added} people`
  );

  // ── 2. Enrich new people ──────────────────────────────────────────────────
  await enrichNewPeople();

  // ── 3. Enrich new episodes ────────────────────────────────────────────────
  await enrichNewEpisodes();

  // ── 4. Enrich new collections ─────────────────────────────────────────────
  await enrichNewCollections();

  log.section('Get Latest Pipeline — Complete');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function enrichNewPeople() {
  const res = await query(`SELECT tmdb_id, name FROM people WHERE gender IS NULL ORDER BY tmdb_id`);
  const people = res.rows;
  if (people.length === 0) {
    log.done('No new people to enrich');
    return;
  }

  log.startTimer(`Enriching ${people.length} people [0/${people.length}]`);
  const BATCH = 30;
  let done = 0;

  for (let i = 0; i < people.length; i += BATCH) {
    const batch = people.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (p) => {
        try {
          const d = await fetchTMDB(`/person/${p.tmdb_id}?append_to_response=external_ids`);
          await query(
            `UPDATE people SET imdb_id = COALESCE($1, imdb_id), popularity = $2,
           birth_date = $3, deathday = $4, gender = $5, known_for_department = $6,
           place_of_birth = $7
           WHERE tmdb_id = $8`,
            [
              d.external_ids?.imdb_id ?? null,
              d.popularity ?? 0,
              d.birthday ?? null,
              d.deathday ?? null,
              d.gender ?? 0,
              d.known_for_department ?? null,
              d.place_of_birth ?? '',
              p.tmdb_id,
            ]
          );

          if (d.place_of_birth) {
            const isoCode = parseBirthplaceToCountry(d.place_of_birth);
            if (isoCode) {
              const countryName = d.place_of_birth.split(',').pop()?.trim() ?? '';
              await query(
                `INSERT INTO countries (iso_3166_1, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [isoCode, countryName]
              );
              await query(
                `INSERT INTO person_countries (person_tmdb_id, country_iso) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [p.tmdb_id, isoCode]
              );
            }
          }

          done++;
        } catch {
          /* skip restricted/deleted */
        }
      })
    );
    const progress = Math.min(i + BATCH, people.length);
    log.progress(`People [${progress}/${people.length}] — last: "${batch[batch.length - 1].name}"`);
    await new Promise((r) => setTimeout(r, 200));
  }

  log.stopTimer(`People enrichment: ${done}/${people.length} enriched`);
}

async function enrichNewEpisodes() {
  const res = await query(
    `SELECT e.tmdb_id, e.show_tmdb_id, e.season_number, e.episode_number, s.name as show_name
     FROM episodes e JOIN shows s ON e.show_tmdb_id = s.tmdb_id
     WHERE e.runtime IS NULL OR e.air_date IS NULL LIMIT 500`
  );
  const episodes = res.rows;
  if (episodes.length === 0) {
    log.done('No new episodes to enrich');
    return;
  }

  log.startTimer(`Enriching ${episodes.length} episodes [0/${episodes.length}]`);
  const BATCH = 20;
  let done = 0;

  for (let i = 0; i < episodes.length; i += BATCH) {
    const batch = episodes.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (ep) => {
        try {
          const d = await fetchTMDB(
            `/tv/${ep.show_tmdb_id}/season/${ep.season_number}/episode/${ep.episode_number}`
          );
          await query(`UPDATE episodes SET runtime = $1, air_date = $2 WHERE tmdb_id = $3`, [
            d.runtime ?? null,
            d.air_date ?? null,
            ep.tmdb_id,
          ]);
          done++;
        } catch {
          /* skip */
        }
      })
    );
    const progress = Math.min(i + BATCH, episodes.length);
    log.progress(`Episodes [${progress}/${episodes.length}]`);
    await new Promise((r) => setTimeout(r, 400));
  }

  log.stopTimer(`Episode enrichment: ${done}/${episodes.length} updated`);
}

async function enrichNewCollections() {
  const res = await query(
    `SELECT tmdb_id, name FROM collections WHERE overview IS NULL OR total_movies IS NULL`
  );
  const collections = res.rows;
  if (collections.length === 0) {
    log.done('No new collections to enrich');
    return;
  }

  log.startTimer(`Enriching ${collections.length} collections [0/${collections.length}]`);
  let updated = 0;
  let deleted = 0;
  let failed = 0;

  for (const col of collections) {
    try {
      const d = await fetchTMDB(`/collection/${col.tmdb_id}`);
      const parts = Array.isArray(d.parts) ? d.parts : [];
      const sorted = [...parts].sort((a: any, b: any) => {
        const ad = a.release_date || '9999-99-99';
        const bd = b.release_date || '9999-99-99';
        return ad.localeCompare(bd);
      });

      await transaction(async (client) => {
        await client.query(
          `UPDATE collections SET
             original_name = $1, original_language = $2, overview = $3, total_movies = $4
           WHERE tmdb_id = $5`,
          [
            d.original_name ?? null,
            d.original_language ?? null,
            d.overview ?? null,
            sorted.length,
            col.tmdb_id,
          ]
        );
        for (let i = 0; i < sorted.length; i++) {
          const p = sorted[i];
          if (!p?.id) continue;
          await client.query(
            `INSERT INTO collection_movies
               (collection_tmdb_id, movie_tmdb_id, position, title, poster_path, release_date)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (collection_tmdb_id, movie_tmdb_id)
             DO UPDATE SET position = EXCLUDED.position, title = EXCLUDED.title,
               poster_path = EXCLUDED.poster_path, release_date = EXCLUDED.release_date`,
            [col.tmdb_id, p.id, i, p.title ?? null, p.poster_path ?? null, p.release_date || null]
          );
        }
      });
      updated++;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      if (msg.includes('Not Found')) {
        await query(`DELETE FROM collections WHERE tmdb_id = $1`, [col.tmdb_id]);
        deleted++;
      } else {
        failed++;
      }
    }
    log.progress(
      `Collections [${updated + deleted + failed}/${collections.length}] — "${col.name}"`
    );
  }

  log.stopTimer(
    `Collection enrichment: ${updated} updated · ${deleted} removed (404) · ${failed} failed · ${collections.length} total`
  );
}
