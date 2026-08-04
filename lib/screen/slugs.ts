import { cachedQuery, loadQuery } from './db';

/**
 * ARCHITECTURE DIRECTIVE (STRICT NEON ISOLATION):
 * 1. Cloudflare D1 (via search worker) is the SOLE primary data source for all slug details.
 * 2. Neon DB is queried STRICTLY AND ONLY when Cloudflare D1 explicitly confirms the item is MISSING (404 / result === null).
 * 3. On network errors, worker errors, or missing env vars, Neon DB is NEVER queried.
 */
type D1LookupResult =
  | { status: 'found'; data: any }
  | { status: 'missing' } // Explicitly missing in D1 (new scrobble not yet synced)
  | { status: 'error' }; // Worker/network error — NEVER trigger Neon fallback

async function fetchFromD1(type: 'movie' | 'show' | 'person', tmdbId: number): Promise<D1LookupResult> {
  const workerUrl = process.env.NEXT_PUBLIC_SEARCH_WORKER_URL;
  if (!workerUrl) {
    console.error('[slugs] NEXT_PUBLIC_SEARCH_WORKER_URL is missing! Aborting D1 lookup to protect Neon DB.');
    return { status: 'error' };
  }

  try {
    const res = await fetch(`${workerUrl}/slug?type=${type}&id=${tmdbId}`, {
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 604800, tags: ['slug-details', `${type}-${tmdbId}`] },
    });

    if (res.status === 404) {
      return { status: 'missing' };
    }

    if (!res.ok) {
      console.warn(`[slugs] Cloudflare D1 HTTP ${res.status} error for ${type}:${tmdbId}`);
      return { status: 'error' };
    }

    const data = await res.json();
    if (!data || data.result === null) {
      return { status: 'missing' };
    }

    const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    return { status: 'found', data: parsed };
  } catch (error) {
    console.error(`[slugs] Cloudflare D1 fetch error for ${type}:${tmdbId}:`, error);
    return { status: 'error' };
  }
}

export async function fetchMovieDetail(tmdbId: number) {
  const d1 = await fetchFromD1('movie', tmdbId);

  if (d1.status === 'found') return d1.data;
  if (d1.status === 'error') return null; // Protect Neon DB on worker/network errors

  // ONLY reached if d1.status === 'missing' (brand-new watch not yet synced to D1)
  try {
    const fallbackRes = await cachedQuery(loadQuery('slugs/movie_detail_fallback.sql'), [tmdbId], ['slug-details', `movie-${tmdbId}`]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchMovieDetail] Live Neon DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}

export async function fetchShowDetail(tmdbId: number) {
  const d1 = await fetchFromD1('show', tmdbId);

  if (d1.status === 'found') return d1.data;
  if (d1.status === 'error') return null; // Protect Neon DB on worker/network errors

  // ONLY reached if d1.status === 'missing' (brand-new watch not yet synced to D1)
  try {
    const fallbackRes = await cachedQuery(loadQuery('slugs/show_detail_fallback.sql'), [tmdbId], ['slug-details', `show-${tmdbId}`]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchShowDetail] Live Neon DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}

export async function fetchPersonDetail(tmdbId: number) {
  const d1 = await fetchFromD1('person', tmdbId);

  if (d1.status === 'found') return d1.data;
  if (d1.status === 'error') return null; // Protect Neon DB on worker/network errors

  // ONLY reached if d1.status === 'missing' (brand-new watch not yet synced to D1)
  try {
    const fallbackRes = await cachedQuery(loadQuery('slugs/person_detail_fallback.sql'), [tmdbId], ['slug-details', `person-${tmdbId}`]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchPersonDetail] Live Neon DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}
