/**
 * Re-runs the database views from 03_views.sql.
 *
 * Use this whenever you tweak the filter rules in scripts/db/03_views.sql
 * (e.g. raise/lower popularity floor, add/remove exclusion conditions).
 *
 * The migration itself is idempotent — it drops the views first and recreates
 * them, so running this is the supported "fix" path.
 *
 * Usage:
 *   npx tsx scripts/fix-actor-stats.ts
 */
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const VIEWS_FILE = "03_views.sql";

async function main() {
  const filePath = path.join(
    process.cwd(),
    "scripts/db",
    VIEWS_FILE,
  );
  const sql = fs.readFileSync(filePath, "utf8");

  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });

  console.log(`🚀 Re-applying views from ${VIEWS_FILE}...`);

  try {
    // Drop existing views first to ensure we can recreate them successfully
    await pool.query(`
      DROP MATERIALIZED VIEW IF EXISTS analytics.top_rated_actors CASCADE;
      DROP MATERIALIZED VIEW IF EXISTS analytics.actor_stats CASCADE;
      DROP MATERIALIZED VIEW IF EXISTS analytics.top_rated_crew CASCADE;
    `);

    await pool.query(sql);

    // Quick visibility check so you can confirm the filter changes worked.
    const counts = await pool.query<{ total: number; with_movies: number; with_shows: number }>(`
      SELECT
        COUNT(*)::int                                         as total,
        COUNT(*) FILTER (WHERE movie_count > 0)::int          as with_movies,
        COUNT(*) FILTER (WHERE show_count  > 0)::int          as with_shows
      FROM analytics.actor_stats
    `);

    const { total, with_movies, with_shows } = counts.rows[0];
    console.log("✅ analytics.actor_stats rebuilt.");
    console.log(`   Rows: ${total} (${with_movies} with movies · ${with_shows} with shows)`);
  } catch (err: any) {
    console.error("❌ Rebuild failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
