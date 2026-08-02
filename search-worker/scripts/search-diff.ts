/*
Usage:
  1. Generate diff patch against local search.db (local mode):
     pnpm tsx search-worker/scripts/search-diff.ts

  2. Upload generated diff patch to Cloudflare D1:
     pnpm exec wrangler d1 execute screen --remote --config=search-worker/wrangler.toml --file=search-worker/d1/search_diff.sql

  3. Advance local search.db baseline (after Wrangler upload succeeds):
     pnpm tsx search-worker/scripts/search-diff-apply-local.ts

  Optional Flags:
    Compare against live D1 directly:
      pnpm tsx search-worker/scripts/search-diff.ts --remote

    Bypass safety threshold guard:
      pnpm tsx search-worker/scripts/search-diff.ts --force
*/

import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

type SearchType = 'movie' | 'show' | 'person';
type ChangeKind = 'insert' | 'update';

interface SearchRow {
  type: SearchType;
  tmdb_id: number;
  name: string;
  extra_name: string | null;
  image_path: string | null;
  rating: number | null;
  release_date: string | null;
}

const MUTABLE_SEARCH_COLUMNS = ['name', 'extra_name', 'image_path', 'rating', 'release_date'] as const;

type MutableSearchColumn = (typeof MUTABLE_SEARCH_COLUMNS)[number];

interface ChangedRow {
  kind: ChangeKind;
  row: SearchRow;
  /** Columns that must be assigned if this row already exists in D1. */
  changedColumns: MutableSearchColumn[];
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

const SEARCH_COLUMNS = 'type, tmdb_id, name, extra_name, image_path, rating, release_date';

const VALID_TYPES = new Set<SearchType>(['movie', 'show', 'person']);

/**
 * Convert values returned by Postgres, D1, and SQLite to one stable shape.
 *
 * We preserve a real numeric zero and round ratings once. After this step,
 * strict equality is enough and will not create recurring float-only updates.
 */
function normalizeRow(value: any, source: string): SearchRow {
  const type = String(value.type) as SearchType;
  if (!VALID_TYPES.has(type)) {
    throw new Error(`${source} returned an invalid search type: ${String(value.type)}`);
  }

  const tmdbId = Number(value.tmdb_id);
  if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) {
    throw new Error(`${source} returned an invalid tmdb_id: ${String(value.tmdb_id)}`);
  }

  const normalizeOptionalText = (input: unknown): string | null => {
    if (input === null || input === undefined) return null;
    const text = String(input).trim();
    return text === '' ? null : text;
  };

  const name = String(value.name ?? '').trim();
  if (name === '') {
    throw new Error(`${source} returned an empty name for ${type}:${tmdbId}`);
  }

  let rating: number | null = null;
  if (value.rating !== null && value.rating !== undefined && value.rating !== '') {
    const numericRating = Number(value.rating);
    if (!Number.isFinite(numericRating)) {
      throw new Error(`${source} returned an invalid rating for ${type}:${tmdbId}`);
    }
    rating = Math.round(numericRating * 10_000) / 10_000;
  }

  return {
    type,
    tmdb_id: tmdbId,
    name,
    extra_name: normalizeOptionalText(value.extra_name),
    image_path: normalizeOptionalText(value.image_path),
    rating,
    release_date: normalizeOptionalText(value.release_date),
  };
}

function rowKey(row: SearchRow): string {
  return `${row.type}:${row.tmdb_id}`;
}

