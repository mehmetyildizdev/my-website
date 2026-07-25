// lib/screen/sync/history.ts
//
// ENRICH HISTORY PIPELINE
// -----------------------
// 1. MOVIES:
//    Finds missing movies in `watch_history`, fetches /movie/{id}, and inserts
//    movies, collections, genres, countries, production companies, cast, crew.
//
// 2. SHOWS, SEASONS & EPISODES:
//    Finds missing show IDs in `watch_history`, fetches /tv/{show_id} for show & seasons,
//    and fetches /tv/{show_id}/season/{s} to populate all episode rows in `episodes`.
//
// 3. RATINGS (my_rating):
//    Evaluates and synchronizes personal ratings from watch_history to movies and shows.

import { query, transaction } from '../db';
import { fetchTMDB, getTMDBMovie } from '../tmdb';
import { log } from '../logger';
import { CREW_JOBS, SyncStats, makeSyncStats } from './constants';
import { processPeopleCredits } from './people';
import { syncShow } from './shows';

export interface EnrichHistoryResult {
  moviesEnriched: number;
  showsEnriched: number;
  episodesEnriched: number;
  errors: string[];
}

/**
 * Syncs a single movie's metadata, collections, genres, countries,
 * production companies, cast, and crew into PostgreSQL.
 */
export async function syncMovie(client: import('pg').PoolClient, tmdbId: number, stats: SyncStats) {
  const mediaKey = `movie:${tmdbId}`;

  const existing = await client.query(`SELECT tmdb_id FROM movies WHERE tmdb_id = $1`, [tmdbId]);
  if (existing.rowCount && existing.rowCount > 0) return;

  const d = await getTMDBMovie(tmdbId);

  // 1. Collections
  let collectionId: number | null = null;
  if (d.belongs_to_collection) {
    const c = d.belongs_to_collection;
    collectionId = c.id;
    await query(
      `INSERT INTO collections (tmdb_id, name, poster_path, backdrop_path)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tmdb_id) DO NOTHING`,
      [c.id, c.name, c.poster_path ?? null, c.backdrop_path ?? null]
    );
  }

  // 2. Lookup personal rating from watch_history
  const ratingRes = await client.query(
    `SELECT my_rating FROM watch_history 
     WHERE tmdb_id = $1 AND (media_type = 'movie' OR media_key LIKE 'movie:%') AND my_rating IS NOT NULL 
     ORDER BY watched_at DESC LIMIT 1`,
    [tmdbId]
  );
  const myRating = ratingRes.rows[0]?.my_rating ?? null;

  // 3. Insert movie row
  await client.query(
    `INSERT INTO movies (
       tmdb_id, imdb_id, media_key, title, original_title, original_language,
       release_date, release_language, runtime, poster_path, backdrop_path,
       overview, tmdb_rating, my_rating, collection_id
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
       my_rating         = COALESCE(EXCLUDED.my_rating, movies.my_rating),
       collection_id     = EXCLUDED.collection_id`,
    [
      tmdbId,
      d.imdb_id ?? d.external_ids?.imdb_id ?? null,
      mediaKey,
      d.title,
      d.original_title ?? null,
      d.original_language ?? null,
      d.release_date || null,
      d.original_language ?? null,
      d.runtime ?? null,
      d.poster_path ?? null,
      d.backdrop_path ?? null,
      d.overview ?? null,
      d.vote_average ?? null,
      myRating,
      collectionId,
    ]
  );
  stats.new_movies_added++;

  // 4. Genres
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
      await query(`INSERT INTO genres (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [
        g.id,
        g.name,
      ]);
      await client.query(
        `INSERT INTO movie_genres (movie_tmdb_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [tmdbId, g.id]
      );
    }
  }

  // 5. Countries
  for (const country of d.production_countries ?? []) {
    await query(
      `INSERT INTO countries (iso_3166_1, name) VALUES ($1, $2) ON CONFLICT (iso_3166_1) DO NOTHING`,
      [country.iso_3166_1, country.name]
    );
    await client.query(
      `INSERT INTO movie_countries (movie_tmdb_id, country_iso) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tmdbId, country.iso_3166_1]
    );
  }

  // 6. Production Companies
  for (const company of d.production_companies ?? []) {
    await query(
      `INSERT INTO production_companies (tmdb_id, name, logo_path, country_iso)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tmdb_id) DO NOTHING`,
      [company.id, company.name, company.logo_path ?? null, company.origin_country ?? null]
    );
    await client.query(
      `INSERT INTO movie_production_companies (movie_tmdb_id, company_tmdb_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tmdbId, company.id]
    );
  }

  // 7. Cast & Crew
  const crewToSync = (d.credits?.crew ?? [])
    .filter((c: any) => CREW_JOBS.has(c.job))
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      profile_path: c.profile_path,
      known_for_department: c.known_for_department,
      job: c.job,
    }));

  const castToSync = (d.credits?.cast ?? [])
    .filter((c: any) => c.profile_path)
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      profile_path: c.profile_path,
      known_for_department: c.known_for_department,
      character: c.character ?? null,
      order: c.order ?? 99,
    }));

  await processPeopleCredits(client, tmdbId, crewToSync, castToSync, 'movie', stats);
}

