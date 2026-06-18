import { exchangeTraktCode } from "@/lib/screen/trakt";
import { NextResponse } from "next/server";
import { redirectTo } from "@/lib/screen/utils/redirect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    await exchangeTraktCode(code);
    return redirectTo("/collection/screen");
  } catch (error) {
    console.error("Error in Trakt callback:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with Trakt" },
      { status: 500 },
    );
  }
}
