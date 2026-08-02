import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface SearchRow {
  type: 'movie' | 'show' | 'person';
  tmdb_id: number;
  name: string;
  extra_name: string | null;
  image_path: string | null;
  rating: number | null;
  release_date: string | null;
}

export async function syncSearchIndex(pool: Pool) {
  console.log('🔄 Querying Neon database for search index metadata...');

  const sqlPath = path.join(__dirname, 'search_items.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const result = await pool.query(sql);

  const rows: SearchRow[] = result.rows.map((r: any) => ({
    type: r.type as 'movie' | 'show' | 'person',
    tmdb_id: Number(r.tmdb_id),
    name: String(r.name),
    extra_name: r.extra_name ? String(r.extra_name) : null,
    image_path: r.image_path ? String(r.image_path) : null,
    rating: r.rating ? Number(r.rating) : null,
    release_date: r.release_date ? String(r.release_date) : null,
  }));

  console.log(`📦 Compiled search index with ${rows.length} total rows.`);

  // Create target directory search-worker/d1/ if it does not exist
  const d1Dir = path.join(__dirname, '../d1');
  if (!fs.existsSync(d1Dir)) {
    fs.mkdirSync(d1Dir, { recursive: true });
  }

  // Generate SQL file search-worker/d1/search_index.sql
  const sqlDumpPath = path.join(d1Dir, 'search_index.sql');
  const dbPath = path.join(d1Dir, 'search.db');

  console.log(`✍️ Generating SQL dump at ${sqlDumpPath}...`);

  const escapeSql = (val: string | null) => {
    if (val === null) return 'NULL';
    return `'${val.replace(/'/g, "''")}'`;
  };

  const sqlStatements: string[] = [];
  sqlStatements.push('PRAGMA foreign_keys=OFF;');
  sqlStatements.push('BEGIN TRANSACTION;');
  sqlStatements.push('DROP TABLE IF EXISTS search_items;');
  sqlStatements.push(
    'CREATE TABLE search_items (type TEXT NOT NULL, tmdb_id INTEGER NOT NULL, name TEXT NOT NULL, extra_name TEXT, image_path TEXT, rating REAL, release_date TEXT, PRIMARY KEY (type, tmdb_id));',
  );
  sqlStatements.push('CREATE INDEX idx_search_items_name ON search_items(name);');
  sqlStatements.push('CREATE INDEX idx_search_items_extra_name ON search_items(extra_name);');

  for (const row of rows) {
    sqlStatements.push(
      `INSERT INTO search_items (type, tmdb_id, name, extra_name, image_path, rating, release_date) VALUES (${escapeSql(row.type)}, ${row.tmdb_id}, ${escapeSql(row.name)}, ${escapeSql(row.extra_name)}, ${escapeSql(row.image_path)}, ${row.rating !== null ? row.rating : 'NULL'}, ${escapeSql(row.release_date)});`,
    );
  }
  sqlStatements.push('COMMIT;');

  fs.writeFileSync(sqlDumpPath, sqlStatements.join('\n'), 'utf8');

  // Compile SQL dump file into sqlite3 database file
  console.log(`🔨 Compiling SQL dump into SQLite database at ${dbPath}...`);
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath); // Delete old DB file
  }

  try {
    execSync(`sqlite3 "${dbPath}" < "${sqlDumpPath}"`);
    console.log(`✅ Local SQLite database successfully created at ${dbPath}!`);

    console.log('🧹 Optimizing SQLite database via VACUUM...');
    execSync(`sqlite3 "${dbPath}" "VACUUM;"`);

    const finalDumpPath = path.join(d1Dir, 'search_dump.sql');
    console.log(`📤 Creating optimized SQL dump at ${finalDumpPath} using SQLite .dump...`);
    execSync(`sqlite3 "${dbPath}" .dump > "${finalDumpPath}"`);
    console.log(`✅ SQL dump ready for Cloudflare D1 upload!`);
  } catch (error: any) {
    console.error('⚠️ Could not run sqlite3 compiler CLI. Ensure "sqlite3" CLI tool is installed.');
    console.error('Error details:', error.message);
  } finally {
    if (fs.existsSync(sqlDumpPath)) {
      fs.unlinkSync(sqlDumpPath); // Clean up the temp SQL dump
    }
  }
}

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: NEON_DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: true },
  });

  try {
    await syncSearchIndex(pool);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module || process.argv[1]?.includes('sync-search')) {
  main();
}
