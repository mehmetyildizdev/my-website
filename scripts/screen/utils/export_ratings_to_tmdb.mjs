/*
// Run this script from the project root:
//   node scripts/screen/utils/export_ratings_to_tmdb.mjs
*/
import pg from 'pg';
import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.TMDB_API_KEY;
const connectionString = process.env.NEON_DATABASE_URL;

if (!apiKey) {
  console.error('❌ Error: TMDB_API_KEY is missing in your .env.local file.');
  process.exit(1);
}

if (!connectionString) {
  console.error('❌ Error: NEON_DATABASE_URL is missing in your .env.local file.');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Helper for sleep/throttling
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for API calls
async function callTMDB(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.status_message || `HTTP ${response.status}`);
  }

  return data;
}

async function getSessionId() {
  if (process.env.TMDB_SESSION_ID) {
    console.log('✅ Found TMDB_SESSION_ID in environment variables.');
    return process.env.TMDB_SESSION_ID;
  }

  console.log('🔑 Authentication required to rate items on your TMDB profile.');
  console.log('Step 1: Requesting a TMDB request token...');

  const tokenRes = await callTMDB(`https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`);

  const requestToken = tokenRes.request_token;
  const authUrl = `https://www.themoviedb.org/authenticate/${requestToken}`;

  console.log('\n=============================================================');
  console.log('👉 Please open the following URL in your browser and authorize it:');
  console.log(`   \x1b[36m${authUrl}\x1b[0m`);
  console.log('=============================================================\n');

  await question('Once you have approved the request in your browser, press [ENTER] to continue...');

  console.log('\nStep 2: Creating a TMDB session...');
  try {
    const sessionRes = await callTMDB(`https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}`, 'POST', {
      request_token: requestToken,
    });

    const sessionId = sessionRes.session_id;
    console.log(`✅ Session created successfully! Session ID: ${sessionId}`);
    console.log('💡 TIP: You can add this to your .env.local as TMDB_SESSION_ID=... to skip authorization next time.\n');
    return sessionId;
  } catch (err) {
    console.error('❌ Failed to authenticate:', err.message);
    process.exit(1);
  }
}

async function fetchAllTMDBRatedItems(accountId, sessionId, type) {
  let items = [];
  let page = 1;
  let totalPages = 1;

  console.log(`📥 Fetching rated ${type} from TMDB...`);

  do {
    const url = `https://api.themoviedb.org/3/account/${accountId}/rated/${type}?api_key=${apiKey}&session_id=${sessionId}&page=${page}`;
    const data = await callTMDB(url);
    if (data.results && data.results.length > 0) {
      items = items.concat(data.results);
    }
    totalPages = data.total_pages || 1;
    page++;
    await sleep(50);
  } while (page <= totalPages);

  return items;
}

