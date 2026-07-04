/**
 * Re-runs the analytics database views (04_actor_stats.sql, 05_actor_metrics.sql, 06_my_ranking_formula.sql, etc.).
 *
 * Use this whenever you tweak stats, metrics, or ranking formulas.
 *
 * Usage:
 *   npx tsx scripts/update-views.ts
 */
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SQL_FILES = [
  '04_actor_stats.sql',
  '05_actor_metrics.sql',
  '06_my_ranking_formula.sql',
  '07_top_rated_formula.sql',
  '08_chart_metrics.sql',
];

import { decrypt } from './crypto-helper';

async function main() {
  const isLocal =
    process.env.NEON_DATABASE_URL?.includes('localhost') ||
    process.env.NEON_DATABASE_URL?.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: true },
  });

  try {
    for (const filename of SQL_FILES) {
      console.log(`🚀 Running ${filename}...`);
      const plaintextPath = path.join(process.cwd(), 'scripts/screen/db', filename);
      const encryptedPath = path.join(process.cwd(), 'scripts/screen/db', `${filename}.enc`);

      let sql = '';
      if (fs.existsSync(plaintextPath)) {
        sql = fs.readFileSync(plaintextPath, 'utf8');
      } else if (fs.existsSync(encryptedPath)) {
        const key = process.env.VIEWS_CRYPT_KEY;
        if (!key) {
          throw new Error(`VIEWS_CRYPT_KEY environment variable is missing (required to decrypt ${filename}.enc)`);
        }
        const ciphertext = fs.readFileSync(encryptedPath, 'utf8');
        sql = decrypt(ciphertext, key);
      } else {
        throw new Error(`Neither plaintext "${filename}" nor encrypted "${filename}.enc" was found in scripts/screen/db`);
      }

      await pool.query(sql);
      console.log(`   ✅ ${filename} completed.`);
    }
    console.log('✅ All analytics materialized views successfully updated!');
  } catch (err: any) {
    console.error('❌ View update failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
