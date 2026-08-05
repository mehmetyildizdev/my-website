import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { buildSearchSnapshot } from './build-search-snapshot-from-neon';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const isLocal = process.env.NEON_DATABASE_URL?.includes('localhost') || process.env.NEON_DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: true },
});

async function main() {
  try {
    await buildSearchSnapshot(pool);
  } catch (error) {
    console.error('Search snapshot build failed:', error);
  } finally {
    await pool.end();
  }
}

main();
