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
    console.log('[Enrich People] All people currently in DB are enriched.');
    return;
  }

  process.stdout.write(`\n[Enrich People] Starting enrichment for ${toEnrich.length} people...\n`);
  let enriched = 0;

  for (let i = 0; i < toEnrich.length; i += BATCH_SIZE) {
    const batch = toEnrich.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (p) => {
        try {
          const d = await fetchTMDB(`/person/${p.tmdb_id}?append_to_response=external_ids`);

          await query(
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
          enriched++;
        } catch {
          // Skip silently (deleted/restricted on TMDB)
        }
      })
    );

    const progress = Math.min(i + BATCH_SIZE, toEnrich.length);
    const percent = ((progress / toEnrich.length) * 100).toFixed(1);
    process.stdout.write(
      `  ⟳  People: ${progress}/${toEnrich.length} (${percent}%) | Last: "${batch[batch.length - 1].name}"\r`
    );

    if (i + BATCH_SIZE < toEnrich.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  process.stdout.write(`\n  ✓  People enrichment complete. Enriched: ${enriched}\n`);
}
