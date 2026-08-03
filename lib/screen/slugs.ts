import { query, loadQuery } from './db';

export async function fetchMovieDetail(tmdbId: number) {
  // 1. Primary lookup from slug_details
  try {
    const res = await query(loadQuery('slugs/movie_detail.sql'), [tmdbId]);
    if (res.rows[0]) return res.rows[0];
  } catch (error) {
    console.warn(`[fetchMovieDetail] slug_details query failed for tmdbId ${tmdbId}:`, error);
  }

  // 2. Fallback query from Neon DB tables
  try {
    const fallbackRes = await query(loadQuery('slugs/movie_detail_fallback.sql'), [tmdbId]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchMovieDetail] live DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}

export async function fetchShowDetail(tmdbId: number) {
  // 1. Primary lookup from slug_details
  try {
    const res = await query(loadQuery('slugs/show_detail.sql'), [tmdbId]);
    if (res.rows[0]) return res.rows[0];
  } catch (error) {
    console.warn(`[fetchShowDetail] slug_details query failed for tmdbId ${tmdbId}:`, error);
  }

  // 2. Fallback query from Neon DB tables
  try {
    const fallbackRes = await query(loadQuery('slugs/show_detail_fallback.sql'), [tmdbId]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchShowDetail] live DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}

export async function fetchPersonDetail(tmdbId: number) {
  // 1. Primary lookup from slug_details
  try {
    const res = await query(loadQuery('slugs/person_detail.sql'), [tmdbId]);
    if (res.rows[0]) return res.rows[0];
  } catch (error) {
    console.warn(`[fetchPersonDetail] slug_details query failed for tmdbId ${tmdbId}:`, error);
  }

  // 2. Fallback query from Neon DB tables
  try {
    const fallbackRes = await query(loadQuery('slugs/person_detail_fallback.sql'), [tmdbId]);
    if (fallbackRes.rows[0]) return fallbackRes.rows[0];
  } catch (error) {
    console.warn(`[fetchPersonDetail] live DB fallback failed for tmdbId ${tmdbId}:`, error);
  }

  return null;
}