/**
 * Syncs a show, its seasons, and all season episodes from TMDB into PostgreSQL.
 * Flow: /tv/{show_id} -> shows & seasons -> /tv/{show_id}/season/{s} -> episodes.
 */
export async function syncShowWithEpisodes(
  client: import('pg').PoolClient,
  showTmdbId: number,
  stats: SyncStats
) {
  // 1. Sync show metadata, cast, crew, genres, networks, production companies, and seasons
  await syncShow(client, { title: '', ids: { tmdb: showTmdbId } }, stats);

  // 2. Fetch TMDB show detail to get the list of seasons
  const tmdbShow = await fetchTMDB(`/tv/${showTmdbId}`);
  const seasons = tmdbShow.seasons ?? [];

  // 3. For each season (skipping specials/season 0), fetch season episodes and insert into `episodes`
  for (const s of seasons) {
    if (s.season_number === 0) continue; // ignore specials
    try {
      const seasonData = await fetchTMDB(`/tv/${showTmdbId}/season/${s.season_number}`);
      for (const ep of seasonData.episodes ?? []) {
        const epSeason = ep.season_number ?? s.season_number;
        const epMediaKey = `episode:${showTmdbId}:${epSeason}:${ep.episode_number}`;
        await client.query(
          `INSERT INTO episodes (
             tmdb_id, media_key, show_tmdb_id, season_number, episode_number,
             title, runtime, air_date
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (tmdb_id) DO UPDATE SET
             season_number  = EXCLUDED.season_number,
             episode_number = EXCLUDED.episode_number,
             title          = EXCLUDED.title,
             runtime        = EXCLUDED.runtime,
             air_date       = EXCLUDED.air_date`,
          [
            ep.id,
            epMediaKey,
            showTmdbId,
            ep.season_number,
            ep.episode_number,
            ep.name ?? null,
            ep.runtime ?? null,
            ep.air_date ?? null,
          ]
        );
        stats.new_episodes_added++;
      }
      await new Promise((r) => setTimeout(r, 50));
    } catch (err: any) {
      log.warn(`Could not fetch Season ${s.season_number} for Show ${showTmdbId}: ${err.message}`);
    }
  }
}

/**
 * Main Entry Point for Enrich History API route.
 */
