// lib/screen/sync/shows.ts
// Syncs show metadata using TMDB /tv/{id} + /tv/{id}/aggregate_credits.
//
// DEADLOCK PREVENTION:
//   Shared lookup tables (genres, countries, production_companies, networks)
//   are inserted via the pool-level `query` (auto-committed) so parallel
//   show transactions never race on the same lookup rows.

import { getTMDBShow, fetchTMDB } from '../tmdb';
import { query } from '../db';
import { SyncStats, SyncOptions, CREW_JOBS } from './constants';
import { processPeopleCredits } from './people';

export async function syncShow(
  client: import('pg').PoolClient,
  traktShow: { title: string; ids: { tmdb: number; [key: string]: any } },
  stats: SyncStats,
  options: SyncOptions = {},
) {
  const tmdbId = traktShow.ids.tmdb;
  if (!tmdbId) return;

  const mediaKey = `show:${tmdbId}`;
  stats.new_shows_added++;
  process.stdout.write(`  ⟳  Fetching show ID ${tmdbId}…\r`);

  // Parallel fetch of show detail and aggregate credits
  const [tmdbData, aggCredits] = await Promise.all([getTMDBShow(tmdbId), fetchTMDB(`/tv/${tmdbId}/aggregate_credits`)]);

  const showName = tmdbData.name || traktShow.title || `Show #${tmdbId}`;

  // ── Core show row upsert ──────────────────────────────────────────────────
  await client.query(
    `INSERT INTO shows (
       tmdb_id, imdb_id, media_key, name, original_name, original_language,
       first_air_date, release_language, poster_path, backdrop_path,
       overview, number_of_episodes, number_of_seasons, tmdb_rating
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (tmdb_id) DO UPDATE SET
       imdb_id            = EXCLUDED.imdb_id,
       media_key          = EXCLUDED.media_key,
       name               = EXCLUDED.name,
       original_name      = EXCLUDED.original_name,
       original_language  = EXCLUDED.original_language,
       first_air_date     = EXCLUDED.first_air_date,
       release_language   = EXCLUDED.release_language,
       poster_path        = EXCLUDED.poster_path,
       backdrop_path      = EXCLUDED.backdrop_path,
       overview           = EXCLUDED.overview,
       number_of_episodes = EXCLUDED.number_of_episodes,
       number_of_seasons  = EXCLUDED.number_of_seasons,
       tmdb_rating        = EXCLUDED.tmdb_rating`,
    [
      tmdbId,
      tmdbData.external_ids?.imdb_id ?? null,
      mediaKey,
      showName,
      tmdbData.original_name ?? null,
      tmdbData.original_language ?? null,
      tmdbData.first_air_date || null,
      tmdbData.original_language ?? null,
      tmdbData.poster_path ?? null,
      tmdbData.backdrop_path ?? null,
      tmdbData.overview ?? null,
      tmdbData.number_of_episodes ?? null,
      tmdbData.number_of_seasons ?? null,
      tmdbData.vote_average ?? null,
    ],
  );

  // ── Genres (shared lookup — pool query) ───────────────────────────────────
  for (const genre of tmdbData.genres ?? []) {
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
    } else if (genre.id === 10768 || genre.name === 'War & Politics') {
      genresToInsert = [
        { id: 10752, name: 'War' },
        { id: 107681, name: 'Politics' },
      ];
    }

    for (const g of genresToInsert) {
      await query(`INSERT INTO genres (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [g.id, g.name]);
      await client.query(`INSERT INTO show_genres (show_tmdb_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [tmdbId, g.id]);
    }
  }

  // ── Countries (shared lookup — pool query) ────────────────────────────────
  for (const country of tmdbData.production_countries ?? []) {
    await query(`INSERT INTO countries (iso_3166_1, name) VALUES ($1, $2) ON CONFLICT (iso_3166_1) DO NOTHING`, [
      country.iso_3166_1,
      country.name,
    ]);
    await client.query(`INSERT INTO show_countries (show_tmdb_id, country_iso) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
      tmdbId,
      country.iso_3166_1,
    ]);
  }

  // ── Production companies (shared lookup — pool query) ──────────────────────
  for (const company of tmdbData.production_companies ?? []) {
    await query(
      `INSERT INTO production_companies (tmdb_id, name, logo_path, country_iso)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tmdb_id) DO NOTHING`,
      [company.id, company.name, company.logo_path ?? null, company.origin_country ?? null],
    );
    await client.query(
      `INSERT INTO show_production_companies (show_tmdb_id, company_tmdb_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [tmdbId, company.id],
    );
  }

  // ── Networks (shared lookup — pool query) ──────────────────────────────────
  for (const network of tmdbData.networks ?? []) {
    await query(
      `INSERT INTO networks (tmdb_id, name, logo_path, country_iso)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tmdb_id) DO NOTHING`,
      [network.id, network.name, network.logo_path ?? null, network.origin_country ?? null],
    );
    await client.query(`INSERT INTO show_networks (show_tmdb_id, network_tmdb_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
      tmdbId,
      network.id,
    ]);
  }

  // ── Seasons (skip season 0 = specials) ───────────────────────────────────
  for (const season of tmdbData.seasons ?? []) {
    if (season.season_number === 0) continue; // ignore specials
    const seasonMediaKey = `season:${tmdbId}:${season.season_number}`;
    await client.query(
      `INSERT INTO seasons (tmdb_id, show_tmdb_id, season_number, name, overview, poster_path, air_date, episode_count, media_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (show_tmdb_id, season_number) DO UPDATE SET
         name          = EXCLUDED.name,
         episode_count = EXCLUDED.episode_count,
         air_date      = EXCLUDED.air_date,
         poster_path   = EXCLUDED.poster_path,
         media_key     = EXCLUDED.media_key`,
      [
        season.id,
        tmdbId,
        season.season_number,
        season.name,
        season.overview,
        season.poster_path,
        season.air_date || null,
        season.episode_count,
        seasonMediaKey,
      ],
    );
  }

  // ── Build crew from aggregate_credits ───────────────────────────────────
  const crewToSync: any[] = [];
  for (const member of aggCredits.crew ?? []) {
    for (const job of member.jobs ?? []) {
      if (CREW_JOBS.has(job.job)) {
        crewToSync.push({
          id: member.id,
          name: member.name,
          profile_path: member.profile_path,
          known_for_department: member.known_for_department,
          job: job.job,
          episode_count: job.episode_count ?? null,
        });
      }
    }
  }

  // Creators from created_by field (top-level show detail)
  for (const creator of tmdbData.created_by ?? []) {
    crewToSync.push({
      id: creator.id,
      name: creator.name,
      profile_path: creator.profile_path,
      known_for_department: null,
      job: 'Creator',
      episode_count: null,
    });
  }

  // ── CAST from aggregate_credits ─────────────────────────────────────────
  const castToSync = (aggCredits.cast ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    profile_path: c.profile_path,
    known_for_department: c.known_for_department,
    character: c.roles?.[0]?.character ?? null,
    episode_count: c.total_episode_count ?? null,
  }));

  await processPeopleCredits(client, tmdbId, crewToSync, castToSync, 'show', stats);
}
