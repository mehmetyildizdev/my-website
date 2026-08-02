import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { query } from '../../../lib/screen/db';

async function checkMissingHistory() {
  console.log('──────────────────────────────────────────────────────────');
  console.log('  Check Missing Movies, Shows & Rating Mismatches Script');
  console.log('──────────────────────────────────────────────────────────');

  // 1. Verify Active DB Connection Target
  try {
    const dbCheck = await query('SELECT current_database(), current_user, inet_server_port(), inet_server_addr()');
    const info = dbCheck.rows[0] || {};
    console.log(
      `  → Database Target: ${info.current_user}@${info.inet_server_addr || 'localhost'}:${info.inet_server_port}/${info.current_database}\n`,
    );
  } catch (err: any) {
    console.error(`  ✗ DB Connection Error: ${err.message}`);
    process.exit(1);
  }

  // 2. Check Missing Movies (watch_history movie scrobbles not in `movies` table)
  const missingMoviesRes = await query(`
    WITH extracted_movies AS (
      SELECT 
        wh.id AS watch_history_id,
        wh.watched_at,
        wh.my_rating,
        COALESCE(
          CASE 
            WHEN wh.media_key LIKE 'movie:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
            THEN SPLIT_PART(wh.media_key, ':', 2)::integer
            ELSE NULL
          END,
          wh.tmdb_id
        ) AS movie_tmdb_id
      FROM watch_history wh
      WHERE (wh.media_type = 'movie' OR wh.media_key LIKE 'movie:%')
    )
    SELECT 
      em.movie_tmdb_id AS tmdb_id,
      MIN(em.watched_at) AS earliest_watched,
      COUNT(em.watch_history_id) AS total_scrobbles,
      MAX(em.my_rating) AS history_rating
    FROM extracted_movies em
    LEFT JOIN movies m ON em.movie_tmdb_id = m.tmdb_id
    WHERE em.movie_tmdb_id IS NOT NULL
      AND m.tmdb_id IS NULL
    GROUP BY em.movie_tmdb_id
    ORDER BY earliest_watched DESC
  `);
  const missingMovies = missingMoviesRes.rows;
  const missingMoviesWithRating = missingMovies.filter((m) => m.history_rating != null);

  console.log(`🎬 Missing Movies Count in 'movies' Table: ${missingMovies.length} (With Rating: ${missingMoviesWithRating.length})`);
  if (missingMovies.length > 0) {
    console.log('   List of Missing Movie TMDB IDs:');
    missingMovies.forEach((m, idx) => {
      const ratingInfo = m.history_rating != null ? ` | Rating: ⭐ ${m.history_rating}/10` : ' | Rating: (None)';
      console.log(
        `   [${idx + 1}/${missingMovies.length}] TMDB Movie ID: ${m.tmdb_id} | Scrobbles: ${m.total_scrobbles}${ratingInfo} | Earliest Watched: ${m.earliest_watched}`,
      );
    });
  }
  console.log('');

  // 3. Check Missing Shows (extracting SHOW_TMDB_ID from media_key `episode:SHOW_TMDB_ID:SEASON:EPISODE`)
  const missingShowsRes = await query(`
    WITH extracted_shows AS (
      SELECT 
        wh.id AS watch_history_id,
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
    SELECT 
      es.show_tmdb_id,
      MIN(es.watched_at) AS earliest_watched,
      COUNT(es.watch_history_id) AS total_scrobbles,
      MAX(es.my_rating) AS history_rating
    FROM extracted_shows es
    LEFT JOIN shows s ON es.show_tmdb_id = s.tmdb_id
    WHERE es.show_tmdb_id IS NOT NULL
      AND s.tmdb_id IS NULL
    GROUP BY es.show_tmdb_id
    ORDER BY earliest_watched DESC
  `);
  const missingShows = missingShowsRes.rows;
  const missingShowsWithRating = missingShows.filter((s) => s.history_rating != null);

  console.log(`📺 Missing Shows Count in 'shows' Table: ${missingShows.length} (With Rating: ${missingShowsWithRating.length})`);
  if (missingShows.length > 0) {
    console.log('   List of Missing Show TMDB IDs:');
    missingShows.forEach((s, idx) => {
      const ratingInfo = s.history_rating != null ? ` | Rating: ⭐ ${s.history_rating}/10` : ' | Rating: (None)';
      console.log(
        `   [${idx + 1}/${missingShows.length}] TMDB Show ID: ${s.show_tmdb_id} | Scrobbles: ${s.total_scrobbles}${ratingInfo} | Earliest Watched: ${s.earliest_watched}`,
      );
    });
  }
  console.log('');

  // 4. Check Personal Ratings for Missing Entities & Rating Mismatches for Existing Entities
  console.log('── Personal Rating Status Report ──────────────────────────');

  if (missingMoviesWithRating.length > 0) {
    console.log(`⭐ Missing Movies carrying Personal Ratings in watch_history (${missingMoviesWithRating.length}):`);
    missingMoviesWithRating.forEach((m, idx) => {
      console.log(
        `   [${idx + 1}/${missingMoviesWithRating.length}] TMDB Movie ID: ${m.tmdb_id} | Personal Rating: ⭐ ${m.history_rating}/10 (Will be assigned when enriched)`,
      );
    });
  } else {
    console.log(`⭐ Missing Movies with Personal Ratings: 0`);
  }

  if (missingShowsWithRating.length > 0) {
    console.log(`⭐ Missing Shows carrying Personal Ratings in watch_history (${missingShowsWithRating.length}):`);
    missingShowsWithRating.forEach((s, idx) => {
      console.log(
        `   [${idx + 1}/${missingShowsWithRating.length}] TMDB Show ID: ${s.show_tmdb_id} | Personal Rating: ⭐ ${s.history_rating}/10 (Will be assigned when enriched)`,
      );
    });
  } else {
    console.log(`⭐ Missing Shows with Personal Ratings: 0`);
  }

  const ratingMovieMismatch = await query(`
    SELECT 
      COALESCE(
        CASE WHEN wh.media_key LIKE 'movie:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
             THEN SPLIT_PART(wh.media_key, ':', 2)::integer
             ELSE NULL
        END,
        wh.tmdb_id
      ) AS movie_tmdb_id,
      m.title,
      wh.my_rating AS history_rating,
      m.my_rating AS movie_rating
    FROM watch_history wh
    JOIN movies m ON m.tmdb_id = COALESCE(
      CASE WHEN wh.media_key LIKE 'movie:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
           THEN SPLIT_PART(wh.media_key, ':', 2)::integer
           ELSE NULL
      END,
      wh.tmdb_id
    )
    WHERE (wh.media_type = 'movie' OR wh.media_key LIKE 'movie:%')
      AND wh.my_rating IS NOT NULL
      AND m.my_rating IS DISTINCT FROM wh.my_rating
  `);
  console.log(`⭐ Movie Rating Mismatches (Existing Entities): ${ratingMovieMismatch.rows.length}`);
  if (ratingMovieMismatch.rows.length > 0) {
    ratingMovieMismatch.rows.forEach((r, idx) => {
      console.log(
        `   [${idx + 1}/${ratingMovieMismatch.rows.length}] TMDB Movie ID: ${r.movie_tmdb_id} | "${r.title}" | watch_history rating: ${r.history_rating} | movies rating: ${r.movie_rating}`,
      );
    });
  }

  const ratingShowMismatch = await query(`
    SELECT 
      COALESCE(
        CASE WHEN wh.media_key LIKE 'episode:%:%:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
             THEN SPLIT_PART(wh.media_key, ':', 2)::integer
             WHEN wh.media_key LIKE 'show:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
             THEN SPLIT_PART(wh.media_key, ':', 2)::integer
             WHEN wh.media_type = 'show'
             THEN wh.tmdb_id
             ELSE ep.show_tmdb_id
        END
      ) AS show_tmdb_id,
      s.name,
      wh.my_rating AS history_rating,
      s.my_rating AS show_rating
    FROM watch_history wh
    LEFT JOIN episodes ep ON wh.media_type = 'episode' AND wh.tmdb_id = ep.tmdb_id
    JOIN shows s ON s.tmdb_id = COALESCE(
      CASE WHEN wh.media_key LIKE 'episode:%:%:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
           THEN SPLIT_PART(wh.media_key, ':', 2)::integer
           WHEN wh.media_key LIKE 'show:%' AND SPLIT_PART(wh.media_key, ':', 2) ~ '^[0-9]+$'
           THEN SPLIT_PART(wh.media_key, ':', 2)::integer
           WHEN wh.media_type = 'show'
           THEN wh.tmdb_id
           ELSE ep.show_tmdb_id
      END
    )
    WHERE wh.my_rating IS NOT NULL
      AND s.my_rating IS DISTINCT FROM wh.my_rating
  `);
  console.log(`⭐ Show Rating Mismatches (Existing Entities): ${ratingShowMismatch.rows.length}`);
  if (ratingShowMismatch.rows.length > 0) {
    ratingShowMismatch.rows.forEach((r, idx) => {
      console.log(
        `   [${idx + 1}/${ratingShowMismatch.rows.length}] TMDB Show ID: ${r.show_tmdb_id} | "${r.name}" | watch_history rating: ${r.history_rating} | shows rating: ${r.show_rating}`,
      );
    });
  }

  console.log('──────────────────────────────────────────────────────────');
  console.log('  Check Complete');
  console.log('──────────────────────────────────────────────────────────');
  process.exit(0);
}

checkMissingHistory().catch((err) => {
  console.error('Fatal check script error:', err);
  process.exit(1);
});
