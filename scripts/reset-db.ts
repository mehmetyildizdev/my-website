// scripts/reset-db.ts
// ⚠️  DESTRUCTIVE — drops ALL screen tables then re-creates them from screen.sql.
// Run this before doing a Full Sync to start with a clean slate.
//
//   pnpm tsx scripts/reset-db.ts
//
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: true },
});

// Tables in reverse-dependency order so FK constraints don't block DROP
const TABLES_TO_DROP = [
  "show_networks",
  "show_production_companies",
  "movie_production_companies",
  "collection_movies",
  "show_crew",
  "show_cast",
  "movie_crew",
  "movie_cast",
  "person_countries",
  "show_genres",
  "movie_genres",
  "show_countries",
  "movie_countries",
  "show_seasons",
  "seasons",
  "episodes",
  "watch_history",
  "shows",
  "movies",
  "people",
  "genres",
  "countries",
  "collections",
  "networks",
  "production_companies",
  "api_auth",
];

async function main() {
  const client = await pool.connect();
  try {
    console.log("══════════════════════════════════════════");
    console.log("  DB RESET — dropping all screen tables");
    console.log("══════════════════════════════════════════\n");

    // Drop analytics schema CASCADE first to clean up views
    try {
      await client.query(`DROP SCHEMA IF EXISTS analytics CASCADE`);
      console.log(`✓  Dropped analytics schema`);
    } catch (e: any) {
      console.error(`✗  analytics schema: ${e.message}`);
    }

    // Drop all tables
    for (const table of TABLES_TO_DROP) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`✓  Dropped ${table}`);
      } catch (e: any) {
        console.error(`✗  ${table}: ${e.message}`);
      }
    }

    console.log("\n── Re-applying scripts/db/ SQL files ──\n");

    const sqlFiles = [
      "00_extensions.sql",
      "01_schema.sql",
      "02_indexes.sql",
      "03_views.sql",
      "04_data_patches.sql",
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(process.cwd(), "scripts/db", file);
      const sql = fs.readFileSync(filePath, "utf8");
      
      try {
        await client.query(sql);
        console.log(`✓  Successfully applied ${file}`);
      } catch (e: any) {
        console.error(`✗  Failed to apply ${file}: ${e.message}`);
        throw e;
      }
    }

    console.log("\n══════════════════════════════════════════");
    console.log("  Database reset complete.");
    console.log("  You can now run Pipeline Test (50) then Full Sync.");
    console.log("══════════════════════════════════════════\n");
  } finally {
    client.release();
    pool.end();
  }
}

main();
