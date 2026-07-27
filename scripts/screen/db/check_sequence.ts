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
    console.log(`📡 Connected to database`);

    // Find all columns with serial/bigserial sequences
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

    console.log("\n🔍 Checking sequences status:\n");
    
    let desyncedCount = 0;

    for (const row of tablesRes.rows) {
      const { table_name, column_name, sequence_name } = row;

      const maxRes = await client.query(
        `SELECT MAX(${client.escapeIdentifier(column_name)}) AS max_val FROM ${client.escapeIdentifier(table_name)}`
      );
      const maxVal = maxRes.rows[0].max_val !== null ? Number(maxRes.rows[0].max_val) : 0;

      const seqRes = await client.query(`SELECT last_value, is_called FROM ${sequence_name}`);
      const lastSeqVal = Number(seqRes.rows[0].last_value);
      const isCalled = seqRes.rows[0].is_called;

      // Next value sequence will issue:
      const nextSeqVal = isCalled ? lastSeqVal + 1 : lastSeqVal;
      // If maxVal >= nextSeqVal, an INSERT without explicit ID will attempt to reuse an existing primary key
      const needsFix = maxVal >= nextSeqVal;

      if (needsFix) {
        desyncedCount++;
        console.log(`❌ ${table_name}.${column_name}: MAX ID = ${maxVal}, Next Sequence ID = ${nextSeqVal} -> NEEDS FIX!`);
      } else {
        console.log(`✅ ${table_name}.${column_name}: MAX ID = ${maxVal}, Next Sequence ID = ${nextSeqVal} -> OK`);
      }
    }

    if (desyncedCount === 0) {
      console.log("\n🎉 All database sequences are currently IN SYNC!");
    } else {
      console.log(`\n⚠️ Found ${desyncedCount} table(s) with sequence desynchronization.`);
    }

  } catch (err: any) {
    console.error("❌ Failed to check sequences:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
