/**
 * Local-only baseline updater.
 *
 * Run this file only after the separate Wrangler upload of search_diff.sql
 * succeeds. It never connects to Neon or Cloudflare. Its only responsibility is
 * to advance local search.db with the exact patch that was confirmed on D1.
 *
 * Usage:
 *   pnpm tsx search-worker/scripts/search-diff-apply-local.ts
 */

import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

type SearchType = 'movie' | 'show' | 'person';

interface SearchRow {
  type: SearchType;
  tmdb_id: number;
  name: string;
  extra_name: string | null;
  image_path: string | null;
  rating: number | null;
  release_date: string | null;
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
  baseline_advanced_at?: string;
}

const SEARCH_COLUMNS = 'type, tmdb_id, name, extra_name, image_path, rating, release_date';

const VALID_TYPES = new Set<SearchType>(['movie', 'show', 'person']);

function normalizeRow(value: any): SearchRow {
  const type = String(value.type) as SearchType;
  if (!VALID_TYPES.has(type)) {
    throw new Error(`search.db contains an invalid search type: ${String(value.type)}`);
  }

  const tmdbId = Number(value.tmdb_id);
  if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) {
    throw new Error(`search.db contains an invalid tmdb_id: ${String(value.tmdb_id)}`);
  }

  const normalizeOptionalText = (input: unknown): string | null => {
    if (input === null || input === undefined) return null;
    const text = String(input).trim();
    return text === '' ? null : text;
  };

  const name = String(value.name ?? '').trim();
  if (name === '') {
    throw new Error(`search.db contains an empty name for ${type}:${tmdbId}`);
  }

  let rating: number | null = null;
  if (value.rating !== null && value.rating !== undefined && value.rating !== '') {
    const numericRating = Number(value.rating);
    if (!Number.isFinite(numericRating)) {
      throw new Error(`search.db contains an invalid rating for ${type}:${tmdbId}`);
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

function fingerprintRows(rows: SearchRow[]): string {
  const uniqueRows = new Map<string, SearchRow>();

  for (const value of rows) {
    const row = normalizeRow(value);
    const key = rowKey(row);
    if (uniqueRows.has(key)) {
      throw new Error(`search.db contains duplicate key ${key}`);
    }
    uniqueRows.set(key, row);
  }

  const canonicalRows = [...uniqueRows.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, row]) => row);

  return createHash('sha256').update(JSON.stringify(canonicalRows)).digest('hex');
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
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

/** Read the local mirror only; this does not perform any Cloudflare read. */
function readBaselineFingerprint(dbPath: string): string {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Local baseline does not exist: ${dbPath}`);
  }

  const rows = readSqliteRows(dbPath);
  return fingerprintRows(rows);
}

function main(): void {
  const d1Dir = path.join(__dirname, '../d1');
  const baselineDbPath = path.join(d1Dir, 'search.db');
  const patchPath = path.join(d1Dir, 'search_diff.sql');
  const summaryPath = path.join(d1Dir, 'search_diff_summary.json');

  if (!fs.existsSync(patchPath) || !fs.existsSync(summaryPath)) {
    throw new Error('search_diff.sql or search_diff_summary.json is missing');
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8')) as DiffSummary;

  // A remote-mode patch was based on live D1, not this local search.db. Applying
  // it locally could skip unknown differences, so only local-mode patches qualify.
  if (summary.mode !== 'local') {
    throw new Error('Only a diff generated in local mode may advance search.db');
  }

  const patchSql = fs.readFileSync(patchPath, 'utf8');
  if (sha256(patchSql) !== summary.patch_sha256) {
    throw new Error('search_diff.sql changed after its summary was generated');
  }

  const currentFingerprint = readBaselineFingerprint(baselineDbPath);

  // Safe idempotency: a repeated invocation does not rewrite any rows.
  if (currentFingerprint === summary.postgres_sha256) {
    console.log('✨ search.db already matches the generated Neon snapshot; no writes needed.');
    return;
  }

  if (currentFingerprint !== summary.baseline_sha256) {
    throw new Error('search.db changed after diff generation; refusing to apply a stale patch');
  }

  // Apply all local mirror changes atomically. The D1 patch itself intentionally
  // has no transaction wrapper because Wrangler owns the remote execution.
  execFileSync('sqlite3', [baselineDbPath], {
    input: `.bail on\nBEGIN IMMEDIATE;\n${patchSql}\nCOMMIT;\n`,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Verify the updated mirror exactly matches the Neon snapshot used to build
  // the patch. These are local SQLite reads and do not consume D1 limits.
  if (readBaselineFingerprint(baselineDbPath) !== summary.postgres_sha256) {
    throw new Error('search.db verification failed after applying search_diff.sql');
  }

  summary.baseline_advanced_at = new Date().toISOString();
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log('✅ search.db advanced successfully and matches the generated Neon snapshot.');
}

try {
  main();
} catch (error) {
  console.error('❌ Local search.db update failed:', error);
  process.exitCode = 1;
}