/** Build a lookup map and reject duplicate primary keys before generating SQL. */
function rowsToMap(rows: any[], source: string): Map<string, SearchRow> {
  const map = new Map<string, SearchRow>();

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

/** Return only fields whose normalized values differ from the baseline. */
function getChangedColumns(desired: SearchRow, baseline: SearchRow): MutableSearchColumn[] {
  return MUTABLE_SEARCH_COLUMNS.filter((column) => desired[column] !== baseline[column]);
}

/** A stable fingerprint lets the separate local updater reject a stale patch. */
function fingerprintRows(rows: Map<string, SearchRow>): string {
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

function rowValuesSql(row: SearchRow): string {
  return [
    escapeSql(row.type),
    row.tmdb_id,
    escapeSql(row.name),
    escapeSql(row.extra_name),
    escapeSql(row.image_path),
    row.rating ?? 'NULL',
    escapeSql(row.release_date),
  ].join(', ');
}

/**
 * Remote mode: perform exactly one D1 query and keep the complete snapshot in
 * memory. Creating a temporary SQLite baseline would add local work but would
 * not reduce Cloudflare rows read.
 */
function fetchLiveD1Rows(): Map<string, SearchRow> {
  console.log('📡 Reading the live D1 search_items table with one SELECT query...');

  const rawJson = execFileSync(
    'pnpm',
    ['exec', 'wrangler', 'd1', 'execute', 'screen', '--remote', '--json', '--command', `SELECT ${SEARCH_COLUMNS} FROM search_items;`],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 100 * 1024 * 1024,
    },
  );

  const parsed = JSON.parse(rawJson);
  if (!Array.isArray(parsed) || !Array.isArray(parsed[0]?.results)) {
    throw new Error('Wrangler returned an unexpected D1 JSON response');
  }

  const map = rowsToMap(parsed[0].results, 'Cloudflare D1');
  console.log(`📡 Loaded ${map.size} D1 rows into memory.`);
  return map;
}

/**
 * Safely reads search_items rows from a local SQLite database using the sqlite3 CLI.
 * - Pipes `.mode json` and the SELECT query via stdin to prevent CLI argument parsing errors.
 * - Sets a 100MB maxBuffer to accommodate large result sets (~60,000+ rows).
 * - Handles both standard JSON arrays ([...]) and line-delimited JSON objects across sqlite3 CLI versions.
 */
function readSqliteRows(dbPath: string): any[] {
  const rawOutput = execFileSync('sqlite3', [dbPath], {
    input: `.mode json\nSELECT ${SEARCH_COLUMNS} FROM search_items;\n`,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 100 * 1024 * 1024,
  });

  const trimmed = rawOutput.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }

  const jsonArrayStr = '[' + trimmed.replace(/,\s*$/, '').replace(/\n/g, ',') + ']';
  return JSON.parse(jsonArrayStr);
}

