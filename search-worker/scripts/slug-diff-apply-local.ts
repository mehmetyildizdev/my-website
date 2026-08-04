/**
 * Local-only baseline updater for slug_details.
 *
 * Run this file only after the separate Wrangler upload of slug_diff.sql
 * succeeds. It never connects to Neon or Cloudflare. Its only responsibility is
 * to advance local slugs.db with the exact patch that was confirmed on D1.
 *
 * Usage:
 *   pnpm tsx search-worker/scripts/slug-diff-apply-local.ts
 */

import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const rootEnvPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });
const localEnvPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(localEnvPath)) dotenv.config({ path: localEnvPath });

type SlugType = 'movie' | 'show' | 'person';

interface SlugRow {
  type: SlugType;
  tmdb_id: number;
  detail_json: string;
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

const SLUG_COLUMNS = 'type, tmdb_id, detail_json';
const VALID_TYPES = new Set<SlugType>(['movie', 'show', 'person']);

function normalizeRow(value: any): SlugRow {
  const type = String(value.type) as SlugType;
  if (!VALID_TYPES.has(type)) {
    throw new Error(`slugs.db contains an invalid slug type: ${String(value.type)}`);
  }

  const tmdbId = Number(value.tmdb_id);
  if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) {
    throw new Error(`slugs.db contains an invalid tmdb_id: ${String(value.tmdb_id)}`);
  }

  let detail_json = String(value.detail_json ?? '').trim();
  if (detail_json === '') {
    throw new Error(`slugs.db contains empty detail_json for ${type}:${tmdbId}`);
  }

  try {
    const parsed = typeof value.detail_json === 'string' ? JSON.parse(value.detail_json) : value.detail_json;
    detail_json = JSON.stringify(parsed);
  } catch {
    // keep trimmed
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

function fingerprintRows(rows: SlugRow[]): string {
  const uniqueRows = new Map<string, SlugRow>();

  for (const value of rows) {
    const row = normalizeRow(value);
    const key = rowKey(row);
    if (uniqueRows.has(key)) {
      throw new Error(`slugs.db contains duplicate key ${key}`);
    }
    uniqueRows.set(key, row);
  }

  const canonicalRows = [...uniqueRows.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, row]) => row);
  return createHash('sha256').update(JSON.stringify(canonicalRows)).digest('hex');
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
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

function readBaselineFingerprint(dbPath: string): string {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Local baseline does not exist: ${dbPath}`);
  }

  const rows = readSqliteRows(dbPath);
  return fingerprintRows(rows);
}

function main(): void {
  const d1Dir = path.join(__dirname, '../d1');
  const baselineDbPath = path.join(d1Dir, 'slugs.db');
  const patchPath = path.join(d1Dir, 'slug_diff.sql');
  const summaryPath = path.join(d1Dir, 'slug_diff_summary.json');

  if (!fs.existsSync(patchPath) || !fs.existsSync(summaryPath)) {
    throw new Error('slug_diff.sql or slug_diff_summary.json is missing');
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8')) as DiffSummary;

  if (summary.mode !== 'local') {
    throw new Error('Only a diff generated in local mode may advance slugs.db');
  }

  const patchSql = fs.readFileSync(patchPath, 'utf8');
  if (sha256(patchSql) !== summary.patch_sha256) {
    throw new Error('slug_diff.sql changed after its summary was generated');
  }

  const currentFingerprint = readBaselineFingerprint(baselineDbPath);

  if (currentFingerprint === summary.postgres_sha256) {
    console.log('✨ slugs.db already matches the generated Neon snapshot; no writes needed.');
    return;
  }

  if (currentFingerprint !== summary.baseline_sha256) {
    throw new Error('slugs.db changed after diff generation; refusing to apply a stale patch');
  }

  execFileSync('sqlite3', [baselineDbPath], {
    input: `.bail on\nBEGIN IMMEDIATE;\n${patchSql}\nCOMMIT;\n`,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (readBaselineFingerprint(baselineDbPath) !== summary.postgres_sha256) {
    throw new Error('slugs.db verification failed after applying slug_diff.sql');
  }

  summary.baseline_advanced_at = new Date().toISOString();
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log('✅ slugs.db advanced successfully and matches the generated Neon snapshot.');
}

try {
  main();
} catch (error) {
  console.error('❌ Local slugs.db update failed:', error);
  process.exitCode = 1;
}
