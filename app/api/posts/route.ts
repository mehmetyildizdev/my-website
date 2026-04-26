import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/post";

export async function GET() {
  const posts = await getAllPosts();

  return NextResponse.json(posts, {
    headers: {
      "Cache-Control": "public, s-maxage=86400", // Cache for 1 day
    },
  });
}
