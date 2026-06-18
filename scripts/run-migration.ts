/**
 * Run a SQL script from scripts/db against the Neon database.
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts                            # runs latest
 *   npx tsx scripts/run-migration.ts 01_schema                  # runs specific
 *   npx tsx scripts/run-migration.ts 01_schema.sql              # extension OK
 */
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MIGRATIONS_DIR = path.join(process.cwd(), "scripts/db");

function resolveMigrationFile(arg?: string): string {
  const all = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (!all.length) {
    throw new Error(`No .sql files found in ${MIGRATIONS_DIR}`);
  }

  if (!arg) return all[all.length - 1]; // latest

  const target = arg.endsWith(".sql") ? arg : `${arg}.sql`;
  const match = all.find((f) => f === target || f.startsWith(arg));
  if (!match) {
    throw new Error(
      `Migration "${arg}" not found. Available:\n  - ${all.join("\n  - ")}`,
    );
  }
  return match;
}

async function runMigration() {
  const filename = resolveMigrationFile(process.argv[2]);
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, "utf8");

  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: true },
  });

  console.log(`🚀 Running migration: ${filename}\n`);

  try {
    await pool.query(sql);
    console.log(`✅ Migration "${filename}" completed successfully.`);
  } catch (error: any) {
    if (error.message?.includes("already exists")) {
      console.log(`⚠️  Some objects in "${filename}" already exist.`);
      console.log("   Drop them first if you need to recreate, e.g.:");
      console.log("   DROP MATERIALIZED VIEW IF EXISTS analytics.top_rated_actors;");
    } else {
      console.error(`❌ Migration "${filename}" failed:`, error.message);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
