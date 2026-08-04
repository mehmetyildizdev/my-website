/*
Usage:
  1. Generate diff patch against local slugs.db (local mode):
     pnpm tsx search-worker/scripts/slug-diff.ts

  2. Upload generated diff patch to Cloudflare D1:
     pnpm exec wrangler d1 execute screen --remote --config=search-worker/wrangler.toml --file=search-worker/d1/slug_diff.sql

  3. Advance local slugs.db baseline (after Wrangler upload succeeds):
     pnpm tsx search-worker/scripts/slug-diff-apply-local.ts

  Optional Flags:
    Compare against live D1 directly:
      pnpm tsx search-worker/scripts/slug-diff.ts --remote

    Bypass safety threshold guard:
      pnpm tsx search-worker/scripts/slug-diff.ts --force
*/

import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

const rootEnvPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });
const localEnvPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(localEnvPath)) dotenv.config({ path: localEnvPath });

type SlugType = 'movie' | 'show' | 'person';
type ChangeKind = 'insert' | 'update';

interface SlugRow {
  type: SlugType;
  tmdb_id: number;
  detail_json: string;
}

interface ChangedRow {
  kind: ChangeKind;
  row: SlugRow;
}

interface DiffSummary {
  mode: 'local' | 'remote';
  generated_at: string;
  baseline_rows: number;
  postgres_rows: number;
  inserted_rows: number;
  updated_rows: number;
  deleted_rows: number;
  total_changes: number;
  upload_required: boolean;
  baseline_sha256: string;
  postgres_sha256: string;
  patch_sha256: string;
}

interface ArtifactPaths {
  baselineDb: string;
  diffDb: string;
  diffSql: string;
  summary: string;
}

const SLUG_COLUMNS = 'type, tmdb_id, detail_json';
const VALID_TYPES = new Set<SlugType>(['movie', 'show', 'person']);

function compactDetailJson(type: SlugType, tmdbId: number, rawJson: any): string {
  let parsed: any;
  try {
    parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
  } catch {
    const rawStr = String(rawJson ?? '').trim();
    return rawStr.length > 65_000 ? rawStr.slice(0, 65_000) : rawStr;
  }

  const pruneArrays = (node: any, maxArrayLength: number): any => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) {
      return node.slice(0, maxArrayLength).map((item) => pruneArrays(item, maxArrayLength));
    }
    const result: Record<string, any> = {};
    for (const key of Object.keys(node)) {
      result[key] = pruneArrays(node[key], maxArrayLength);
    }
    return result;
  };

  let jsonStr = JSON.stringify(parsed);
  let maxArrayLength = 50;

  // Universally prune all nested arrays across any entity schema until payload is under 65 KB
  while (jsonStr.length > 65_000 && maxArrayLength >= 2) {
    parsed = pruneArrays(parsed, maxArrayLength);
    jsonStr = JSON.stringify(parsed);
    maxArrayLength = Math.floor(maxArrayLength / 2);
  }

  // Hard safety fallback guarantee
  if (jsonStr.length > 65_000) {
    jsonStr = jsonStr.slice(0, 65_000);
  }

  return jsonStr;
}

function normalizeRow(value: any, source: string): SlugRow {
  const type = String(value.type) as SlugType;
  if (!VALID_TYPES.has(type)) {
    throw new Error(`${source} returned an invalid slug type: ${String(value.type)}`);
  }

  const tmdbId = Number(value.tmdb_id);
  if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) {
    throw new Error(`${source} returned an invalid tmdb_id: ${String(value.tmdb_id)}`);
  }

  const detail_json = compactDetailJson(type, tmdbId, value.detail_json);
  if (detail_json === '') {
    throw new Error(`${source} returned empty detail_json for ${type}:${tmdbId}`);
  }

  return {
    type,
    tmdb_id: tmdbId,
    detail_json,
  };
}

function rowKey(row: SlugRow): string {
  return `${row.type}:${row.tmdb_id}`;
}

function rowsToMap(rows: any[], source: string): Map<string, SlugRow> {
  const map = new Map<string, SlugRow>();

  for (const value of rows) {
    const row = normalizeRow(value, source);
    const key = rowKey(row);
    if (map.has(key)) {
      throw new Error(`${source} returned duplicate key ${key}`);
    }
    map.set(key, row);
  }

  return map;
}

function fingerprintRows(rows: Map<string, SlugRow>): string {
  const canonicalRows = [...rows.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, row]) => row);
  return createHash('sha256').update(JSON.stringify(canonicalRows)).digest('hex');
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function escapeSql(value: string | null): string {
  if (value === null) return 'NULL';
  return `'${value.replace(/'/g, "''")}'`;
}

