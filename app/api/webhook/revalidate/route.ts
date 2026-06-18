import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    // Secret verification to prevent unauthorized pings
    const secret = req.nextUrl.searchParams.get("secret");
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    const body = await req.json();
    const { _type, slug } = body;

    console.log(`[Webhook] Revalidating ${_type} with slug: ${slug}`);

    // 1. Next.js Revalidation
    // Always revalidate the lists and home page to reflect new content
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/blog/archive");

    // Revalidate the specific post page if applicable
    if (_type === "post" && slug) {
      revalidatePath(`/blog/post/${slug}`);
    }

    // 2. IndexNow Notification (Bing/Yandex)
    // This tells search engines immediately that content has changed
    const indexNowKey = process.env.INDEXNOW_KEY;
    if (indexNowKey) {
      const urlsToNotify = [
        "https://mehmetyildiz.dev/",
        "https://mehmetyildiz.dev/blog",
        "https://mehmetyildiz.dev/about"
      ];

      if (_type === "post" && slug) {
        urlsToNotify.push(`https://mehmetyildiz.dev/blog/post/${slug}`);
      }

      try {
        const indexNowResponse = await fetch("https://www.bing.com/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            host: "mehmetyildiz.dev",
            key: indexNowKey,
            keyLocation: `https://mehmetyildiz.dev/${indexNowKey}.txt`,
            urlList: urlsToNotify,
          }),
        });
        
        if (indexNowResponse.ok) {
          console.log("[IndexNow] Successfully notified search engines");
        } else {
          console.error("[IndexNow] Failed to notify search engines:", await indexNowResponse.text());
        }
      } catch (e) {
        console.error("[IndexNow] Error during fetch:", e);
      }
    }

    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      indexNowTriggered: !!indexNowKey,
      now: new Date().toISOString() 
    });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ success: false, message: "Webhook processing failed" }, { status: 500 });
  }
}
