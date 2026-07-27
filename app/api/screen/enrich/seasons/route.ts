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
  const startTime = Date.now();

  // Find skeleton season rows missing episode_count (un-enriched season stubs)
  const res = await query(
    `SELECT s.tmdb_id, s.show_tmdb_id, s.season_number, sh.original_language, s.name as season_name, sh.name as show_name
     FROM seasons s
     JOIN shows sh ON s.show_tmdb_id = sh.tmdb_id
     WHERE s.episode_count IS NULL
     ORDER BY s.show_tmdb_id, s.season_number
     LIMIT $1`,
    [limit]
  );
  const seasons = res.rows;

  if (seasons.length === 0) {
    process.stdout.write(`\n============================================================\n`);
    process.stdout.write(`[Enrich Seasons] All seasons currently in database are enriched.\n`);
    process.stdout.write(`============================================================\n\n`);
    return;
  }

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Enrich Seasons] Starting enrichment for ${seasons.length} seasons...\n`);
  process.stdout.write(`============================================================\n`);

  let seasonsUpdatedCount = 0;
  let episodesAddedCount = 0;
  let episodesUpdatedCount = 0;
  const errorLogs: string[] = [];
  const BATCH_SIZE = 15;

  for (let i = 0; i < seasons.length; i += BATCH_SIZE) {
    const batch = seasons.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (s) => {
        const isTurkish = s.original_language?.toLowerCase() === 'tr';
        const defaultRuntime = isTurkish ? 100 : 40;

        try {
          const d = await fetchTMDB(`/tv/${s.show_tmdb_id}/season/${s.season_number}`);

          const episodeCount = Array.isArray(d.episodes) ? d.episodes.length : (d.episode_count ?? 0);

          // Update season details keeping natural NULL values
          const upRes = await query(
            `UPDATE seasons SET
               name          = COALESCE($1, name),
               overview      = COALESCE($2, overview),
               poster_path   = COALESCE($3, poster_path),
               air_date      = COALESCE($4, air_date),
               episode_count = $5
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
          if ((upRes.rowCount ?? 0) > 0) {
            seasonsUpdatedCount++;
          }

          // Insert / Update episodes included in the season response
          if (Array.isArray(d.episodes)) {
            for (const ep of d.episodes) {
              if (!ep.id) continue;
              const epSeason = ep.season_number ?? s.season_number;
              const epMediaKey = `episode:${s.show_tmdb_id}:${epSeason}:${ep.episode_number}`;
              const runtime = ep.runtime && ep.runtime > 0 ? ep.runtime : defaultRuntime;

              try {
                const epRes = await query(
                  `INSERT INTO episodes (
                     tmdb_id, media_key, show_tmdb_id, season_number, episode_number, title, runtime, air_date
                   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   ON CONFLICT (show_tmdb_id, season_number, episode_number) DO UPDATE SET
                     tmdb_id        = EXCLUDED.tmdb_id,
                     media_key      = EXCLUDED.media_key,
                     title          = EXCLUDED.title,
                     runtime        = EXCLUDED.runtime,
                     air_date       = EXCLUDED.air_date
                   RETURNING (xmax = 0) AS is_inserted`,
                  [
                    ep.id,
                    epMediaKey,
                    s.show_tmdb_id,
                    epSeason,
                    ep.episode_number,
                    ep.name ?? null,
                    runtime,
                    ep.air_date || null,
                  ]
                );
                const isInserted = epRes.rows[0]?.is_inserted;
                if (isInserted) {
                  episodesAddedCount++;
                } else if ((epRes.rowCount ?? 0) > 0) {
                  episodesUpdatedCount++;
                }
              } catch (epConflictErr: any) {
                // Secondary conflict handling on tmdb_id if unique constraint exists
                const epRes = await query(
                  `INSERT INTO episodes (
                     tmdb_id, media_key, show_tmdb_id, season_number, episode_number, title, runtime, air_date
                   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   ON CONFLICT (tmdb_id) DO UPDATE SET
                     media_key      = EXCLUDED.media_key,
                     show_tmdb_id   = EXCLUDED.show_tmdb_id,
                     season_number  = EXCLUDED.season_number,
                     episode_number = EXCLUDED.episode_number,
                     title          = EXCLUDED.title,
                     runtime        = EXCLUDED.runtime,
                     air_date       = EXCLUDED.air_date
                   RETURNING (xmax = 0) AS is_inserted`,
                  [
                    ep.id,
                    epMediaKey,
                    s.show_tmdb_id,
                    epSeason,
                    ep.episode_number,
                    ep.name ?? null,
                    runtime,
                    ep.air_date || null,
                  ]
                );
                const isInserted = epRes.rows[0]?.is_inserted;
                if (isInserted) {
                  episodesAddedCount++;
                } else if ((epRes.rowCount ?? 0) > 0) {
                  episodesUpdatedCount++;
                }
              }
            }
          }
        } catch (err: any) {
          errorLogs.push(`[Show TMDB ID: ${s.show_tmdb_id}] Season ${s.season_number} of "${s.show_name}": ${err.message}`);
        }
      })
    );

    const progress = Math.min(i + BATCH_SIZE, seasons.length);
    const percent = ((progress / seasons.length) * 100).toFixed(1);
    process.stdout.write(`  ⟳  Seasons: ${progress}/${seasons.length} (${percent}%) | Updated: ${seasonsUpdatedCount}\n`);

    await new Promise((r) => setTimeout(r, 250));
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Enrich Seasons] Complete Summary:\n`);
  process.stdout.write(`  • Total Execution Time: ${durationSec}s\n`);
  process.stdout.write(`  • Seasons Processed:    ${seasons.length}\n`);
  process.stdout.write(`  • Seasons Updated:      ${seasonsUpdatedCount}\n`);
  process.stdout.write(`  • Episodes Added:       ${episodesAddedCount} new inserted\n`);
  process.stdout.write(`  • Episodes Updated:     ${episodesUpdatedCount} modified\n`);
  process.stdout.write(`  • Errors Encountered:   ${errorLogs.length}\n`);

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
