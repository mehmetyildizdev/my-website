/**
 * Downloads the current live Cloudflare D1 `slug_details` table into local search-worker/d1/slugs.db baseline.
 *
 * Usage:
 *   pnpm tsx search-worker/scripts/fetch-slugs-baseline.ts
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const rootEnvPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });
const localEnvPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(localEnvPath)) dotenv.config({ path: localEnvPath });

function main() {
  const d1Dir = path.join(__dirname, '../d1');
  fs.mkdirSync(d1Dir, { recursive: true });
  const slugsDbPath = path.join(d1Dir, 'slugs.db');

  if (fs.existsSync(slugsDbPath)) {
    fs.unlinkSync(slugsDbPath);
  }

  console.log('📡 Fetching live D1 slug_details snapshot via Wrangler CLI...');

  const token = process.env.CLOUDFLARE_API_TOKEN;
  const envVars = { ...process.env };
  if (token) envVars.CLOUDFLARE_API_TOKEN = token;

  const wranglerConfigPath = path.resolve(__dirname, '../wrangler.toml');

  const rawJson = execFileSync(
    'pnpm',
    ['exec', 'wrangler', 'd1', 'execute', 'screen', '--remote', `--config=${wranglerConfigPath}`, '--json', '--command', 'SELECT type, tmdb_id, detail_json FROM slug_details;'],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 200 * 1024 * 1024,
      env: envVars,
    },
  );

  const parsed = JSON.parse(rawJson);
  if (!Array.isArray(parsed) || !Array.isArray(parsed[0]?.results)) {
    throw new Error('Wrangler returned an unexpected D1 JSON response');
  }

  const rows = parsed[0].results as { type: string; tmdb_id: number; detail_json: string }[];
  console.log(`📦 Loaded ${rows.length} rows from live Cloudflare D1.`);

  console.log(`📂 Creating local SQLite baseline database at ${slugsDbPath}...`);

  const escapeSql = (val: string | null) => {
    if (val === null) return 'NULL';
    return `'${val.replace(/'/g, "''")}'`;
  };

  const sqlStatements: string[] = [
    '.bail on',
    'BEGIN IMMEDIATE;',
    'CREATE TABLE slug_details (type TEXT NOT NULL, tmdb_id INTEGER NOT NULL, detail_json TEXT NOT NULL, PRIMARY KEY (type, tmdb_id));',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_slug_details_type_id ON slug_details(type, tmdb_id);',
  ];

  for (const r of rows) {
    const jsonStr = typeof r.detail_json === 'string' ? r.detail_json : JSON.stringify(r.detail_json);
    sqlStatements.push(`INSERT INTO slug_details (type, tmdb_id, detail_json) VALUES (${escapeSql(r.type)}, ${r.tmdb_id}, ${escapeSql(jsonStr)});`);
  }

  sqlStatements.push('COMMIT;');

  execFileSync('sqlite3', [slugsDbPath], {
    input: `${sqlStatements.join('\n')}\n`,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 200 * 1024 * 1024,
  });

  console.log(`✅ Successfully initialized local slugs.db baseline with ${rows.length} live D1 rows.`);
}

try {
  main();
} catch (err: any) {
  console.error('❌ Failed to fetch D1 baseline:', err.message);
  process.exitCode = 1;
}
