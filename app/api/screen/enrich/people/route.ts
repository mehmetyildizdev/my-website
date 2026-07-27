// app/api/enrich/people/route.ts
import { query } from '@/lib/screen/db';
import { fetchTMDB } from '@/lib/screen/tmdb';
import { redirectTo } from '@/lib/screen/utils/redirect';
import { parseBirthplaceToCountry } from '@/lib/screen/utils/birthplace';

const BATCH_SIZE = 30;
const BATCH_DELAY_MS = 200;

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

  const limit = parseInt(searchParams.get('limit') ?? '100000', 10);

  enrichPeople(limit).catch((err) => {
    console.error('\n[Enrich People] Fatal error:', err.message);
  });

  return redirectTo('/collection/screen/stats');
}

async function enrichPeople(limit: number) {
  const startTime = Date.now();

  // Find skeleton people rows that haven't been enriched yet (gender IS NULL)
  const res = await query(
    `SELECT tmdb_id, name FROM people 
     WHERE gender IS NULL 
     ORDER BY tmdb_id 
     LIMIT $1`,
    [limit]
  );
  const toEnrich = res.rows;

  if (toEnrich.length === 0) {
    process.stdout.write(`\n============================================================\n`);
    process.stdout.write(`[Enrich People] All people currently in database are already enriched.\n`);
    process.stdout.write(`============================================================\n\n`);
    return;
  }

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Enrich People] Starting enrichment for ${toEnrich.length} people...\n`);
  process.stdout.write(`============================================================\n`);

  let enrichedCount = 0;
  let countryLinksCount = 0;
  const errorLogs: string[] = [];

  for (let i = 0; i < toEnrich.length; i += BATCH_SIZE) {
    const batch = toEnrich.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (p) => {
        try {
          const d = await fetchTMDB(`/person/${p.tmdb_id}?append_to_response=external_ids`);

          const upRes = await query(
            `UPDATE people SET
               imdb_id    = COALESCE($1, imdb_id),
               popularity = $2,
               birth_date = $3,
               deathday   = $4,
               gender     = $5,
               known_for_department = $6,
               place_of_birth = $7
             WHERE tmdb_id = $8`,
            [
              d.external_ids?.imdb_id ?? null,
              d.popularity ?? 0,
              d.birthday ?? null,
              d.deathday ?? null,
              d.gender ?? 0,
              d.known_for_department ?? null,
              d.place_of_birth ?? '', // store empty string so it is not NULL
              p.tmdb_id,
            ]
          );

          if ((upRes.rowCount ?? 0) > 0) {
            enrichedCount++;
          }

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
              countryLinksCount++;
            }
          }
        } catch (err: any) {
          errorLogs.push(`[Person TMDB ID: ${p.tmdb_id}] "${p.name}": ${err.message}`);
        }
      })
    );

    const progress = Math.min(i + BATCH_SIZE, toEnrich.length);
    const percent = ((progress / toEnrich.length) * 100).toFixed(1);
    const lastPerson = batch[batch.length - 1]?.name || '';
    process.stdout.write(
      `  ⟳  People: ${progress}/${toEnrich.length} (${percent}%) | Enriched: ${enrichedCount} | Last: "${lastPerson}"\n`
    );

    if (i + BATCH_SIZE < toEnrich.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Enrich People] Complete Summary:\n`);
  process.stdout.write(`  • Total Execution Time: ${durationSec}s\n`);
  process.stdout.write(`  • People Checked:       ${toEnrich.length}\n`);
  process.stdout.write(`  • People Enriched:      ${enrichedCount}\n`);
  process.stdout.write(`  • Birthplace Countries: ${countryLinksCount} linked\n`);
  process.stdout.write(`  • Errors / Skipped:     ${errorLogs.length}\n`);

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
