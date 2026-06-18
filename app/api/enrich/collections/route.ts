// app/api/enrich/collections/route.ts
//
// Enriches each collection with:
//   • original_name / original_language / overview (TMDB collection details)
//   • total_movies                                 (count of TMDB parts[])
//   • collection_movies bridge rows                (every part, watched or not)
//
// The bridge is the source of truth for "movies in this collection". We don't
// insert unwatched siblings into the `movies` table because every history
// query in the codebase treats `movies` as the watched-movie library.
//
// 404 handling: TMDB sometimes returns a `belongs_to_collection` id that is
// no longer a real collection (data drift, deleted franchise pages). We
// detect that and DELETE the collection — cascades clear `movies.collection_id`
// (SET NULL) and `collection_movies` (CASCADE) automatically.
import { query, transaction } from '@/lib/screen/db';
import { fetchTMDB } from '@/lib/screen/tmdb';
import { redirectTo } from '@/lib/screen/utils/redirect';

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

  enrichCollections().catch((err) => console.error('\n[Enrich Collections] Error:', err.message));
  return redirectTo('/collection/screen/stats');
}

async function enrichCollections() {
  const res = await query(
    `SELECT tmdb_id, name FROM collections WHERE overview IS NULL OR total_movies IS NULL`
  );
  const collections = res.rows;

  if (collections.length === 0) {
    console.log('[Enrich Collections] All collections enriched.');
    return;
  }

  process.stdout.write(`\n[Enrich Collections] Updating ${collections.length} collections...\n`);

  let updated = 0;
  let deleted = 0;
  let failed = 0;

  for (const col of collections) {
    try {
      const d = await fetchTMDB(`/collection/${col.tmdb_id}`);
      const parts = Array.isArray(d.parts) ? d.parts : [];

      // Sort by release_date so position is stable & meaningful.
      const sorted = [...parts].sort((a, b) => {
        const ad = a.release_date || '9999-99-99';
        const bd = b.release_date || '9999-99-99';
        return ad.localeCompare(bd);
      });

      await transaction(async (client) => {
        await client.query(
          `UPDATE collections SET
             original_name     = $1,
             original_language = $2,
             overview          = $3,
             total_movies      = $4
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
             DO UPDATE SET
               position     = EXCLUDED.position,
               title        = EXCLUDED.title,
               poster_path  = EXCLUDED.poster_path,
               release_date = EXCLUDED.release_date`,
            [col.tmdb_id, p.id, i, p.title ?? null, p.poster_path ?? null, p.release_date || null]
          );
        }
      });

      updated++;
      process.stdout.write(`  ✓  Updated: ${col.name} (${sorted.length} movies)\n`);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      // TMDB returned 404 — id is no longer a valid collection. Drop it.
      // Cascades: movies.collection_id → NULL, collection_movies → deleted.
      if (msg.includes('Not Found')) {
        await query(`DELETE FROM collections WHERE tmdb_id = $1`, [col.tmdb_id]);
        deleted++;
        process.stdout.write(`  ⌫  Removed: ${col.name} (TMDB 404, id=${col.tmdb_id})\n`);
      } else {
        failed++;
        process.stdout.write(`  ✗  Failed:  ${col.name} — ${msg}\n`);
      }
    }
  }

  process.stdout.write(
    `\n[Enrich Collections] Done — ${updated} updated · ${deleted} removed (404) · ${failed} failed · ${collections.length} total\n`
  );
}
