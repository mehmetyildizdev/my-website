import { getTraktAuthUrl } from "@/lib/screen/trakt";
import { NextResponse } from "next/server";

export async function GET() {
  const url = await getTraktAuthUrl();
  return NextResponse.redirect(url);
}