export async function enrichMissingHistory(limit: number = 1000): Promise<EnrichHistoryResult> {
  const stats = makeSyncStats();
  const result: EnrichHistoryResult = {
    moviesEnriched: 0,
    showsEnriched: 0,
    episodesEnriched: 0,
    errors: [],
  };

  log.section('Enrich History Pipeline');

  try {
    const dbCheck = await query(
      'SELECT current_database(), current_user, inet_server_port(), inet_server_addr()'
    );
    const info = dbCheck.rows[0] || {};
    log.info(
      `Database Target: ${info.current_user}@${info.inet_server_addr || 'localhost'}:${info.inet_server_port}/${info.current_database}`
    );
  } catch (err: any) {
    log.warn(`Could not verify DB connection target: ${err.message}`);
  }

  // ── 1. Find missing MOVIES in watch_history ─────────────────────────────────
  const missingMoviesRes = await query(
    `SELECT DISTINCT 
       COALESCE(
         CASE 
           WHEN wh.media_key LIKE 'movie:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
           THEN SPLIT_PART(wh.media_key, ':', 2)::integer
           ELSE NULL
         END,
         wh.tmdb_id
       ) AS tmdb_id
     FROM watch_history wh
     LEFT JOIN movies m ON m.tmdb_id = COALESCE(
       CASE 
         WHEN wh.media_key LIKE 'movie:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
         THEN SPLIT_PART(wh.media_key, ':', 2)::integer
         ELSE NULL
       END,
       wh.tmdb_id
     )
     WHERE (wh.media_type = 'movie' OR wh.media_key LIKE 'movie:%')
       AND m.tmdb_id IS NULL
     LIMIT $1`,
    [limit]
  );
  const missingMovieIds = missingMoviesRes.rows.map((r) => r.tmdb_id).filter(Boolean);

  if (missingMovieIds.length === 0) {
    log.done('No missing movies to enrich.');
  } else {
    log.info(`Found ${missingMovieIds.length} missing movies to enrich in watch_history.`);
    let idx = 0;
    for (const tmdbId of missingMovieIds) {
      idx++;
      try {
        let movieTitle = `Movie #${tmdbId}`;
        await transaction(async (client) => {
          await syncMovie(client, tmdbId, stats);
          const titleRes = await client.query(`SELECT title FROM movies WHERE tmdb_id = $1`, [
            tmdbId,
          ]);
          if (titleRes.rows[0]?.title) movieTitle = titleRes.rows[0].title;
        });
        result.moviesEnriched++;
        log.done(
          `[${idx}/${missingMovieIds.length}] Enriched Movie: "${movieTitle}" (TMDB ${tmdbId})`
        );

        await new Promise((r) => setTimeout(r, 50));
      } catch (err: any) {
        const msg = `Movie ${tmdbId} failed: ${err.message}`;
        log.error(msg);
        result.errors.push(msg);
      }
    }
  }

  // ── 2. Find missing SHOWS in watch_history & populate show, seasons, episodes ─
  // RATIONALE: watch_history media_key stores episode scrobbles as `episode:SHOW_TMDB_ID:SEASON:EPISODE`.
  // We extract the SHOW_TMDB_ID via `SPLIT_PART(wh.media_key, ':', 2)::integer`.
  // For any show missing from `shows`:
  // 1. Fetch show (/tv/{show_id}) to fill `shows` and `seasons` tables.
  // 2. Fetch each season (/tv/{show_id}/season/{s}) to fill all `episodes` for that show.
  const missingShowsRes = await query(
    `WITH extracted_shows AS (
       SELECT 
         wh.id AS watch_history_id,
         wh.tmdb_id AS episode_tmdb_id,
         wh.watched_at,
         wh.my_rating,
         COALESCE(
           CASE 
             WHEN wh.media_key LIKE 'episode:%:%:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
             THEN SPLIT_PART(wh.media_key, ':', 2)::integer
             WHEN wh.media_key LIKE 'show:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
             THEN SPLIT_PART(wh.media_key, ':', 2)::integer
             WHEN wh.media_type = 'show'
             THEN wh.tmdb_id
             ELSE ep.show_tmdb_id
           END
         ) AS show_tmdb_id
       FROM watch_history wh
       LEFT JOIN episodes ep ON wh.media_type = 'episode' AND wh.tmdb_id = ep.tmdb_id
       WHERE (
         wh.media_type IN ('episode', 'show')
         OR wh.media_key LIKE 'episode:%'
         OR wh.media_key LIKE 'show:%'
       )
     )
     SELECT DISTINCT es.show_tmdb_id
     FROM extracted_shows es
     LEFT JOIN shows s ON es.show_tmdb_id = s.tmdb_id
     LEFT JOIN episodes ep ON es.episode_tmdb_id = ep.tmdb_id
     WHERE es.show_tmdb_id IS NOT NULL
       AND (
         s.tmdb_id IS NULL 
         OR s.name IS NULL 
         OR s.name = ''
         OR ep.tmdb_id IS NULL
       )
     LIMIT $1`,
    [limit]
  );
  const missingShowIds = missingShowsRes.rows.map((r) => r.show_tmdb_id).filter(Boolean);

  if (missingShowIds.length === 0) {
    log.done('No missing shows to enrich.');
  } else {
    log.info(`Found ${missingShowIds.length} missing shows to enrich in watch_history.`);
    let showIdx = 0;
    for (const showTmdbId of missingShowIds) {
      showIdx++;
      try {
        let showName = `Show #${showTmdbId}`;
        await transaction(async (client) => {
          // Fetch show (/tv/{show_id}), seasons, and all season episodes (/tv/{show_id}/season/{s})
          await syncShowWithEpisodes(client, showTmdbId, stats);
          const nameRes = await client.query(`SELECT name FROM shows WHERE tmdb_id = $1`, [
            showTmdbId,
          ]);
          if (nameRes.rows[0]?.name) showName = nameRes.rows[0].name;
        });
        result.showsEnriched++;
        result.episodesEnriched += stats.new_episodes_added;
        log.done(
          `[${showIdx}/${missingShowIds.length}] Enriched Show, Seasons & Episodes: "${showName}" (TMDB ${showTmdbId})`
        );

        // Respect TMDB API rate limit (max 30 req/sec)
        await new Promise((r) => setTimeout(r, 50));
      } catch (err: any) {
        const msg = `Show ${showTmdbId} failed: ${err.message}`;
        log.error(msg);
        result.errors.push(msg);
      }
    }
  }

  // ── 3. Backfill my_rating for movies & shows from watch_history ──────────────
  try {
    await query(`
      UPDATE movies m
      SET my_rating = wh.my_rating
      FROM watch_history wh
      WHERE m.tmdb_id = wh.tmdb_id
        AND (wh.media_type = 'movie' OR wh.media_key LIKE 'movie:%')
        AND wh.my_rating IS NOT NULL
        AND m.my_rating IS DISTINCT FROM wh.my_rating
    `);
    await query(`
      UPDATE shows s
      SET my_rating = wh.my_rating
      FROM watch_history wh
      WHERE s.tmdb_id = wh.tmdb_id
        AND (wh.media_type = 'show' OR wh.media_key LIKE 'show:%')
        AND wh.my_rating IS NOT NULL
        AND s.my_rating IS DISTINCT FROM wh.my_rating
    `);
    log.info('Evaluated and synchronized updated personal ratings (my_rating) from watch_history.');
  } catch (err: any) {
    log.warn(`Could not sync ratings: ${err.message}`);
  }

  log.section('Enrich History Pipeline — Summary');
  log.info(`Movies Enriched : ${result.moviesEnriched}`);
  log.info(`Shows Enriched  : ${result.showsEnriched}`);
  log.info(`Episodes Added  : ${result.episodesEnriched}`);
  if (result.errors.length > 0) {
    log.warn(`Errors Encountered: ${result.errors.length}`);
    result.errors.forEach((e) => log.error(e));
  }

  try {
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/api/screen/recent');
    revalidatePath('/collection/screen');
    log.info('Revalidated recent watch list cache.');
  } catch (cacheErr: any) {
    log.warn(`Could not revalidate recent cache: ${cacheErr.message}`);
  }

  log.section('Enrich History Pipeline — Complete');
  return result;
}
