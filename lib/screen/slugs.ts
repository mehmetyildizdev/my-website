import { cachedQuery, loadQuery } from './db';

/**
 * ARCHITECTURE DIRECTIVE (DO NOT ALTER):
 * 1. Cloudflare D1 (via search worker) is the PRIMARY data source for all slug details.
 *    Neon DB MUST NOT be queried if the item exists in Cloudflare D1.
 * 2. Neon DB is queried ONLY as an emergency fallback for brand-new items logged via MemoStream
 *    during the day that have not yet been synced to Cloudflare D1 by daily GitHub Actions.
 */
async function fetchFromD1(type: 'movie' | 'show' | 'person', tmdbId: number): Promise<any | null> {
  const workerUrl = process.env.NEXT_PUBLIC_SEARCH_WORKER_URL || 'http://localhost:8787';
  try {
    const res = await fetch(`${workerUrl}/slug?type=${type}&id=${tmdbId}`, {
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 604800, tags: ['slug-details', `${type}-${tmdbId}`] },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.result) return null;
    const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    return parsed;
  } catch (error) {
    console.warn(`[slugs] Cloudflare D1 lookup failed for ${type}:${tmdbId}, proceeding to Neon fallback:`, error);
    return null;
  }
}

export async function fetchMovieDetail(tmdbId: number) {
  // 1. Primary lookup: Cloudflare D1 Worker (Keeps Neon DB completely asleep)
  const d1Item = await fetchFromD1('movie', tmdbId);
  if (d1Item) return d1Item;

  // 2. Emergency Fallback: Neon DB live relational query (Only for newly watched items not yet in D1)
  try {
    const fallbackRes = await cachedQuery(loadQuery('slugs/movie_detail_fallback.sql'), [tmdbId], ['slug-details', `movie-${tmdbId}`]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchMovieDetail] Live Neon DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}

export async function fetchShowDetail(tmdbId: number) {
  // 1. Primary lookup: Cloudflare D1 Worker (Keeps Neon DB completely asleep)
  const d1Item = await fetchFromD1('show', tmdbId);
  if (d1Item) return d1Item;

  // 2. Emergency Fallback: Neon DB live relational query (Only for newly watched items not yet in D1)
  try {
    const fallbackRes = await cachedQuery(loadQuery('slugs/show_detail_fallback.sql'), [tmdbId], ['slug-details', `show-${tmdbId}`]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchShowDetail] Live Neon DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}

export async function fetchPersonDetail(tmdbId: number) {
  // 1. Primary lookup: Cloudflare D1 Worker (Keeps Neon DB completely asleep)
  const d1Item = await fetchFromD1('person', tmdbId);
  if (d1Item) return d1Item;

  // 2. Emergency Fallback: Neon DB live relational query (Only for newly watched items not yet in D1)
  try {
    const fallbackRes = await cachedQuery(loadQuery('slugs/person_detail_fallback.sql'), [tmdbId], ['slug-details', `person-${tmdbId}`]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchPersonDetail] Live Neon DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}
