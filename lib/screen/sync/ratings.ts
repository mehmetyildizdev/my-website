// lib/screen/sync/ratings.ts
// Bulk-syncs Trakt ratings for movies and shows using a single UNNEST update per type.

import { fetchTraktRatings } from "../trakt";
import { query } from "../db";

export async function syncTraktRatings() {
  console.log("Syncing Trakt ratings (Bulk Update)...");
  const types: ("movies" | "shows")[] = ["movies", "shows"];

  for (const type of types) {
    try {
      const ratings = await fetchTraktRatings(type);
      if (ratings.length === 0) continue;

      const tmdbIds: number[] = [];
      const ratingVals: number[] = [];

      for (const r of ratings) {
        const tmdbId = r.movie?.ids.tmdb || r.show?.ids.tmdb;
        if (tmdbId) {
          tmdbIds.push(tmdbId);
          ratingVals.push(r.rating);
        }
      }

      if (tmdbIds.length === 0) continue;

      await query(
        `UPDATE ${type}
         SET trakt_rating = update_data.rating
         FROM (SELECT unnest($1::int[]) as tmdb_id, unnest($2::int[]) as rating) as update_data
         WHERE ${type}.tmdb_id = update_data.tmdb_id`,
        [tmdbIds, ratingVals]
      );

      // Mirror movie ratings onto watch_history so the dashboard card shows them
      if (type === "movies") {
        await query(
          `UPDATE watch_history
           SET rating = update_data.rating
           FROM (SELECT unnest($1::int[]) as tmdb_id, unnest($2::int[]) as rating) as update_data
           WHERE watch_history.tmdb_id = update_data.tmdb_id AND watch_history.media_type = 'movie'`,
          [tmdbIds, ratingVals]
        );
      }

      console.log(`Synced ${tmdbIds.length} ${type} ratings via bulk update.`);
    } catch (error) {
      console.error(`Error syncing ${type} ratings:`, error);
    }
  }
}
