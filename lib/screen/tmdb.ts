// lib/tmdb.ts

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_TIMEOUT_MS = 30_000; // 30 seconds per call (fetch + body)

export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!token) throw new Error('TMDB_API_READ_ACCESS_TOKEN is missing');

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TMDB_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.statusText} (${endpoint})`);
    }

    // Race JSON parsing too — large aggregate_credits bodies can stream slowly
    // and the AbortController signal may not interrupt body reading on all runtimes.
    return await Promise.race([
      response.json(),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`TMDB body timeout (${endpoint})`)), TMDB_TIMEOUT_MS)),
    ]);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`TMDB timeout after ${TMDB_TIMEOUT_MS / 1000}s (${endpoint})`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function getTMDBMovie(id: number): Promise<TMDBMovieDetail> {
  return fetchTMDB(`/movie/${id}`, { append_to_response: 'credits,external_ids' });
}

export async function getTMDBShow(id: number): Promise<TMDBShowDetail> {
  return fetchTMDB(`/tv/${id}`, { append_to_response: 'credits,external_ids' });
}

export async function getTMDBEpisode(showId: number, seasonNumber: number, episodeNumber: number): Promise<TMDBEpisodeDetail> {
  return fetchTMDB(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`);
}

export async function getTMDBPerson(id: number): Promise<any> {
  return fetchTMDB(`/person/${id}`);
}
