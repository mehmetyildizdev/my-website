// lib/screen/sync/people.ts
// Handles upsert of people rows and their cast/crew credit links.
//
// BULK INSERT STRATEGY:
//   All people, cast credits, and crew credits for a single show/movie are
//   inserted in 3 UNNEST queries instead of N sequential INSERT queries.
//   This reduces Neon round-trips from 3000+ to ~30 for 50 records.
//
// NO TMDB PERSON API CALLS — enrichment is done via POST /api/enrich/people.

import { CREW_JOBS, COUNTRY_MAP, castRole, SyncStats } from "./constants";

export async function processPeopleCredits(
  client: import("pg").PoolClient,
  mediaTmdbId: number,
  crew: any[],
  cast: any[],
  mediaType: "movie" | "show",
  stats: SyncStats
) {
  const allPeople = [...crew, ...cast];
  if (allPeople.length === 0) return;

  // Deduplicate by tmdb id, sort ascending to prevent deadlocks
  const uniquePeopleMap = new Map(allPeople.map(p => [p.id, p]));
  const uniquePeople = Array.from(uniquePeopleMap.values()).sort((a, b) => a.id - b.id);

  // ── Bulk upsert people rows (one UNNEST query) ────────────────────────────
  const pIds = uniquePeople.map(p => p.id);
  const pNames = uniquePeople.map(p => p.name ?? null);
  const pProfiles = uniquePeople.map(p => p.profile_path ?? null);
  const pDepts = uniquePeople.map(p => p.known_for_department ?? null);
  const pPops = uniquePeople.map(p => p.popularity ?? 0);

  const pResult = await client.query(
    `INSERT INTO people (tmdb_id, name, profile_path, known_for_department, popularity)
     SELECT * FROM UNNEST($1::int[], $2::text[], $3::text[], $4::text[], $5::decimal[])
     ON CONFLICT (tmdb_id) DO UPDATE SET
       name                 = EXCLUDED.name,
       profile_path         = COALESCE(EXCLUDED.profile_path, people.profile_path),
       known_for_department = COALESCE(EXCLUDED.known_for_department, people.known_for_department),
       popularity           = CASE WHEN EXCLUDED.popularity > 0 THEN EXCLUDED.popularity ELSE people.popularity END
     WHERE (EXCLUDED.popularity > 0 AND people.popularity IS DISTINCT FROM EXCLUDED.popularity)
        OR (people.profile_path IS NULL AND EXCLUDED.profile_path IS NOT NULL)
     RETURNING (xmax = 0) AS is_inserted`,
    [pIds, pNames, pProfiles, pDepts, pPops]
  );

  for (const row of pResult.rows) {
    if (row.is_inserted) {
      stats.new_people_added++;
    } else {
      stats.people_updated++;
    }
  }

  // ── Bulk upsert CREW credits (one UNNEST query) ───────────────────────────
  if (crew.length > 0) {
    // Deduplicate by (id, job) — same person may appear twice with the same job
    // (e.g., in both created_by and aggregate_credits). ON CONFLICT DO UPDATE
    // cannot target the same row twice in one UNNEST statement.
    const crewMap = new Map<string, any>();
    for (const m of crew) {
      const key = `${m.id}:${m.job}`;
      const prev = crewMap.get(key);
      if (!prev || (m.episode_count ?? 0) > (prev.episode_count ?? 0)) {
        crewMap.set(key, m);
      }
    }
    const sortedCrew = Array.from(crewMap.values()).sort((a, b) => a.id - b.id);

    if (mediaType === "movie") {
      const cIds = sortedCrew.map(m => m.id);
      const cJobs = sortedCrew.map(m => m.job);
      const r = await client.query(
        `INSERT INTO movie_crew (movie_tmdb_id, person_tmdb_id, job)
         SELECT $1, * FROM UNNEST($2::int[], $3::text[])
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [mediaTmdbId, cIds, cJobs]
      );
      stats.new_crew_added += r.rowCount ?? 0;
    } else {
      const cIds = sortedCrew.map(m => m.id);
      const cJobs = sortedCrew.map(m => m.job);
      const cEps = sortedCrew.map(m => m.episode_count ?? null);
      const r = await client.query(
        `INSERT INTO show_crew (show_tmdb_id, person_tmdb_id, job, episode_count)
         SELECT $1, * FROM UNNEST($2::int[], $3::text[], $4::int[])
         ON CONFLICT (show_tmdb_id, person_tmdb_id, job)
         DO UPDATE SET episode_count = EXCLUDED.episode_count
         RETURNING id`,
        [mediaTmdbId, cIds, cJobs, cEps]
      );
      stats.new_crew_added += r.rowCount ?? 0;
    }
  }

  // ── Bulk upsert CAST credits (one UNNEST query) ───────────────────────────
  if (cast.length > 0) {
    // Deduplicate by (id, character) — same person may play the same character
    // in multiple entries (e.g., aggregate_credits duplicates). ON CONFLICT DO UPDATE
    // cannot target the same row twice in one UNNEST statement.
    const castMap = new Map<string, any>();
    for (const m of cast) {
      const key = `${m.id}:${m.character ?? ''}`;
      const prev = castMap.get(key);
      if (!prev || (m.episode_count ?? 0) > (prev.episode_count ?? 0)) {
        castMap.set(key, m);
      }
    }
    const sortedCast = Array.from(castMap.values()).sort((a, b) => a.id - b.id);

    if (mediaType === "movie") {
      const mIds = sortedCast.map(m => m.id);
      const mChars = sortedCast.map(m => m.character ?? null);
      const mOrders = sortedCast.map(m => m.order ?? 99);
      const mRoles = sortedCast.map(m => castRole(m.order ?? 99));
      const r = await client.query(
        `INSERT INTO movie_cast (movie_tmdb_id, person_tmdb_id, character, cast_order, role)
         SELECT $1, * FROM UNNEST($2::int[], $3::text[], $4::int[], $5::text[])
         ON CONFLICT (movie_tmdb_id, person_tmdb_id, character) DO NOTHING
         RETURNING id`,
        [mediaTmdbId, mIds, mChars, mOrders, mRoles]
      );
      stats.new_cast_added += r.rowCount ?? 0;
    } else {
      const sIds = sortedCast.map(m => m.id);
      const sChars = sortedCast.map(m => m.character ?? null);
      const sEps = sortedCast.map(m => m.episode_count ?? null);
      const r = await client.query(
        `INSERT INTO show_cast (show_tmdb_id, person_tmdb_id, character, episode_count)
         SELECT $1, * FROM UNNEST($2::int[], $3::text[], $4::int[])
         ON CONFLICT (show_tmdb_id, person_tmdb_id, character)
         DO UPDATE SET episode_count = EXCLUDED.episode_count
         RETURNING id`,
        [mediaTmdbId, sIds, sChars, sEps]
      );
      stats.new_cast_added += r.rowCount ?? 0;
    }
  }
}
