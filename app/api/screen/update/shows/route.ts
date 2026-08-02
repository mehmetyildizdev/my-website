// app/api/screen/update/shows/route.ts
import { query, transaction } from '@/lib/screen/db';
import { getTMDBShow, fetchTMDB } from '@/lib/screen/tmdb';
import { redirectTo } from '@/lib/screen/utils/redirect';
import { CREW_JOBS, makeSyncStats } from '@/lib/screen/sync/constants';
import { processPeopleCredits } from '@/lib/screen/sync/people';

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

  const limit = parseInt(searchParams.get('limit') ?? '1000', 10);
  const tmdbIdParam = searchParams.get('tmdb_id');
  const singleTmdbId = tmdbIdParam ? parseInt(tmdbIdParam, 10) : null;

  updateShows(limit, singleTmdbId).catch((err) => console.error('\n[Update Shows] Error:', err.message));

  return redirectTo('/collection/screen/stats');
}

async function updateShows(limit: number, singleTmdbId: number | null = null) {
  let shows: Array<{ tmdb_id: number; name: string }> = [];

  if (singleTmdbId) {
    const res = await query(`SELECT tmdb_id, name FROM shows WHERE tmdb_id = $1`, [singleTmdbId]);
    shows = res.rows;
    if (shows.length === 0) {
      shows = [{ tmdb_id: singleTmdbId, name: `Show #${singleTmdbId}` }];
    }
  } else {
    const res = await query(`SELECT tmdb_id, name FROM shows ORDER BY tmdb_id LIMIT $1`, [limit]);
    shows = res.rows;
  }

  if (shows.length === 0) {
    console.log('[Update Shows] No shows found in database.');
    return;
  }

  const modeStr = singleTmdbId ? `targeted show ID ${singleTmdbId}` : `${shows.length} shows`;
  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Update Shows] Starting update for ${modeStr}...\n`);
  process.stdout.write(`============================================================\n`);

  let totalShowsUpdated = 0;
  let totalSeasonsChecked = 0;
  let totalSeasonsChanged = 0;
  let totalEpisodesChecked = 0;
  let totalEpisodesChanged = 0;
  let totalPeopleSynced = 0;
  let totalPeopleUpdated = 0;
  let failedShows = 0;
  const errorLogs: string[] = [];

  for (let idx = 0; idx < shows.length; idx++) {
    const show = shows[idx];
    const tmdbId = show.tmdb_id;

    try {
      // 1. Fetch show detail and aggregate credits in parallel
      const [tmdbData, aggCredits] = await Promise.all([
        getTMDBShow(tmdbId),
        fetchTMDB(`/tv/${tmdbId}/aggregate_credits`),
      ]);

      const showName = tmdbData.name || show.name || `Show #${tmdbId}`;
      const isTurkish = tmdbData.original_language?.toLowerCase() === 'tr';
      const defaultRuntime = isTurkish ? 100 : 40;
      const mediaKey = `show:${tmdbId}`;
      const stats = makeSyncStats();

      let seasonsChecked = 0;
      let seasonsChanged = 0;
      let episodesChecked = 0;
      let episodesChanged = 0;
      let genresCount = 0;
      let networksCount = tmdbData.networks?.length ?? 0;
      let companiesCount = tmdbData.production_companies?.length ?? 0;
      let countriesCount = tmdbData.production_countries?.length ?? 0;

      // 2. Perform show core upserts inside a transaction
      await transaction(async (client) => {
        // Upsert Core Show row
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
             tmdb_rating        = EXCLUDED.tmdb_rating
           WHERE
             shows.imdb_id            IS DISTINCT FROM EXCLUDED.imdb_id OR
             shows.name               IS DISTINCT FROM EXCLUDED.name OR
             shows.original_name      IS DISTINCT FROM EXCLUDED.original_name OR
             shows.original_language  IS DISTINCT FROM EXCLUDED.original_language OR
             shows.first_air_date     IS DISTINCT FROM EXCLUDED.first_air_date OR
             shows.poster_path        IS DISTINCT FROM EXCLUDED.poster_path OR
             shows.backdrop_path      IS DISTINCT FROM EXCLUDED.backdrop_path OR
             shows.overview           IS DISTINCT FROM EXCLUDED.overview OR
             shows.number_of_episodes IS DISTINCT FROM EXCLUDED.number_of_episodes OR
             shows.number_of_seasons  IS DISTINCT FROM EXCLUDED.number_of_seasons OR
             shows.tmdb_rating        IS DISTINCT FROM EXCLUDED.tmdb_rating`,
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
          ]
        );

        // Genres (shared lookup with TMDB unified genre splitting)
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

          genresCount += genresToInsert.length;

          for (const g of genresToInsert) {
            await query(
              `INSERT INTO genres (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
              [g.id, g.name]
            );
            await client.query(
              `INSERT INTO show_genres (show_tmdb_id, genre_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [tmdbId, g.id]
            );
          }
        }

        // Countries (shared lookup)
        for (const country of tmdbData.production_countries ?? []) {
          await query(
            `INSERT INTO countries (iso_3166_1, name) VALUES ($1, $2) ON CONFLICT (iso_3166_1) DO NOTHING`,
            [country.iso_3166_1, country.name]
          );
          await client.query(
            `INSERT INTO show_countries (show_tmdb_id, country_iso) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [tmdbId, country.iso_3166_1]
          );
        }

        // Production Companies (shared lookup)
        for (const company of tmdbData.production_companies ?? []) {
          await query(
            `INSERT INTO production_companies (tmdb_id, name, logo_path, country_iso)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (tmdb_id) DO NOTHING`,
            [company.id, company.name, company.logo_path ?? null, company.origin_country ?? null]
          );
          await client.query(
            `INSERT INTO show_production_companies (show_tmdb_id, company_tmdb_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [tmdbId, company.id]
          );
        }

        // Networks (shared lookup)
        for (const network of tmdbData.networks ?? []) {
          await query(
            `INSERT INTO networks (tmdb_id, name, logo_path, country_iso)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (tmdb_id) DO NOTHING`,
            [network.id, network.name, network.logo_path ?? null, network.origin_country ?? null]
          );
          await client.query(
            `INSERT INTO show_networks (show_tmdb_id, network_tmdb_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [tmdbId, network.id]
          );
        }

        // Cast & Crew / People Credits
        const crewToSync: any[] = [];
        for (const member of aggCredits.crew ?? []) {
          for (const job of member.jobs ?? []) {
            if (CREW_JOBS.has(job.job)) {
              crewToSync.push({
                id: member.id,
                name: member.name,
                profile_path: member.profile_path,
                known_for_department: member.known_for_department,
                popularity: member.popularity ?? 0,
                job: job.job,
                episode_count: job.episode_count ?? null,
              });
            }
          }
        }
        for (const creator of tmdbData.created_by ?? []) {
          crewToSync.push({
            id: creator.id,
            name: creator.name,
            profile_path: creator.profile_path,
            known_for_department: null,
            popularity: (creator as any).popularity ?? 0,
            job: 'Creator',
            episode_count: null,
          });
        }

        const castToSync = (aggCredits.cast ?? [])
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            profile_path: c.profile_path,
            known_for_department: c.known_for_department,
            popularity: c.popularity ?? 0,
            character: c.roles?.[0]?.character ?? null,
            episode_count: c.total_episode_count ?? null,
          }));

        await processPeopleCredits(client, tmdbId, crewToSync, castToSync, 'show', stats);
      });

      // 3. Fetch each season details to update seasons & episodes tables
      const seasonList = tmdbData.seasons ?? [];
      for (const season of seasonList) {
        if (season.season_number === 0) continue; // ignore specials
        seasonsChecked++;

        try {
          const seasonData = await fetchTMDB(`/tv/${tmdbId}/season/${season.season_number}`);
          const seasonMediaKey = `season:${tmdbId}:${season.season_number}`;
          const epCount = Array.isArray(seasonData.episodes)
            ? seasonData.episodes.length
            : (season.episode_count ?? null);

          // Update Season (Only count if fields actually changed)
          const seasonRes = await query(
            `INSERT INTO seasons (tmdb_id, show_tmdb_id, season_number, name, overview, poster_path, air_date, episode_count, media_key)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (show_tmdb_id, season_number) DO UPDATE SET
               name          = EXCLUDED.name,
               overview      = EXCLUDED.overview,
               episode_count = EXCLUDED.episode_count,
               air_date      = EXCLUDED.air_date,
               poster_path   = EXCLUDED.poster_path,
               media_key     = EXCLUDED.media_key
             WHERE
               seasons.name          IS DISTINCT FROM EXCLUDED.name OR
               seasons.overview      IS DISTINCT FROM EXCLUDED.overview OR
               seasons.episode_count IS DISTINCT FROM EXCLUDED.episode_count OR
               seasons.air_date      IS DISTINCT FROM EXCLUDED.air_date OR
               seasons.poster_path   IS DISTINCT FROM EXCLUDED.poster_path OR
               seasons.media_key     IS DISTINCT FROM EXCLUDED.media_key`,
            [
              season.id,
              tmdbId,
              season.season_number,
              seasonData.name || season.name,
              seasonData.overview || season.overview || null,
              seasonData.poster_path || season.poster_path || null,
              seasonData.air_date || season.air_date || null,
              epCount,
              seasonMediaKey,
            ]
          );
          if ((seasonRes.rowCount ?? 0) > 0) {
            seasonsChanged++;
          }

          // Upsert Episodes
          if (Array.isArray(seasonData.episodes)) {
            for (const ep of seasonData.episodes) {
              if (!ep.id) continue;
              episodesChecked++;
              const epSeason = ep.season_number ?? season.season_number;
              const epMediaKey = `episode:${tmdbId}:${epSeason}:${ep.episode_number}`;
              const runtime = ep.runtime && ep.runtime > 0 ? ep.runtime : defaultRuntime;

              const runUpsert = async () => {
                return await query(
                  `INSERT INTO episodes (
                     tmdb_id, media_key, show_tmdb_id, season_number, episode_number, title, runtime, air_date
                   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   ON CONFLICT (tmdb_id) DO UPDATE SET
                     show_tmdb_id   = EXCLUDED.show_tmdb_id,
                     season_number  = EXCLUDED.season_number,
                     episode_number = EXCLUDED.episode_number,
                     title          = EXCLUDED.title,
                     runtime        = EXCLUDED.runtime,
                     air_date       = EXCLUDED.air_date,
                     media_key      = EXCLUDED.media_key
                   WHERE
                     episodes.show_tmdb_id   IS DISTINCT FROM EXCLUDED.show_tmdb_id OR
                     episodes.season_number  IS DISTINCT FROM EXCLUDED.season_number OR
                     episodes.episode_number IS DISTINCT FROM EXCLUDED.episode_number OR
                     episodes.title          IS DISTINCT FROM EXCLUDED.title OR
                     episodes.runtime        IS DISTINCT FROM EXCLUDED.runtime OR
                     episodes.air_date       IS DISTINCT FROM EXCLUDED.air_date OR
                     episodes.media_key      IS DISTINCT FROM EXCLUDED.media_key`,
                  [
                    ep.id,
                    epMediaKey,
                    tmdbId,
                    epSeason,
                    ep.episode_number,
                    ep.name ?? null,
                    runtime,
                    ep.air_date || null,
                  ]
                );
              };

              try {
                const epRes = await runUpsert();
                if ((epRes.rowCount ?? 0) > 0) {
                  episodesChanged++;
                }
              } catch (epConflictErr: any) {
                // If unique episode position conflict occurs due to swapped episode numbers in DB:
                // Temporarily move conflicting episode number to negative, then retry
                await query(
                  `UPDATE episodes SET episode_number = -episode_number WHERE show_tmdb_id = $1 AND season_number = $2 AND episode_number = $3`,
                  [tmdbId, epSeason, ep.episode_number]
                );
                const retryRes = await runUpsert();
                if ((retryRes.rowCount ?? 0) > 0) {
                  episodesChanged++;
                }
              }
            }

            // Cleanup any negative episode numbers that were not reassigned
            await query(
              `DELETE FROM episodes WHERE show_tmdb_id = $1 AND season_number = $2 AND episode_number < 0`,
              [tmdbId, season.season_number]
            );
          }
        } catch (seasonErr: any) {
          const msg = `Show ${tmdbId} ("${showName}") - Season ${season.season_number}: ${seasonErr.message}`;
          errorLogs.push(msg);
          console.error(`  ⚠️ Season ${season.season_number} fetch error for Show ${tmdbId}:`, seasonErr.message);
        }
      }

      totalShowsUpdated++;
      totalSeasonsChecked += seasonsChecked;
      totalSeasonsChanged += seasonsChanged;
      totalEpisodesChecked += episodesChecked;
      totalEpisodesChanged += episodesChanged;
      totalPeopleSynced += stats.new_people_added;
      totalPeopleUpdated += stats.people_updated;

      // Print clean progress log per Show ID
      process.stdout.write(
        `✓ [${idx + 1}/${shows.length}] Show ID ${tmdbId} ("${showName}")\n` +
        `  ├── Seasons: ${seasonsChanged} updated (${seasonsChecked} checked)\n` +
        `  ├── Episodes: ${episodesChanged} updated (${episodesChecked} checked)\n` +
        `  ├── People: ${stats.new_people_added} new added (${stats.people_updated} updated)\n` +
        `  └── Links: ${genresCount} genres, ${networksCount} networks, ${companiesCount} companies, ${countriesCount} countries\n`
      );

      // Brief delay to respect TMDB rate limits
      await new Promise((r) => setTimeout(r, 250));
    } catch (err: any) {
      failedShows++;
      const msg = `Show ${tmdbId} ("${show.name}"): ${err.message}`;
      errorLogs.push(msg);
      process.stdout.write(`✗ [${idx + 1}/${shows.length}] Failed Show ID ${tmdbId} ("${show.name}"): ${err.message}\n`);
    }
  }

  process.stdout.write(`\n============================================================\n`);
  process.stdout.write(`[Update Shows] Complete Summary:\n`);
  process.stdout.write(`  • Total Shows Processed: ${totalShowsUpdated}/${shows.length}\n`);
  process.stdout.write(`  • Total Seasons Checked: ${totalSeasonsChecked} (${totalSeasonsChanged} updated)\n`);
  process.stdout.write(`  • Total Episodes Checked: ${totalEpisodesChecked} (${totalEpisodesChanged} updated)\n`);
  process.stdout.write(`  • Total People Synced:   ${totalPeopleSynced} new added (${totalPeopleUpdated} updated)\n`);
  process.stdout.write(`  • Total Errors/Warnings:  ${errorLogs.length}\n`);

  if (errorLogs.length > 0) {
    process.stdout.write(`\n[Errors & Warnings Encountered]:\n`);
    errorLogs.forEach((err, i) => {
      process.stdout.write(`  ${i + 1}. ${err}\n`);
    });
  }

  process.stdout.write(`============================================================\n\n`);
}
