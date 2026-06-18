// app/api/enrich/episodes/route.ts
import { query } from '@/lib/screen/db';
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

  const limit = parseInt(searchParams.get('limit') ?? '10000', 10);

  enrichEpisodes(limit).catch((err) => console.error('\n[Enrich Episodes] Error:', err.message));

  return redirectTo('/collection/screen/stats');
}

async function enrichEpisodes(limit: number) {
  const res = await query(
    `SELECT e.tmdb_id, e.show_tmdb_id, e.season_number, e.episode_number, s.name as show_name
     FROM episodes e
     JOIN shows s ON e.show_tmdb_id = s.tmdb_id
     WHERE e.runtime IS NULL OR e.air_date IS NULL
     LIMIT $1`,
    [limit]
  );
  const episodes = res.rows;

  if (episodes.length === 0) {
    console.log('[Enrich Episodes] No episodes need enrichment.');
    return;
  }

  let count = 0;
  const BATCH_SIZE = 20;

  for (let i = 0; i < episodes.length; i += BATCH_SIZE) {
    const batch = episodes.slice(i, i + BATCH_SIZE);

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
          count++;
        } catch (err) {
          // skip
        }
      })
    );

    // Log only after each batch to reduce terminal noise
    const percent = ((count / episodes.length) * 100).toFixed(1);
    process.stdout.write(`  ⟳  Episodes: ${count}/${episodes.length} (${percent}%)\r`);

    // Wait a bit after the batch to respect TMDB rate limits
    await new Promise((r) => setTimeout(r, 400));
  }

  process.stdout.write(`\n  ✓  Episode enrichment complete. Updated: ${count}\n`);
}
