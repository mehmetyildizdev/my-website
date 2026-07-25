// app/api/screen/enrich/seasons/route.ts
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

  enrichSeasons(limit).catch((err) => console.error('\n[Enrich Seasons] Error:', err.message));

  return redirectTo('/collection/screen/stats');
}

async function enrichSeasons(limit: number) {
  const res = await query(
    `SELECT s.tmdb_id, s.show_tmdb_id, s.season_number, sh.original_language, s.name as season_name
     FROM seasons s
     JOIN shows sh ON s.show_tmdb_id = sh.tmdb_id
     WHERE s.overview IS NULL OR s.air_date IS NULL OR s.episode_count IS NULL OR s.poster_path IS NULL
     ORDER BY s.show_tmdb_id, s.season_number
     LIMIT $1`,
    [limit]
  );
  const seasons = res.rows;

  if (seasons.length === 0) {
    console.log('[Enrich Seasons] No seasons need enrichment.');
    return;
  }

  process.stdout.write(`\n[Enrich Seasons] Starting enrichment for ${seasons.length} seasons...\n`);

  let count = 0;
  const BATCH_SIZE = 15;

  for (let i = 0; i < seasons.length; i += BATCH_SIZE) {
    const batch = seasons.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (s) => {
        const isTurkish = s.original_language?.toLowerCase() === 'tr';
        const defaultRuntime = isTurkish ? 100 : 40;

        try {
          const d = await fetchTMDB(`/tv/${s.show_tmdb_id}/season/${s.season_number}`);

          const episodeCount = Array.isArray(d.episodes) ? d.episodes.length : (d.episode_count ?? null);

          // Update season details
          await query(
            `UPDATE seasons SET
               name          = COALESCE($1, name),
               overview      = COALESCE($2, overview),
               poster_path   = COALESCE($3, poster_path),
               air_date      = COALESCE($4, air_date),
               episode_count = COALESCE($5, episode_count)
             WHERE show_tmdb_id = $6 AND season_number = $7`,
            [
              d.name ?? null,
              d.overview ?? null,
              d.poster_path ?? null,
              d.air_date || null,
              episodeCount,
              s.show_tmdb_id,
              s.season_number,
            ]
          );

          // Upsert episodes included in the season response
          if (Array.isArray(d.episodes)) {
            for (const ep of d.episodes) {
              if (!ep.id) continue;
              const epSeason = ep.season_number ?? s.season_number;
              const epMediaKey = `episode:${s.show_tmdb_id}:${epSeason}:${ep.episode_number}`;
              const runtime = ep.runtime && ep.runtime > 0 ? ep.runtime : defaultRuntime;

              try {
                // First try: conflict on show_tmdb_id + season_number + episode_number
                await query(
                  `INSERT INTO episodes (
                     tmdb_id, media_key, show_tmdb_id, season_number, episode_number, title, runtime, air_date
                   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   ON CONFLICT (show_tmdb_id, season_number, episode_number) DO UPDATE SET
                     tmdb_id        = EXCLUDED.tmdb_id,
                     media_key      = EXCLUDED.media_key,
                     title          = EXCLUDED.title,
                     runtime        = EXCLUDED.runtime,
                     air_date       = EXCLUDED.air_date`,
                  [
                    ep.id,
                    epMediaKey,
                    s.show_tmdb_id,
                    ep.season_number ?? s.season_number,
                    ep.episode_number,
                    ep.name ?? null,
                    runtime,
                    ep.air_date || null,
                  ]
                );
              } catch {
                // Fallback try: conflict on tmdb_id
                await query(
                  `INSERT INTO episodes (
                     tmdb_id, media_key, show_tmdb_id, season_number, episode_number, title, runtime, air_date
                   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   ON CONFLICT (tmdb_id) DO UPDATE SET
                     media_key      = EXCLUDED.media_key,
                     season_number  = EXCLUDED.season_number,
                     episode_number = EXCLUDED.episode_number,
                     title          = EXCLUDED.title,
                     runtime        = EXCLUDED.runtime,
                     air_date       = EXCLUDED.air_date`,
                  [
                    ep.id,
                    epMediaKey,
                    s.show_tmdb_id,
                    ep.season_number ?? s.season_number,
                    ep.episode_number,
                    ep.name ?? null,
                    runtime,
                    ep.air_date || null,
                  ]
                );
              }
            }
          }

          count++;
        } catch (err: any) {
          console.error(`\n[Enrich Seasons] Failed season ${s.season_number} for show ${s.show_tmdb_id}:`, err?.message);
        }
      })
    );

    const progress = Math.min(i + BATCH_SIZE, seasons.length);
    const percent = ((progress / seasons.length) * 100).toFixed(1);
    process.stdout.write(`  ⟳  Seasons: ${progress}/${seasons.length} (${percent}%)\r`);

    // Rate limit delay between batches
    await new Promise((r) => setTimeout(r, 400));
  }

  process.stdout.write(`\n  ✓  Season enrichment complete. Updated: ${count}/${seasons.length}\n`);
}
