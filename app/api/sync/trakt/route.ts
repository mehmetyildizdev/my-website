// app/api/sync/trakt/route.ts
// Quick Sync, Pipeline Test: synchronous — waits for completion, then redirects.
// Full Sync: fires in background, redirects immediately.
//   The sync continues running server-side; check terminal logs for progress.

import { syncRecentTraktHistory } from '@/lib/screen/sync';
import { NextResponse } from 'next/server';
import { redirectTo } from '@/lib/screen/utils/redirect';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const envSecret = process.env.MY_API_PHRASE || '';

  if (!envSecret || !secret || secret !== envSecret) {
    return new Response(
      JSON.stringify({ error: '🔒 Access Denied: Invalid sync secret phrase.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const isFullSync = searchParams.get('full') === 'true';
  const limitPerPage = parseInt(searchParams.get('limit') ?? '100', 10);
  const maxPages = searchParams.has('pages') ? parseInt(searchParams.get('pages')!, 10) : Infinity;

  if (isFullSync) {
    // Fire-and-forget: respond immediately, sync runs in the background.
    // Progress is visible in the server terminal.
    syncRecentTraktHistory(limitPerPage, true, maxPages).catch((err) => {
      console.error('[Full Sync] Fatal error:', err.message);
    });
    return redirectTo('/collection/screen/stats');
  }

  // Quick Sync / Pipeline Test: wait for completion before redirecting.
  try {
    await syncRecentTraktHistory(limitPerPage, false, maxPages);
  } catch (error: any) {
    console.error('Sync error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return redirectTo('/collection/screen/stats');
}
