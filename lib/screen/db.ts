import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Singleton PG Pool
const globalForPg = global as unknown as { pool: Pool };
export const pool =
  globalForPg.pool ||
  new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: process.env.NEON_DATABASE_URL?.includes('localhost')
      ? false
      : { rejectUnauthorized: true },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pool = pool;
}

export const loadQuery = (filename: string) => {
  const filePath = path.join(process.cwd(), 'lib/screen/queries', filename);
  return fs.readFileSync(filePath, 'utf8');
};

const processRows = (rawRows: any[]) => {
  return rawRows.map((row: any) => {
    if (!row) return row;
    let processed = { ...row };

    // Auto-parse any JSON string fields (like json_agg arrays or nested objects)
    for (const key of Object.keys(processed)) {
      const val = processed[key];
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (
          (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          (trimmed.startsWith('{') && trimmed.endsWith('}'))
        ) {
          try {
            processed[key] = JSON.parse(trimmed);
          } catch (e) {
            // ignore
          }
        }
      }
    }

    // If this is a slug details payload, extract it to top-level fields
    if (processed.detail_json && typeof processed.detail_json === 'object') {
      processed = { ...processed, ...processed.detail_json };
    }

    return processed;
  });
};

export const query = async (text: string, params: any[] = []): Promise<{ rows: any[] }> => {
  const res = await pool.query(text, params);
  return { rows: processRows(res.rows) };
};

export const transaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Alias for explicit Postgres queries (same pool, kept for compatibility)
export const pgQuery = query;
