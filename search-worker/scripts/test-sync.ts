import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { syncSearchIndex } from './search-db';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const isLocal =
  process.env.NEON_DATABASE_URL?.includes('localhost') ||
  process.env.NEON_DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: true },
});

async function main() {
  try {
    await syncSearchIndex(pool);
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    await pool.end();
  }
}

main();