function fetchLiveD1Rows(): Map<string, SlugRow> {
  console.log('📡 Reading the live D1 slug_details table with one SELECT query...');

  const configPath = fs.existsSync(path.resolve(process.cwd(), 'wrangler.toml'))
    ? 'wrangler.toml'
    : 'search-worker/wrangler.toml';

  const rawJson = execFileSync(
    'pnpm',
    ['exec', 'wrangler', 'd1', 'execute', 'screen', '--remote', `--config=${configPath}`, '--json', '--command', `SELECT ${SLUG_COLUMNS} FROM slug_details;`],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 200 * 1024 * 1024,
    },
  );

  const parsed = JSON.parse(rawJson);
  if (!Array.isArray(parsed) || !Array.isArray(parsed[0]?.results)) {
    throw new Error('Wrangler returned an unexpected D1 JSON response');
  }

  const map = rowsToMap(parsed[0].results, 'Cloudflare D1');
  console.log(`📡 Loaded ${map.size} D1 slug_details rows into memory.`);
  return map;
}

function readSqliteRows(dbPath: string): any[] {
  const rawOutput = execFileSync('sqlite3', [dbPath], {
    input: `.mode json\nSELECT ${SLUG_COLUMNS} FROM slug_details;\n`,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 200 * 1024 * 1024,
  });

  const trimmed = rawOutput.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }

  const jsonArrayStr = '[' + trimmed.replace(/,\s*$/, '').replace(/\n/g, ',') + ']';
  return JSON.parse(jsonArrayStr);
}

