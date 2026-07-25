import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// All screen paths to revalidate after a materialized view refresh
const SCREEN_PATHS = [
  "/collection/screen",
  "/collection/screen/charts",
  "/collection/screen/stats",
  "/collection/screen/m",
  "/collection/screen/s",
  "/collection/screen/p",
  "/api/screen/recent",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const secret = body?.secret;

    if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    for (const p of SCREEN_PATHS) {
      revalidatePath(p);
    }

    console.log("[api/screen/revalidate] Cache purged for all screen paths.");
    return NextResponse.json({ revalidated: true, paths: SCREEN_PATHS });
  } catch (error: any) {
    console.error("[api/screen/revalidate] Error:", error.message);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
