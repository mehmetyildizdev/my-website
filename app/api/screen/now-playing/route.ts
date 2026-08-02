import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // never cache this route

export async function GET() {
  const url = process.env.NEXT_PUBLIC_NOW_PLAYING_WORKER_URL;
  if (!url) {
    console.error('[api/screen/now-playing] NEXT_PUBLIC_NOW_PLAYING_WORKER_URL is not defined in the environment.');
    return NextResponse.json({ playback: null, serverNowMs: Date.now() });
  }

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[api/screen/now-playing] Worker returned non-2xx status: ${res.status}`);
      return NextResponse.json({ playback: null, serverNowMs: Date.now() });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[api/screen/now-playing] Error fetching from worker:', error.message);
    // Silent recovery: return null playback on error to keep the page clean
    return NextResponse.json({ playback: null, serverNowMs: Date.now() });
  }
}
