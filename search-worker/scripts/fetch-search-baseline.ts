/**
 * Copy the current live D1 search_items table into search-worker/d1/search.db.
 *
 * Run once from the repository root:
 *   pnpm tsx search-worker/scripts/fetch-search-baseline.ts
 *
 * This performs one SELECT against D1 and does not write to D1.
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, 'search-worker/.env') });

const d1Dir = path.join(rootDir, 'search-worker/d1');
const dbPath = path.join(d1Dir, 'search.db');
const wranglerConfigPath = path.join(rootDir, 'search-worker/wrangler.toml');

type SearchRow = {
  type: string;
  tmdb_id: number;
  name: string;
  extra_name: string | null;
  image_path: string | null;
  rating: number | null;
  release_date: string | null;
};

function escapeSql(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function ratingSql(value: number | null): string {
  if (value === null || value === undefined) return 'NULL';
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid rating: ${String(value)}`);
  return String(number);
}

function readD1Rows(): { rows: SearchRow[]; meta: Record<string, unknown> } {
  console.log('📡 Reading live D1 search_items once...');

  const rawJson = execFileSync(
    'pnpm',
    [
      'exec',
      'wrangler',
      'd1',
      'execute',
      'screen',
      '--remote',
      `--config=${wranglerConfigPath}`,
      '--json',
      '--command',
      'SELECT type, tmdb_id, name, extra_name, image_path, rating, release_date FROM search_items;',
    ],
    {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 200 * 1024 * 1024,
      env: process.env,
    },
  );

  const parsed = JSON.parse(rawJson);
  if (!Array.isArray(parsed) || !Array.isArray(parsed[0]?.results)) {
    throw new Error('Wrangler returned an unexpected D1 JSON response');
  }

  const rows = parsed[0].results as SearchRow[];
  const keys = new Set<string>();
  for (const row of rows) {
    const key = `${row.type}:${Number(row.tmdb_id)}`;
    if (keys.has(key)) throw new Error(`Duplicate D1 key: ${key}`);
    keys.add(key);
  }

  console.log(`📦 Loaded ${rows.length} D1 rows.`);
  console.log(`📊 D1 metadata: rows_read=${parsed[0].meta?.rows_read ?? 'unknown'}, rows_written=${parsed[0].meta?.rows_written ?? 'unknown'}`);
  return { rows, meta: parsed[0].meta ?? {} };
}

function buildLocalDatabase(rows: SearchRow[]): string {
  fs.mkdirSync(d1Dir, { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(d1Dir, 'search-baseline-'));
  const tempDbPath = path.join(tempDir, 'search.db');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'manual', 'search_items_schema.sql'), 'utf8').trim();

  const statements = [
    'PRAGMA foreign_keys=OFF;',
    'BEGIN TRANSACTION;',
    schemaSql,
    ...rows.map(
      (row) =>
        `INSERT INTO search_items (type, tmdb_id, name, extra_name, image_path, rating, release_date) VALUES (${escapeSql(row.type)}, ${Number(row.tmdb_id)}, ${escapeSql(row.name)}, ${escapeSql(row.extra_name)}, ${escapeSql(row.image_path)}, ${ratingSql(row.rating)}, ${escapeSql(row.release_date)});`,
    ),
    'COMMIT;',
  ];

  try {
    execFileSync('sqlite3', [tempDbPath], {
      input: `${statements.join('\n')}\n`,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 200 * 1024 * 1024,
    });

    const verification = execFileSync('sqlite3', ['-json', tempDbPath, 'SELECT type, COUNT(*) AS rows FROM search_items GROUP BY type ORDER BY type;'], {
      encoding: 'utf8',
    });
    const counts = JSON.parse(verification) as Array<{ type: string; rows: number }>;
    const verifiedTotal = counts.reduce((sum, row) => sum + Number(row.rows), 0);
    if (verifiedTotal !== rows.length) {
      throw new Error(`Local verification failed: D1=${rows.length}, local=${verifiedTotal}`);
    }

    fs.renameSync(tempDbPath, dbPath);
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log(`✅ Replaced ${dbPath} with the verified D1 snapshot.`);
    console.log(`📊 Local counts: ${JSON.stringify(counts)}`);
    return dbPath;
  } catch (error) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
}

try {
  const { rows } = readD1Rows();
  buildLocalDatabase(rows);
} catch (error: any) {
  console.error(`❌ Search baseline copy failed: ${error.message}`);
  process.exitCode = 1;
}
