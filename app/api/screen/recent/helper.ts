import fs from 'fs';
import path from 'path';
import { query, loadQuery } from "@/lib/screen/db";

export async function writeRecentWatchListCache() {
  const result = await query(loadQuery("dashboard/recent_history.sql"));
  const dataDir = path.join(process.cwd(), 'lib/screen/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, 'recent.json');
  fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2), 'utf8');
  return result.rows;
}
