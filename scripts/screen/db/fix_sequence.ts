import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

if (!process.env.NEON_DATABASE_URL) {
  console.error("❌ NEON_DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: process.env.NEON_DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: true },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log("🔄 Discovering all table sequences...");
    
    const tablesRes = await client.query(`
      SELECT 
        c.table_name,
        c.column_name,
        pg_get_serial_sequence(quote_ident(c.table_name), c.column_name) AS sequence_name
      FROM information_schema.columns c
      JOIN information_schema.tables t ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      WHERE c.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND pg_get_serial_sequence(quote_ident(c.table_name), c.column_name) IS NOT NULL;
    `);

    if (tablesRes.rows.length === 0) {
      console.log("ℹ️ No serial sequences found in the public schema.");
      return;
    }

    console.log(`Found ${tablesRes.rows.length} sequence(s). Resetting...\n`);

    for (const row of tablesRes.rows) {
      const { table_name, column_name, sequence_name } = row;
      
      const query = `
        SELECT setval(
          ${client.escapeLiteral(sequence_name)}, 
          COALESCE((SELECT MAX(${client.escapeIdentifier(column_name)}) FROM ${client.escapeIdentifier(table_name)}), 1)
        )
      `;
      
      const res = await client.query(query);
      const nextId = Number(res.rows[0].setval) + 1;
      console.log(`✅ ${table_name}.${column_name} (${sequence_name}) -> Next ID will be: ${nextId}`);
    }

    console.log("\n🎉 All table sequences have been successfully reset!");
  } catch (err: any) {
    console.error("❌ Failed to reset sequences:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
