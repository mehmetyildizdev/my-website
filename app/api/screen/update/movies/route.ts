// app/api/screen/update/movies/route.ts
import { query, transaction } from '@/lib/screen/db';
import { getTMDBMovie } from '@/lib/screen/tmdb';
import { redirectTo } from '@/lib/screen/utils/redirect';
import { CREW_JOBS, makeSyncStats } from '@/lib/screen/sync/constants';
import { processPeopleCredits } from '@/lib/screen/sync/people';

const BATCH_SIZE = 15;
const BATCH_DELAY_MS = 350; // Respects TMDB ~30 req/sec rate limit

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

  const limit = parseInt(searchParams.get('limit') ?? '10000', 10);
  const tmdbIdParam = searchParams.get('tmdb_id');
  const singleTmdbId = tmdbIdParam ? parseInt(tmdbIdParam, 10) : null;

  updateMovies(limit, singleTmdbId).catch((err) => console.error('\n[Update Movies] Error:', err.message));

  return redirectTo('/collection/screen/stats');
}

async function updateMovies(limit: number, singleTmdbId: number | null = null) {
  let movies: Array<{ tmdb_id: number; title: string }> = [];

  if (singleTmdbId) {
    const res = await query(`SELECT tmdb_id, title FROM movies WHERE tmdb_id = $1`, [singleTmdbId]);
    movies = res.rows;
    if (movies.length === 0) {
      movies = [{ tmdb_id: singleTmdbId, title: `Movie #${singleTmdbId}` }];
    }
  } else {
    const res = await query(`SELECT tmdb_id, title FROM movies ORDER BY tmdb_id LIMIT $1`, [limit]);
    movies = res.rows;
  }

  if (movies.length === 0) {
    console.log('[Update Movies] No movies found in database.');
    return;
  }

  const modeStr = singleTmdbId ? `targeted movie ID ${singleTmdbId}` : `${movies.length} movies`;
  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Update Movies] Starting high-speed update for ${modeStr}...\n`);
  process.stdout.write(`============================================================\n`);

  let totalMoviesChecked = 0;
  let totalMoviesChanged = 0;
  let totalPeopleSynced = 0;
  let failedMovies = 0;
  const errorLogs: string[] = [];

  for (let i = 0; i < movies.length; i += BATCH_SIZE) {
    const batch = movies.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (m, batchIdx) => {
        const tmdbId = m.tmdb_id;

        try {
          // Single TMDB API call gets details, credits, and external_ids
          const d = await getTMDBMovie(tmdbId);
          const movieTitle = d.title || m.title || `Movie #${tmdbId}`;
          const mediaKey = `movie:${tmdbId}`;
          const stats = makeSyncStats();

          // Collection Handling
          let collectionId: number | null = null;
          let collectionName: string | null = null;
          if (d.belongs_to_collection?.id) {
            collectionId = d.belongs_to_collection.id;
            collectionName = d.belongs_to_collection.name;
            await query(
              `INSERT INTO collections (tmdb_id, name, poster_path, backdrop_path)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (tmdb_id) DO UPDATE SET
                 name          = EXCLUDED.name,
                 poster_path   = COALESCE(EXCLUDED.poster_path, collections.poster_path),
                 backdrop_path = COALESCE(EXCLUDED.backdrop_path, collections.backdrop_path)`,
              [collectionId, collectionName, d.belongs_to_collection.poster_path ?? null, d.belongs_to_collection.backdrop_path ?? null],
            );
          }

          let changed = false;
          const genresCount = d.genres?.length ?? 0;
          const countriesCount = d.production_countries?.length ?? 0;
          const companiesCount = d.production_companies?.length ?? 0;

          await transaction(async (client) => {
            // Upsert Core Movie Row
            const movieRes = await client.query(
              `INSERT INTO movies (
                 tmdb_id, imdb_id, media_key, title, original_title, original_language,
                 release_date, release_language, runtime, poster_path, backdrop_path,
                 overview, tmdb_rating, collection_id
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
               ON CONFLICT (tmdb_id) DO UPDATE SET
                 imdb_id           = EXCLUDED.imdb_id,
                 title             = EXCLUDED.title,
                 original_title    = EXCLUDED.original_title,
                 original_language = EXCLUDED.original_language,
                 release_date      = EXCLUDED.release_date,
                 runtime           = EXCLUDED.runtime,
                 poster_path       = EXCLUDED.poster_path,
                 backdrop_path     = EXCLUDED.backdrop_path,
                 overview          = EXCLUDED.overview,
                 tmdb_rating       = EXCLUDED.tmdb_rating,
                 collection_id     = EXCLUDED.collection_id
               WHERE
                 movies.imdb_id           IS DISTINCT FROM EXCLUDED.imdb_id OR
                 movies.title             IS DISTINCT FROM EXCLUDED.title OR
                 movies.original_title    IS DISTINCT FROM EXCLUDED.original_title OR
                 movies.original_language IS DISTINCT FROM EXCLUDED.original_language OR
                 movies.release_date      IS DISTINCT FROM EXCLUDED.release_date OR
                 movies.runtime           IS DISTINCT FROM EXCLUDED.runtime OR
                 movies.poster_path       IS DISTINCT FROM EXCLUDED.poster_path OR
                 movies.backdrop_path     IS DISTINCT FROM EXCLUDED.backdrop_path OR
                 movies.overview          IS DISTINCT FROM EXCLUDED.overview OR
                 movies.tmdb_rating       IS DISTINCT FROM EXCLUDED.tmdb_rating OR
                 movies.collection_id     IS DISTINCT FROM EXCLUDED.collection_id`,
              [
                tmdbId,
                d.imdb_id ?? d.external_ids?.imdb_id ?? null,
                mediaKey,
                movieTitle,
                d.original_title ?? null,
                d.original_language ?? null,
                d.release_date || null,
                d.original_language ?? null,
                d.runtime ?? null,
                d.poster_path ?? null,
                d.backdrop_path ?? null,
                d.overview ?? null,
                d.vote_average ?? null,
                collectionId,
              ],
            );

            if ((movieRes.rowCount ?? 0) > 0) {
              changed = true;
            }

            // Genres (shared lookup)
            for (const genre of d.genres ?? []) {
              let genresToInsert = [{ id: genre.id, name: genre.name }];
              if (genre.id === 10765 || genre.name === 'Sci-Fi & Fantasy') {
                genresToInsert = [
                  { id: 878, name: 'Science Fiction' },
                  { id: 14, name: 'Fantasy' },
                ];
              } else if (genre.id === 10759 || genre.name === 'Action & Adventure') {
                genresToInsert = [
                  { id: 28, name: 'Action' },
                  { id: 12, name: 'Adventure' },
                ];
              }

              for (const g of genresToInsert) {
                await query(`INSERT INTO genres (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [g.id, g.name]);
                await client.query(`INSERT INTO movie_genres (movie_tmdb_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
                  tmdbId,
                  g.id,
                ]);
              }
            }

            // Production Countries (shared lookup)
            for (const country of d.production_countries ?? []) {
              await query(`INSERT INTO countries (iso_3166_1, name) VALUES ($1, $2) ON CONFLICT (iso_3166_1) DO NOTHING`, [
                country.iso_3166_1,
                country.name,
              ]);
              await client.query(`INSERT INTO movie_countries (movie_tmdb_id, country_iso) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
                tmdbId,
                country.iso_3166_1,
              ]);
            }

            // Production Companies (shared lookup)
            for (const company of d.production_companies ?? []) {
              await query(
                `INSERT INTO production_companies (tmdb_id, name, logo_path, country_iso)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (tmdb_id) DO NOTHING`,
                [company.id, company.name, company.logo_path ?? null, company.origin_country ?? null],
              );
              await client.query(
                `INSERT INTO movie_production_companies (movie_tmdb_id, company_tmdb_id)
                 VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [tmdbId, company.id],
              );
            }

            // Cast & Crew / People Credits
            const crewToSync = (d.credits?.crew ?? [])
              .filter((m: any) => CREW_JOBS.has(m.job))
              .map((m: any) => ({
                id: m.id,
                name: m.name,
                profile_path: m.profile_path,
                known_for_department: m.known_for_department,
                popularity: m.popularity ?? 0,
                job: m.job,
              }));

            const castToSync = (d.credits?.cast ?? []).map((c: any) => ({
              id: c.id,
              name: c.name,
              profile_path: c.profile_path,
              known_for_department: c.known_for_department,
              popularity: c.popularity ?? 0,
              character: c.character ?? null,
              order: c.order,
            }));

            await processPeopleCredits(client, tmdbId, crewToSync, castToSync, 'movie', stats);
          });

          totalMoviesChecked++;
          if (changed) totalMoviesChanged++;
          totalPeopleSynced += stats.new_people_added;

          // If targeted single movie update, print explicit details
          if (singleTmdbId) {
            process.stdout.write(
              `✓ Movie ID ${tmdbId} ("${movieTitle}")\n` +
                `  ├── Core Metadata: ${changed ? 'updated' : 'unchanged'}\n` +
                `  ├── Collection: ${collectionName ? `"${collectionName}"` : 'none'}\n` +
                `  ├── Genres: ${genresCount} linked\n` +
                `  ├── Countries: ${countriesCount} linked\n` +
                `  ├── Companies: ${companiesCount} linked\n` +
                `  └── People: ${stats.new_people_added} new people added\n`,
            );
          }
        } catch (err: any) {
          failedMovies++;
          const msg = `Movie ID ${tmdbId} ("${m.title}"): ${err.message}`;
          errorLogs.push(msg);
        }
      }),
    );

    if (!singleTmdbId) {
      const progress = Math.min(i + BATCH_SIZE, movies.length);
      const percent = ((progress / movies.length) * 100).toFixed(1);
      process.stdout.write(
        `  ⟳  Movies: ${progress}/${movies.length} (${percent}%) | Updated: ${totalMoviesChanged} | Added People: ${totalPeopleSynced}\n`,
      );
    }

    // Rate limit delay between parallel batches
    if (i + BATCH_SIZE < movies.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Update Movies] Complete Summary:\n`);
  process.stdout.write(`  • Total Movies Checked:  ${totalMoviesChecked}/${movies.length} (${totalMoviesChanged} updated)\n`);
  process.stdout.write(`  • Total People Added:    ${totalPeopleSynced}\n`);
  process.stdout.write(`  • Total Errors/Warnings:  ${errorLogs.length}\n`);

  if (errorLogs.length > 0) {
    process.stdout.write(`\n[Errors & Warnings Encountered]:\n`);
    errorLogs.forEach((err, i) => {
      process.stdout.write(`  ${i + 1}. ${err}\n`);
    });
  }

  process.stdout.write(`============================================================\n\n`);
}
