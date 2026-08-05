import { cachedQuery, loadQuery } from './db';

/**
 * ARCHITECTURE DIRECTIVE (STRICT NEON ISOLATION):
 * 1. Cloudflare D1 (via search worker) is the SOLE primary data source for all slug details.
 * 2. D1 derives three states from its existing tables: available, excluded, and pending.
 * 3. Normal slug pages are D1-only. Neon is queried only for an explicitly marked
 *    recent-watch movie/show that is still pending in D1.
 * 4. Person pages never query Neon as a fallback.
 * 5. On excluded states, network errors, worker errors, or missing env vars, Neon DB is NEVER queried.
 */
type D1LookupResult =
  | { status: 'found'; data: any }
  | { status: 'excluded' } // Known search item intentionally omitted from slug_details
  | { status: 'pending' } // Absent from both D1 tables
  | { status: 'error' }; // Worker/network error — NEVER trigger Neon fallback

type DetailFetchOptions = {
  allowRecentWatchFallback?: boolean;
};

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

    if (res.status === 410) {
      return { status: 'excluded' };
    }

    if (res.status === 404) {
      return { status: 'pending' };
    }

    if (!res.ok) {
      console.warn(`[slugs] Cloudflare D1 HTTP ${res.status} error for ${type}:${tmdbId}`);
      return { status: 'error' };
    }

    const data = await res.json();
    if (!data || data.state === 'excluded') {
      return { status: 'excluded' };
    }

    if (data.state === 'pending' || data.result === null) {
      return { status: 'pending' };
    }

    const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
    return { status: 'found', data: parsed };
  } catch (error) {
    console.error(`[slugs] Cloudflare D1 fetch error for ${type}:${tmdbId}:`, error);
    return { status: 'error' };
  }
}

export async function fetchMovieDetail(tmdbId: number, options: DetailFetchOptions = {}) {
  const d1 = await fetchFromD1('movie', tmdbId);

  if (d1.status === 'found') return d1.data;
  if ((d1.status !== 'pending' && d1.status !== 'excluded') || !options.allowRecentWatchFallback) return null;

  // Only a recent-watch movie may use this emergency path while waiting for the daily D1 upload.
  try {
    const fallbackRes = await cachedQuery(
      loadQuery('slugs/movie_detail_fallback.sql'),
      [tmdbId],
      ['slug-fallback', `fallback-movie-${tmdbId}`],
    );
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchMovieDetail] Live Neon DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}

export async function fetchShowDetail(tmdbId: number, options: DetailFetchOptions = {}) {
  const d1 = await fetchFromD1('show', tmdbId);

  if (d1.status === 'found') return d1.data;
  if ((d1.status !== 'pending' && d1.status !== 'excluded') || !options.allowRecentWatchFallback) return null;

  // Only a recent-watch show may use this emergency path while waiting for the daily D1 upload.
  try {
    const fallbackRes = await cachedQuery(
      loadQuery('slugs/show_detail_fallback.sql'),
      [tmdbId],
      ['slug-fallback', `fallback-show-${tmdbId}`],
    );
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchShowDetail] Live Neon DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}

export async function fetchPersonDetail(tmdbId: number) {
  const d1 = await fetchFromD1('person', tmdbId);

  if (d1.status === 'found') return d1.data;
  return null;
}