async function main() {
  const sessionId = await getSessionId();

  console.log('👤 Fetching TMDB account details...');
  const accountRes = await callTMDB(`https://api.themoviedb.org/3/account?api_key=${apiKey}&session_id=${sessionId}`);
  const accountId = accountRes.id;
  console.log(`✅ Logged in as: ${accountRes.username} (Account ID: ${accountId})\n`);

  console.log('🔄 Fetching all existing ratings from TMDB profile...');
  const tmdbMoviesList = await fetchAllTMDBRatedItems(accountId, sessionId, 'movies');
  const tmdbShowsList = await fetchAllTMDBRatedItems(accountId, sessionId, 'tv');
  const tmdbEpisodesList = await fetchAllTMDBRatedItems(accountId, sessionId, 'tv/episodes');

  // Build lookup maps
  const tmdbMoviesMap = new Map(tmdbMoviesList.map((m) => [m.id, m.rating]));
  const tmdbShowsMap = new Map(tmdbShowsList.map((s) => [s.id, s.rating]));
  const tmdbEpisodesMap = new Map(tmdbEpisodesList.map((e) => [`${e.show_id}-${e.season_number}-${e.episode_number}`, e.rating]));

  console.log(`\n✅ Existing TMDB Ratings Count:`);
  console.log(`   - Movies: ${tmdbMoviesMap.size}`);
  console.log(`   - TV Shows: ${tmdbShowsMap.size}`);
  console.log(`   - TV Episodes: ${tmdbEpisodesMap.size}\n`);

  console.log('🔌 Connecting to local database...');
  const pool = new pg.Pool({ connectionString });

  try {
    // 1. Fetch rated movies
    const moviesRes = await pool.query(`SELECT tmdb_id, title, my_rating FROM movies WHERE my_rating IS NOT NULL`);
    const ratedMovies = moviesRes.rows;

    // 2. Fetch rated shows
    const showsRes = await pool.query(`SELECT tmdb_id, name as title, my_rating FROM shows WHERE my_rating IS NOT NULL`);
    const ratedShows = showsRes.rows;

    // 3. Fetch rated episodes
    const episodesRes = await pool.query(
      `SELECT 
         wh.my_rating, 
         e.show_tmdb_id, 
         e.season_number, 
         e.episode_number,
         e.title
       FROM watch_history wh
       JOIN episodes e ON wh.tmdb_id = e.tmdb_id
       WHERE wh.media_type = 'episode' AND wh.my_rating IS NOT NULL`,
    );
    const ratedEpisodes = episodesRes.rows;

    console.log(`📊 Local Database Ratings Count:`);
    console.log(`   - Movies: ${ratedMovies.length}`);
    console.log(`   - TV Shows: ${ratedShows.length}`);
    console.log(`   - TV Episodes: ${ratedEpisodes.length}\n`);

    // Filter to only include missing or modified ratings
    const moviesToRate = ratedMovies.filter((item) => {
      const tmdbRating = tmdbMoviesMap.get(item.tmdb_id);
      return tmdbRating === undefined || Number(tmdbRating) !== Number(item.my_rating);
    });

    const showsToRate = ratedShows.filter((item) => {
      const tmdbRating = tmdbShowsMap.get(item.tmdb_id);
      return tmdbRating === undefined || Number(tmdbRating) !== Number(item.my_rating);
    });

    const episodesToRate = ratedEpisodes.filter((item) => {
      const key = `${item.show_tmdb_id}-${item.season_number}-${item.episode_number}`;
      const tmdbRating = tmdbEpisodesMap.get(key);
      return tmdbRating === undefined || Number(tmdbRating) !== Number(item.my_rating);
    });

    const totalToRate = moviesToRate.length + showsToRate.length + episodesToRate.length;

    if (totalToRate === 0) {
      console.log('✨ All your ratings are already synchronized! Nothing to export.');
      process.exit(0);
    }

    console.log(`🆕 Ratings to synchronize (New or Modified):`);
    console.log(`   - Movies: ${moviesToRate.length}`);
    console.log(`   - TV Shows: ${showsToRate.length}`);
    console.log(`   - TV Episodes: ${episodesToRate.length}`);
    console.log(`   - Total items: ${totalToRate}\n`);

    const proceed = await question(`Do you want to proceed and export these ${totalToRate} ratings to TMDB? (y/n): `);
    if (proceed.toLowerCase() !== 'y') {
      console.log('Operation cancelled.');
      process.exit(0);
    }

    console.log('\n🚀 Starting TMDB Export...');
    console.log("ℹ️ Throttling requests to 20 per second (50ms intervals) to stay safely within TMDB's rate limits.\n");

    let processedCount = 0;

    // Rate Movies
    for (let i = 0; i < moviesToRate.length; i++) {
      const item = moviesToRate[i];
      processedCount++;
      const percent = ((processedCount / totalToRate) * 100).toFixed(1);
      try {
        console.log(
          `[${processedCount}/${totalToRate} - ${percent}%] Rating Movie: "${item.title}" (ID: ${item.tmdb_id}) → ${item.my_rating}/10`,
        );
        await callTMDB(`https://api.themoviedb.org/3/movie/${item.tmdb_id}/rating?api_key=${apiKey}&session_id=${sessionId}`, 'POST', {
          value: Number(item.my_rating),
        });
        await sleep(50);
      } catch (err) {
        console.error(`❌ Failed to rate movie "${item.title}":`, err.message);
      }
    }

    // Rate Shows
    for (let i = 0; i < showsToRate.length; i++) {
      const item = showsToRate[i];
      processedCount++;
      const percent = ((processedCount / totalToRate) * 100).toFixed(1);
      try {
        console.log(
          `[${processedCount}/${totalToRate} - ${percent}%] Rating Show: "${item.title}" (ID: ${item.tmdb_id}) → ${item.my_rating}/10`,
        );
        await callTMDB(`https://api.themoviedb.org/3/tv/${item.tmdb_id}/rating?api_key=${apiKey}&session_id=${sessionId}`, 'POST', {
          value: Number(item.my_rating),
        });
        await sleep(50);
      } catch (err) {
        console.error(`❌ Failed to rate show "${item.title}":`, err.message);
      }
    }

    // Rate Episodes
    for (let i = 0; i < episodesToRate.length; i++) {
      const item = episodesToRate[i];
      processedCount++;
      const percent = ((processedCount / totalToRate) * 100).toFixed(1);
      const epName = item.title || `S${item.season_number}E${item.episode_number}`;
      try {
        console.log(
          `[${processedCount}/${totalToRate} - ${percent}%] Rating Episode: "${epName}" (Show ID: ${item.show_tmdb_id}, S${item.season_number}E${item.episode_number}) → ${item.my_rating}/10`,
        );
        await callTMDB(
          `https://api.themoviedb.org/3/tv/${item.show_tmdb_id}/season/${item.season_number}/episode/${item.episode_number}/rating?api_key=${apiKey}&session_id=${sessionId}`,
          'POST',
          { value: Number(item.my_rating) },
        );
        await sleep(50);
      } catch (err) {
        console.error(`❌ Failed to rate episode "${epName}":`, err.message);
      }
    }

    console.log('\n🎉 Export finished successfully!');
  } catch (err) {
    console.error('❌ Database error:', err.message);
  } finally {
    await pool.end();
    rl.close();
  }
}

main().catch((err) => {
  console.error('❌ Unhandled error:', err);
  rl.close();
});
