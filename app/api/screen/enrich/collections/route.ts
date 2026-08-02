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
    return new Response(JSON.stringify({ error: '🔒 Access Denied: Invalid sync secret phrase.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  enrichCollections().catch((err) => console.error('\n[Enrich Collections] Error:', err.message));
  return redirectTo('/collection/screen/stats');
}

async function enrichCollections() {
  const startTime = Date.now();

  const res = await query(`SELECT tmdb_id, name FROM collections WHERE overview IS NULL OR total_movies IS NULL`);
  const collections = res.rows;

  if (collections.length === 0) {
    process.stdout.write(`\n============================================================\n`);
    process.stdout.write(`[Enrich Collections] All collections currently in database are enriched.\n`);
    process.stdout.write(`============================================================\n\n`);
    return;
  }

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Enrich Collections] Starting enrichment for ${collections.length} collections...\n`);
  process.stdout.write(`============================================================\n`);

  let updatedCount = 0;
  let bridgeMoviesLinked = 0;
  let deletedCount = 0;
  const errorLogs: string[] = [];

  for (let idx = 0; idx < collections.length; idx++) {
    const col = collections[idx];
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
          [d.original_name ?? null, d.original_language ?? null, d.overview ?? null, sorted.length, col.tmdb_id],
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
            [col.tmdb_id, p.id, i, p.title ?? null, p.poster_path ?? null, p.release_date || null],
          );
          bridgeMoviesLinked++;
        }
      });

      updatedCount++;
      process.stdout.write(
        `✓ [${idx + 1}/${collections.length}] Collection TMDB ID: ${col.tmdb_id} ("${col.name}") — ${sorted.length} parts linked\n`,
      );

      await new Promise((r) => setTimeout(r, 150));
    } catch (err: any) {
      if (err.status === 404 || err.message?.includes('404')) {
        // TMDB 404: collection page deleted on TMDB
        try {
          await query(`DELETE FROM collections WHERE tmdb_id = $1`, [col.tmdb_id]);
          deletedCount++;
          process.stdout.write(
            `🗑 [${idx + 1}/${collections.length}] Deleted orphaned Collection TMDB ID: ${col.tmdb_id} ("${col.name}")\n`,
          );
        } catch (delErr: any) {
          errorLogs.push(`[Collection TMDB ID: ${col.tmdb_id}] Failed to delete orphaned collection: ${delErr.message}`);
        }
      } else {
        errorLogs.push(`[Collection TMDB ID: ${col.tmdb_id}] "${col.name}": ${err.message}`);
        process.stdout.write(
          `✗ [${idx + 1}/${collections.length}] Error on Collection TMDB ID: ${col.tmdb_id} ("${col.name}"): ${err.message}\n`,
        );
      }
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Enrich Collections] Complete Summary:\n`);
  process.stdout.write(`  • Total Execution Time: ${durationSec}s\n`);
  process.stdout.write(`  • Collections Checked:  ${collections.length}\n`);
  process.stdout.write(`  • Collections Updated:  ${updatedCount}\n`);
  process.stdout.write(`  • Movie Bridge Rows:    ${bridgeMoviesLinked} linked\n`);
  process.stdout.write(`  • Deleted (404/Drift):  ${deletedCount}\n`);
  process.stdout.write(`  • Errors Encountered:   ${errorLogs.length}\n`);

  if (errorLogs.length > 0) {
    process.stdout.write(`\n[Errors & Warnings Encountered]:\n`);
    errorLogs.forEach((err, idx) => {
      process.stdout.write(`  ${idx + 1}. ${err}\n`);
    });
  }

  process.stdout.write(`============================================================\n\n`);
}
