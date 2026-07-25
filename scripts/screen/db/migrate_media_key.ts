import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

if (!process.env.NEON_DATABASE_URL) {
  console.error("❌ NEON_DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: process.env.NEON_DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: true },
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting database migration...");
    await client.query("BEGIN");

    // 1. Clean up orphaned watch history records
    console.log("🧹 Cleaning up orphaned watch history records...");
    const cleanEpisodesRes = await client.query(`
      DELETE FROM watch_history wh
      WHERE wh.media_type = 'episode'
        AND NOT EXISTS (SELECT 1 FROM episodes ep WHERE ep.tmdb_id = wh.tmdb_id)
    `);
    console.log(`   ✓ Deleted ${cleanEpisodesRes.rowCount || 0} orphaned episode scrobbles.`);

    const cleanMoviesRes = await client.query(`
      DELETE FROM watch_history wh
      WHERE wh.media_type = 'movie'
        AND NOT EXISTS (SELECT 1 FROM movies m WHERE m.tmdb_id = wh.tmdb_id)
    `);
    console.log(`   ✓ Deleted ${cleanMoviesRes.rowCount || 0} orphaned movie scrobbles.`);

    // 2. Migrate movies
    console.log("🎬 Migrating movies table...");
    await client.query(`ALTER TABLE movies DROP COLUMN IF EXISTS trakt_id CASCADE`);
    await client.query(`ALTER TABLE movies ADD COLUMN IF NOT EXISTS media_key VARCHAR(255)`);
    await client.query(`UPDATE movies SET media_key = 'movie:' || tmdb_id WHERE media_key IS NULL`);
    await client.query(`ALTER TABLE movies ALTER COLUMN media_key SET NOT NULL`);
    await client.query(`ALTER TABLE movies ADD CONSTRAINT movies_media_key_key UNIQUE (media_key)`);
    console.log("   ✓ Movies migrated successfully.");

    // 3. Migrate shows
    console.log("📺 Migrating shows table...");
    await client.query(`ALTER TABLE shows DROP COLUMN IF EXISTS trakt_id CASCADE`);
    await client.query(`ALTER TABLE shows ADD COLUMN IF NOT EXISTS media_key VARCHAR(255)`);
    await client.query(`UPDATE shows SET media_key = 'show:' || tmdb_id WHERE media_key IS NULL`);
    await client.query(`ALTER TABLE shows ALTER COLUMN media_key SET NOT NULL`);
    await client.query(`ALTER TABLE shows ADD CONSTRAINT shows_media_key_key UNIQUE (media_key)`);
    console.log("   ✓ Shows migrated successfully.");

    // 4. Migrate seasons
    console.log("🗓️ Migrating seasons table...");
    await client.query(`ALTER TABLE seasons ADD COLUMN IF NOT EXISTS media_key VARCHAR(255)`);
    await client.query(`UPDATE seasons SET media_key = 'season:' || show_tmdb_id || ':' || season_number WHERE media_key IS NULL`);
    await client.query(`ALTER TABLE seasons ALTER COLUMN media_key SET NOT NULL`);
    await client.query(`ALTER TABLE seasons ADD CONSTRAINT seasons_media_key_key UNIQUE (media_key)`);
    console.log("   ✓ Seasons migrated successfully.");

    // 5. Migrate episodes
    console.log("🎞️ Migrating episodes table...");
    await client.query(`ALTER TABLE episodes DROP COLUMN IF EXISTS trakt_id CASCADE`);
    await client.query(`ALTER TABLE episodes ADD COLUMN IF NOT EXISTS media_key VARCHAR(255)`);
    await client.query(`UPDATE episodes SET media_key = 'episode:' || show_tmdb_id || ':' || season_number || ':' || episode_number WHERE media_key IS NULL`);
    await client.query(`ALTER TABLE episodes ALTER COLUMN media_key SET NOT NULL`);
    await client.query(`ALTER TABLE episodes ADD CONSTRAINT episodes_media_key_key UNIQUE (media_key)`);
    console.log("   ✓ Episodes migrated successfully.");

    // 6. Migrate watch_history
    console.log("🕰️ Migrating watch_history table...");
    await client.query(`ALTER TABLE watch_history DROP COLUMN IF EXISTS trakt_id CASCADE`);
    await client.query(`ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS media_key VARCHAR(255)`);
    
    // Populate watch_history.media_key for movies
    await client.query(`
      UPDATE watch_history wh
      SET media_key = 'movie:' || wh.tmdb_id
      WHERE wh.media_type = 'movie' AND wh.media_key IS NULL
    `);

    // Populate watch_history.media_key for episodes
    await client.query(`
      UPDATE watch_history wh
      SET media_key = 'episode:' || ep.show_tmdb_id || ':' || ep.season_number || ':' || ep.episode_number
      FROM episodes ep
      WHERE wh.media_type = 'episode' AND wh.tmdb_id = ep.tmdb_id AND wh.media_key IS NULL
    `);

    await client.query(`ALTER TABLE watch_history ALTER COLUMN media_key SET NOT NULL`);
    await client.query(`ALTER TABLE watch_history ADD CONSTRAINT watch_history_media_key_key UNIQUE (media_key)`);
    console.log("   ✓ Watch history migrated successfully.");

    // 7. Migrate people (drop trakt_id only)
    console.log("👥 Migrating people table...");
    await client.query(`ALTER TABLE people DROP COLUMN IF EXISTS trakt_id CASCADE`);
    console.log("   ✓ People table migrated successfully.");

    // 8. Reset all database sequences in public schema
    console.log("🔄 Resetting all database sequences in public schema...");
    await client.query(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN 
              SELECT table_name, column_name, pg_get_serial_sequence(table_name, column_name) as seq_name
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
                AND column_default LIKE 'nextval%'
          LOOP
              IF r.seq_name IS NOT NULL THEN
                  EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I), 1))', r.seq_name, r.column_name, r.table_name);
              END IF;
          END LOOP;
      END $$;
    `);
    console.log("   ✓ All sequences reset successfully.");

    await client.query("COMMIT");
    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed and was rolled back:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