/** Local mode: search.db is the last baseline confirmed as uploaded to D1. */
function fetchLocalBaselineRows(dbPath: string): Map<string, SearchRow> {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Local baseline does not exist: ${dbPath}`);
  }

  console.log(`📂 Reading the local D1 baseline at ${dbPath}...`);
  const rows = readSqliteRows(dbPath);

  const map = rowsToMap(rows, 'local search.db');
  console.log(`📂 Loaded ${map.size} local baseline rows.`);
  return map;
}

/**
 * The upload file is intentionally a DML-only patch. A normal SQLite .dump
 * would include schema statements and VACUUM would only compact a local file;
 * neither operation reduces D1 row writes.
 */
function buildPatchSql(changedRows: ChangedRow[], deletedRows: SearchRow[]): string {
  const statements: string[] = [
    '-- Incremental D1 patch generated by search-diff.ts.',
    '-- Apply only after reviewing search_diff_summary.json / search_diff.db.',
  ];

  for (const row of deletedRows) {
    statements.push(`DELETE FROM search_items WHERE type = ${escapeSql(row.type)} AND tmdb_id = ${row.tmdb_id};`);
  }

  // ON CONFLICT keeps the patch safe to retry. Its UPDATE clause contains only
  // fields that actually changed, so rating/image/date updates do not rewrite
  // the name and extra_name indexes unnecessarily.
  for (const { row, changedColumns } of changedRows) {
    if (changedColumns.length === 0) {
      throw new Error(`Changed row ${rowKey(row)} has no changed columns`);
    }

    const assignments = changedColumns.map((column) => `${column} = excluded.${column}`).join(', ');

    // This null-safe predicate prevents a retried/already-applied patch from
    // writing the row again when D1 already contains all desired values.
    const stillDifferent = changedColumns.map((column) => `search_items.${column} IS NOT excluded.${column}`).join(' OR ');

    statements.push(
      `INSERT INTO search_items (${SEARCH_COLUMNS}) VALUES (${rowValuesSql(row)}) ` +
        `ON CONFLICT(type, tmdb_id) DO UPDATE SET ${assignments} ` +
        `WHERE ${stillDifferent};`,
    );
  }

  return `${statements.join('\n')}\n`;
}

/**
 * Build an inspection-only SQLite database.
 *
 * search_items contains new/updated rows and labels their change kind.
 * deleted_search_items separately records rows that the patch will delete.
 * This database is never uploaded to D1.
 */
function createInspectionDb(diffDbPath: string, changedRows: ChangedRow[], deletedRows: SearchRow[]): void {
  if (fs.existsSync(diffDbPath)) fs.unlinkSync(diffDbPath);

  const sql: string[] = [
    '.bail on',
    'BEGIN IMMEDIATE;',
    "CREATE TABLE search_items (type TEXT NOT NULL, tmdb_id INTEGER NOT NULL, name TEXT NOT NULL, extra_name TEXT, image_path TEXT, rating REAL, release_date TEXT, change_kind TEXT NOT NULL CHECK (change_kind IN ('insert', 'update')), changed_columns TEXT NOT NULL, PRIMARY KEY (type, tmdb_id));",
    'CREATE TABLE deleted_search_items (type TEXT NOT NULL, tmdb_id INTEGER NOT NULL, name TEXT NOT NULL, extra_name TEXT, image_path TEXT, rating REAL, release_date TEXT, PRIMARY KEY (type, tmdb_id));',
  ];

  for (const { kind, row, changedColumns } of changedRows) {
    sql.push(
      `INSERT INTO search_items (${SEARCH_COLUMNS}, change_kind, changed_columns) VALUES (${rowValuesSql(row)}, ${escapeSql(kind)}, ${escapeSql(changedColumns.join(','))});`,
    );
  }

  for (const row of deletedRows) {
    sql.push(`INSERT INTO deleted_search_items (${SEARCH_COLUMNS}) VALUES (${rowValuesSql(row)});`);
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

function getMaxChangeRatio(): number {
  // Default to a conservative 20% ceiling. Override intentionally with an
  // environment value between 0 and 1, or bypass once with --force.
  const raw = process.env.SEARCH_DIFF_MAX_CHANGE_RATIO ?? '0.20';
  const ratio = Number(raw);
  if (!Number.isFinite(ratio) || ratio <= 0 || ratio > 1) {
    throw new Error('SEARCH_DIFF_MAX_CHANGE_RATIO must be greater than 0 and at most 1');
  }
  return ratio;
}

function getArtifactPaths(): ArtifactPaths {
  const d1Dir = path.join(__dirname, '../d1');
  fs.mkdirSync(d1Dir, { recursive: true });

  return {
    baselineDb: path.join(d1Dir, 'search.db'),
    diffDb: path.join(d1Dir, 'search_diff.db'),
    diffSql: path.join(d1Dir, 'search_diff.sql'),
    summary: path.join(d1Dir, 'search_diff_summary.json'),
  };
}

/** Replace old generated artifacts immediately so a failed run cannot leave a stale patch. */
function invalidateOldArtifacts(paths: ArtifactPaths): void {
  fs.writeFileSync(paths.diffSql, '-- INVALID: diff generation did not complete successfully; do not upload.\n', 'utf8');
  if (fs.existsSync(paths.diffDb)) fs.unlinkSync(paths.diffDb);
  if (fs.existsSync(paths.summary)) fs.unlinkSync(paths.summary);
}

/**
 * Normal generation mode:
 * 1. Read Neon once.
 * 2. Read exactly one baseline (one live D1 SELECT or one local SQLite SELECT).
 * 3. Compare entirely in memory.
 * 4. Write local review/upload artifacts without uploading anything.
 */
export async function diffSearchIndex(pool: Pool): Promise<DiffSummary> {
  const paths = getArtifactPaths();
  invalidateOldArtifacts(paths);

  const remoteMode = process.argv.includes('--remote');
  const forceLargeDiff = process.argv.includes('--force');
  const mode: DiffSummary['mode'] = remoteMode ? 'remote' : 'local';

  console.log('🔄 Reading the canonical search index from Neon...');
  const queryPath = path.join(__dirname, 'search_items.sql');
  const result = await pool.query(fs.readFileSync(queryPath, 'utf8'));
  const postgresMap = rowsToMap(result.rows, 'Neon Postgres');
  console.log(`📦 Neon returned ${postgresMap.size} canonical rows.`);

  const baselineMap = remoteMode ? fetchLiveD1Rows() : fetchLocalBaselineRows(paths.baselineDb);

  // An empty source paired with a populated baseline almost certainly means a
  // broken source query. Never turn that into a delete-everything patch.
  if (postgresMap.size === 0 && baselineMap.size > 0) {
    throw new Error('Neon returned zero rows while the baseline is populated');
  }

  const changedRows: ChangedRow[] = [];
  const deletedRows: SearchRow[] = [];

  for (const [key, postgresRow] of postgresMap) {
    const baselineRow = baselineMap.get(key);
    if (!baselineRow) {
      // A true insert writes every field. Listing every field in the conflict
      // fallback also repairs a stale local baseline if the row already exists
      // remotely with different content.
      changedRows.push({
        kind: 'insert',
        row: postgresRow,
        changedColumns: [...MUTABLE_SEARCH_COLUMNS],
      });
    } else {
      const changedColumns = getChangedColumns(postgresRow, baselineRow);
      if (changedColumns.length > 0) {
        changedRows.push({ kind: 'update', row: postgresRow, changedColumns });
      }
    }
  }

  for (const [key, baselineRow] of baselineMap) {
    if (!postgresMap.has(key)) deletedRows.push(baselineRow);
  }

  const insertedRows = changedRows.filter(({ kind }) => kind === 'insert').length;
  const updatedRows = changedRows.length - insertedRows;
  const totalChanges = changedRows.length + deletedRows.length;

  // Log update-field frequency so future runs make index-write amplification
  // visible before the patch is uploaded.
  const updatedFieldCounts = Object.fromEntries(
    MUTABLE_SEARCH_COLUMNS.map((column) => [
      column,
      changedRows.filter(({ kind, changedColumns }) => kind === 'update' && changedColumns.includes(column)).length,
    ]),
  ) as Record<MutableSearchColumn, number>;

  console.log('🧩 Updated fields: ' + MUTABLE_SEARCH_COLUMNS.map((column) => `${column}=${updatedFieldCounts[column]}`).join(', '));

  // Protect Cloudflare limits against an accidental normalization/schema/query
  // change. Small indexes are exempt; an intentional large patch uses --force.
  const comparisonSize = Math.max(postgresMap.size, baselineMap.size);
  const maxChangeRatio = getMaxChangeRatio();
  const changeRatio = comparisonSize === 0 ? 0 : totalChanges / comparisonSize;

  console.log(
    `📏 Difference size: ${totalChanges}/${comparisonSize} row(s) ` +
      `(${(changeRatio * 100).toFixed(2)}%). ` +
      `Safety limit: ${(maxChangeRatio * 100).toFixed(2)}%.`,
  );

  // The percentage guard starts at 100 rows so a few normal changes cannot
  // block a very small development index. --force is always explicit in logs.
  if (forceLargeDiff) {
    console.warn('⚠️ --force supplied: the difference-size safety limit is disabled for this run.');
  } else if (baselineMap.size === 0) {
    console.log('ℹ️ Difference-size guard skipped because the baseline is empty.');
  } else if (comparisonSize < 100) {
    console.log('ℹ️ Difference-size guard skipped because the index has fewer than 100 rows.');
  }

  if (!forceLargeDiff && baselineMap.size > 0 && comparisonSize >= 100 && changeRatio > maxChangeRatio) {
    throw new Error(
      `${totalChanges} of ${comparisonSize} rows would change (${(changeRatio * 100).toFixed(
        2,
      )}%). Review the cause, then rerun with --force if intentional.`,
    );
  }

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

  console.log(`⚡ Diff: ${insertedRows} insert(s), ${updatedRows} update(s), ` + `${deletedRows.length} delete(s).`);
  console.log(`🔎 Inspection database: ${paths.diffDb}`);
  console.log(`📤 D1 patch: ${paths.diffSql}`);

  if (totalChanges === 0) {
    console.log('✨ No upload is needed; the patch contains comments only.');
  } else if (mode === 'local') {
    console.log('ℹ️ Upload the patch separately. After Wrangler succeeds, run apply-search-diff-local.ts.');
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
    await diffSearchIndex(pool);
  } finally {
    await pool.end();
  }
}

if (require.main === module || process.argv[1]?.includes('search-diff')) {
  main().catch((error) => {
    console.error('❌ Search diff failed:', error);
    process.exitCode = 1;
  });
}
