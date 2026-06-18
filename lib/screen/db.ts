import { Pool } from "pg";
import fs from "fs";
import path from "path";

export const loadQuery = (filename: string) => {
  const filePath = path.join(process.cwd(), "lib/screen/queries", filename);
  return fs.readFileSync(filePath, "utf8");
};

// Ensure the pool is a singleton in development to prevent
// hot-reloading from creating 100s of connections.
const globalForPg = global as unknown as { pool: Pool };

export const pool =
  globalForPg.pool ||
  new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: process.env.NEON_DATABASE_URL?.includes("localhost")
      ? false
      : {
          rejectUnauthorized: true,
        },
  });

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const transaction = async <T>(
  callback: (client: import("pg").PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
