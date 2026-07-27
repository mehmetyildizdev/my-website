import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SQLITE_DB = path.join(process.cwd(), 'scripts/screen/db/analytics.sqlite');
const INPUT_FILE = path.join(process.cwd(), 'dump.sql');
const OUTPUT_FILE = path.join(process.cwd(), 'clean_dump.sql');

function splitEscapedString(str: string, size: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < str.length) {
    let end = start + size;
    if (end >= str.length) {
      chunks.push(str.substring(start));
      break;
    }
    // Prevent splitting consecutive single quotes (escaped quotes like '')
    let quoteCount = 0;
    let temp = end - 1;
    while (temp >= start && str[temp] === "'") {
      quoteCount++;
      temp--;
    }
    if (quoteCount % 2 !== 0) {
      end--; // Adjust boundary to keep escaped quotes in the same chunk
    }
    chunks.push(str.substring(start, end));
    start = end;
  }
  return chunks;
}

function main() {
  console.log("🧹 Running VACUUM on SQLite database to compact it...");
  try {
    execSync(`sqlite3 "${SQLITE_DB}" "VACUUM;"`);
    console.log("   ✅ SQLite database compacted.");
  } catch (err: any) {
    console.error("   ❌ Failed to run VACUUM:", err.message);
  }

  console.log("📦 Generating database dump via sqlite3...");
  try {
    execSync(`sqlite3 "${SQLITE_DB}" .dump > "${INPUT_FILE}"`);
    console.log("   ✅ SQLite dump generated.");
  } catch (err: any) {
    console.error("   ❌ Failed to generate SQLite dump:", err.message);
    process.exit(1);
  }

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Error: Input file "${INPUT_FILE}" not found.`);
    process.exit(1);
  }

  console.log("✂️ Processing and cleaning SQL dump file...");
  const content = fs.readFileSync(INPUT_FILE, 'utf8');
  const lines = content.split(/\r?\n/);
  const outLines: string[] = [];

  // Drop existing tables first to ensure a clean D1 execution
  outLines.push("PRAGMA foreign_keys=OFF;");

  for (let line of lines) {
    // 1. Strip transaction statements which are rejected by D1
    if (line.startsWith("BEGIN TRANSACTION") || line.startsWith("COMMIT")) {
      continue;
    }

    // 2. Check if the line is an INSERT statement exceeding D1's 100KB statement limit
    if (line.length > 90000 && line.startsWith("INSERT INTO slug_details VALUES")) {
      const match = line.match(/^INSERT INTO slug_details VALUES\('(movie|show|person)',(\d+),'/);
      if (match) {
        const type = match[1];
        const tmdbId = match[2];
        const prefixLength = match[0].length;
        // Strip prefix and trailing ');'
        const jsonStringEscaped = line.substring(prefixLength, line.length - 3);

        // Split the large string into safe chunks of 80KB each
        const chunks = splitEscapedString(jsonStringEscaped, 80000);
        
        // Initial insert with the first chunk
        outLines.push(`INSERT INTO slug_details VALUES('${type}',${tmdbId},'${chunks[0]}');`);
        
        // Append remaining chunks via UPDATE concatenation
        for (let i = 1; i < chunks.length; i++) {
          outLines.push(`UPDATE slug_details SET detail_json = detail_json || '${chunks[i]}' WHERE type = '${type}' AND tmdb_id = ${tmdbId};`);
        }
        continue;
      }
    }

    outLines.push(line);
  }

  fs.writeFileSync(OUTPUT_FILE, outLines.join('\n'), 'utf8');
  console.log(`🎉 Successfully cleaned and split SQL dump into "${OUTPUT_FILE}"`);

  // Delete raw dump file
  try {
    fs.unlinkSync(INPUT_FILE);
    console.log("🗑️ Cleaned up temporary raw dump.sql file.");
  } catch {
    // ignore
  }
}

main();
