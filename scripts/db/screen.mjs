// ==============================================================================
// Database Initialization Script (NodeJS / ES Modules)
// ==============================================================================
// Purpose:
//   Provides a JS-native (ES Modules) migration runner to set up the database 
//   schema from scratch on a clean PostgreSQL instance. 
//   Useful for cross-platform installations (Windows/macOS/Linux) where the 
//   `psql` CLI utility is not installed.
//
// Requirements:
//   - NodeJS runtime.
//   - NEON_DATABASE_URL defined in `.env.local` or process environment.
//
// Usage:
//   node scripts/db/screen.mjs
// ==============================================================================
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrate() {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error('Missing NEON_DATABASE_URL in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to Neon Database.');

    const sqlFiles = [
      '00_extensions.sql',
      '01_schema.sql',
      '02_indexes.sql',
      '03_views.sql',
      '04_data_patches.sql',
    ];

    console.log('Executing database setup scripts...');
    for (const file of sqlFiles) {
      const filePath = path.join(process.cwd(), 'scripts/db', file);
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`✓ Applied ${file}`);
    }

    console.log('Database schema is successfully set up.');
  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

migrate();
