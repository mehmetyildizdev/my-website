import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// All screen paths to revalidate after database updates
const SCREEN_PATHS = [
  "/collection/screen",
  "/collection/screen/charts",
  "/collection/screen/stats",
  "/collection/screen/m",
  "/collection/screen/s",
  "/collection/screen/p",
  "/api/screen/recent",
];

function handleRevalidate(secret: string | null) {
  const envSecret = process.env.REVALIDATE_SECRET || process.env.MY_API_PHRASE || "";

  if (!envSecret || !secret || secret !== envSecret) {
    return NextResponse.json({ error: "🔒 Access Denied: Invalid sync secret phrase." }, { status: 401 });
  }

  // Passing 'layout' recursively purges all dynamic sub-paths (/collection/screen/p/[id], /collection/screen/m/[id], etc.)
  for (const p of SCREEN_PATHS) {
    revalidatePath(p, "page");
    revalidatePath(p, "layout");
  }

  console.log("[api/screen/revalidate] Cache purged recursively for all screen paths & sub-paths.");
  return NextResponse.json({ revalidated: true, paths: SCREEN_PATHS, mode: "recursive layout & page" });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    return handleRevalidate(secret);
  } catch (error: any) {
    console.error("[api/screen/revalidate] Error:", error.message);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const secret = body?.secret || new URL(req.url).searchParams.get("secret");
    return handleRevalidate(secret);
  } catch (error: any) {
    console.error("[api/screen/revalidate] Error:", error.message);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