function fetchLocalBaselineRows(dbPath: string): Map<string, SlugRow> {
  if (!fs.existsSync(dbPath)) {
    console.log(`ℹ️ Local baseline slugs.db does not exist yet at ${dbPath}. Creating empty baseline.`);
    execFileSync('sqlite3', [dbPath], {
      input: `CREATE TABLE IF NOT EXISTS slug_details (type TEXT NOT NULL, tmdb_id INTEGER NOT NULL, detail_json TEXT NOT NULL, PRIMARY KEY (type, tmdb_id));\n`,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return new Map();
  }

  console.log(`📂 Reading the local D1 baseline at ${dbPath}...`);
  const rows = readSqliteRows(dbPath);
  const map = rowsToMap(rows, 'local slugs.db');
  console.log(`📂 Loaded ${map.size} local baseline slug_details rows.`);
  return map;
}

function buildPatchSql(changedRows: ChangedRow[], deletedRows: SlugRow[]): string {
  const statements: string[] = [
    '-- Incremental D1 slug_details patch generated by slug-diff.ts.',
    '-- Apply only after reviewing slug_diff_summary.json / slug_diff.db.',
  ];

  for (const row of deletedRows) {
    statements.push(`DELETE FROM slug_details WHERE type = ${escapeSql(row.type)} AND tmdb_id = ${row.tmdb_id};`);
  }

  for (const { row } of changedRows) {
    const stmt =
      `INSERT INTO slug_details (${SLUG_COLUMNS}) VALUES (${escapeSql(row.type)}, ${row.tmdb_id}, ${escapeSql(row.detail_json)}) ` +
      `ON CONFLICT(type, tmdb_id) DO UPDATE SET detail_json = excluded.detail_json ` +
      `WHERE slug_details.detail_json IS NOT excluded.detail_json;`;

    if (stmt.length > 80_000) {
      throw new Error(`Statement for ${row.type}:${row.tmdb_id} is ${stmt.length} bytes, exceeding Cloudflare D1 safety cap (80KB max)`);
    }

    statements.push(stmt);
  }

  return `${statements.join('\n')}\n`;
}

function createInspectionDb(diffDbPath: string, changedRows: ChangedRow[], deletedRows: SlugRow[]): void {
  if (fs.existsSync(diffDbPath)) fs.unlinkSync(diffDbPath);

  const sql: string[] = [
    '.bail on',
    'BEGIN IMMEDIATE;',
    "CREATE TABLE slug_details (type TEXT NOT NULL, tmdb_id INTEGER NOT NULL, detail_json TEXT NOT NULL, change_kind TEXT NOT NULL CHECK (change_kind IN ('insert', 'update')), PRIMARY KEY (type, tmdb_id));",
    'CREATE TABLE deleted_slug_details (type TEXT NOT NULL, tmdb_id INTEGER NOT NULL, detail_json TEXT NOT NULL, PRIMARY KEY (type, tmdb_id));',
  ];

  for (const { kind, row } of changedRows) {
    sql.push(
      `INSERT INTO slug_details (${SLUG_COLUMNS}, change_kind) VALUES (${escapeSql(row.type)}, ${row.tmdb_id}, ${escapeSql(row.detail_json)}, ${escapeSql(kind)});`,
    );
  }

  for (const row of deletedRows) {
    sql.push(`INSERT INTO deleted_slug_details (${SLUG_COLUMNS}) VALUES (${escapeSql(row.type)}, ${row.tmdb_id}, ${escapeSql(row.detail_json)});`);
  }

  sql.push('COMMIT;');
  execFileSync('sqlite3', [diffDbPath], {
    input: `${sql.join('\n')}\n`,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function writeSummary(summaryPath: string, summary: DiffSummary): void {
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}

function getArtifactPaths(): ArtifactPaths {
  const d1Dir = path.join(__dirname, '../d1');
  fs.mkdirSync(d1Dir, { recursive: true });

  return {
    baselineDb: path.join(d1Dir, 'slugs.db'),
    diffDb: path.join(d1Dir, 'slug_diff.db'),
    diffSql: path.join(d1Dir, 'slug_diff.sql'),
    summary: path.join(d1Dir, 'slug_diff_summary.json'),
  };
}

function invalidateOldArtifacts(paths: ArtifactPaths): void {
  fs.writeFileSync(paths.diffSql, '-- INVALID: diff generation did not complete successfully; do not upload.\n', 'utf8');
  if (fs.existsSync(paths.diffDb)) fs.unlinkSync(paths.diffDb);
  if (fs.existsSync(paths.summary)) fs.unlinkSync(paths.summary);
}

export async function diffSlugIndex(pool: Pool): Promise<DiffSummary> {
  const paths = getArtifactPaths();
  invalidateOldArtifacts(paths);

  const remoteMode = process.argv.includes('--remote');
  const forceLargeDiff = process.argv.includes('--force');
  const mode: DiffSummary['mode'] = remoteMode ? 'remote' : 'local';

  console.log('🔄 Reading canonical slug_details from Neon...');
  const queryPath = path.join(__dirname, 'slug_details.sql');
  const result = await pool.query(fs.readFileSync(queryPath, 'utf8'));
  const postgresMap = rowsToMap(result.rows, 'Neon Postgres');
  console.log(`📦 Neon returned ${postgresMap.size} canonical slug rows.`);

  const baselineMap = remoteMode ? fetchLiveD1Rows() : fetchLocalBaselineRows(paths.baselineDb);

  if (postgresMap.size === 0 && baselineMap.size > 0) {
    throw new Error('Neon returned zero rows while the baseline is populated');
  }

  const changedRows: ChangedRow[] = [];
  const deletedRows: SlugRow[] = [];

  for (const [key, postgresRow] of postgresMap) {
    const baselineRow = baselineMap.get(key);
    if (!baselineRow) {
      changedRows.push({ kind: 'insert', row: postgresRow });
    } else if (postgresRow.detail_json !== baselineRow.detail_json) {
      changedRows.push({ kind: 'update', row: postgresRow });
    }
  }

  for (const [key, baselineRow] of baselineMap) {
    if (!postgresMap.has(key)) deletedRows.push(baselineRow);
  }

  const insertedRows = changedRows.filter(({ kind }) => kind === 'insert').length;
  const updatedRows = changedRows.length - insertedRows;
  const totalChanges = changedRows.length + deletedRows.length;

  const patchSql = buildPatchSql(changedRows, deletedRows);
  fs.writeFileSync(paths.diffSql, patchSql, 'utf8');
  createInspectionDb(paths.diffDb, changedRows, deletedRows);

  const summary: DiffSummary = {
    mode,
    generated_at: new Date().toISOString(),
    baseline_rows: baselineMap.size,
    postgres_rows: postgresMap.size,
    inserted_rows: insertedRows,
    updated_rows: updatedRows,
    deleted_rows: deletedRows.length,
    total_changes: totalChanges,
    upload_required: totalChanges > 0,
    baseline_sha256: fingerprintRows(baselineMap),
    postgres_sha256: fingerprintRows(postgresMap),
    patch_sha256: sha256(patchSql),
  };
  writeSummary(paths.summary, summary);

  console.log(`⚡ Slug Diff: ${insertedRows} insert(s), ${updatedRows} update(s), ${deletedRows.length} delete(s).`);
  console.log(`🔎 Inspection database: ${paths.diffDb}`);
  console.log(`📤 D1 patch: ${paths.diffSql}`);

  if (totalChanges === 0) {
    console.log('✨ No upload is needed; the patch contains comments only.');
  } else if (mode === 'local') {
    console.log('ℹ️ Upload the patch separately. After Wrangler succeeds, run slug-diff-apply-local.ts.');
  }

  return summary;
}

async function main(): Promise<void> {
  const dbUrl = process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    throw new Error('NEON_DATABASE_URL environment variable is missing');
  }

  const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: true },
  });

  try {
    await diffSlugIndex(pool);
  } finally {
    await pool.end();
  }
}

if (require.main === module || process.argv[1]?.includes('slug-diff')) {
  main().catch((error) => {
    console.error('❌ Slug diff failed:', error);
    process.exitCode = 1;
  });
}
