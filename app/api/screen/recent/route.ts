import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { writeRecentWatchListCache } from './helper';

export const dynamic = "force-dynamic"; // never cache this route

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'lib/screen/data/recent.json');
    let data;
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      data = await writeRecentWatchListCache();
    }
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[api/screen/recent] Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch recent watches" }, { status: 500 });
  }
}
