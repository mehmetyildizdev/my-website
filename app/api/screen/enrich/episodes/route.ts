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
  const startTime = Date.now();

  // Query episodes missing runtime (once runtime is populated, episode is considered enriched)
  const res = await query(
    `SELECT e.tmdb_id, e.show_tmdb_id, e.season_number, e.episode_number, s.name as show_name, s.original_language
     FROM episodes e
     JOIN shows s ON e.show_tmdb_id = s.tmdb_id
     WHERE e.runtime IS NULL
     ORDER BY e.show_tmdb_id, e.season_number, e.episode_number
     LIMIT $1`,
    [limit]
  );
  const episodes = res.rows;

  if (episodes.length === 0) {
    process.stdout.write(`\n============================================================\n`);
    process.stdout.write(`[Enrich Episodes] All episodes currently in database are enriched.\n`);
    process.stdout.write(`============================================================\n\n`);
    return;
  }

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Enrich Episodes] Starting enrichment for ${episodes.length} episodes...\n`);
  process.stdout.write(`============================================================\n`);

  let updatedCount = 0;
  let fallbackCount = 0;
  const errorLogs: string[] = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < episodes.length; i += BATCH_SIZE) {
    const batch = episodes.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (ep) => {
        const isTurkish = ep.original_language?.toLowerCase() === 'tr';
        const defaultRuntime = isTurkish ? 100 : 40;

        try {
          const d = await fetchTMDB(
            `/tv/${ep.show_tmdb_id}/season/${ep.season_number}/episode/${ep.episode_number}`
          );

          const runtime = d.runtime && d.runtime > 0 ? d.runtime : defaultRuntime;
          if (!d.runtime || d.runtime <= 0) fallbackCount++;

          const upRes = await query(
            `UPDATE episodes SET 
               runtime  = $1, 
               air_date = COALESCE($2, air_date), 
               title    = COALESCE($4, title) 
             WHERE tmdb_id = $3 AND (runtime IS DISTINCT FROM $1 OR air_date IS DISTINCT FROM $2)`,
            [runtime, d.air_date ?? null, ep.tmdb_id, d.name ?? null]
          );

          if ((upRes.rowCount ?? 0) > 0) {
            updatedCount++;
          }
        } catch (err: any) {
          fallbackCount++;
          errorLogs.push(`[Episode TMDB ID: ${ep.tmdb_id}] Show ID: ${ep.show_tmdb_id} (${ep.show_name} S${ep.season_number}E${ep.episode_number}): ${err.message}`);
          
          // Guarantee runtime is set so this episode is not repeatedly queried
          await query(`UPDATE episodes SET runtime = COALESCE(runtime, $1) WHERE tmdb_id = $2`, [
            defaultRuntime,
            ep.tmdb_id,
          ]);
        }
      })
    );

    const progress = Math.min(i + BATCH_SIZE, episodes.length);
    const percent = ((progress / episodes.length) * 100).toFixed(1);
    process.stdout.write(`  ⟳  Episodes: ${progress}/${episodes.length} (${percent}%) | Updated: ${updatedCount}\n`);

    await new Promise((r) => setTimeout(r, 350));
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Enrich Episodes] Complete Summary:\n`);
  process.stdout.write(`  • Total Execution Time: ${durationSec}s\n`);
  process.stdout.write(`  • Episodes Processed:   ${episodes.length}\n`);
  process.stdout.write(`  • Episodes Updated:     ${updatedCount}\n`);
  process.stdout.write(`  • Fallback Runtimes:    ${fallbackCount} applied\n`);
  process.stdout.write(`  • Errors / Fallbacks:   ${errorLogs.length}\n`);

  if (errorLogs.length > 0) {
    process.stdout.write(`\n[Errors & Warnings Encountered]:\n`);
    errorLogs.slice(0, 10).forEach((err, idx) => {
      process.stdout.write(`  ${idx + 1}. ${err}\n`);
    });
    if (errorLogs.length > 10) {
      process.stdout.write(`  ... and ${errorLogs.length - 10} more\n`);
    }
  }

  process.stdout.write(`============================================================\n\n`);
}
