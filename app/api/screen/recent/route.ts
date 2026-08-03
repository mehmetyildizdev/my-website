import { NextResponse } from 'next/server';
import { query, loadQuery } from '@/lib/screen/db';
import { revalidatePath, unstable_cache } from 'next/cache';

// 7-day automatic background revalidation fallback (refreshed on-demand via app sync triggers)
export const revalidate = 604800;

const getCachedRecentWatches = unstable_cache(
  async () => {
    const res = await query(loadQuery('dashboard/recent_history.sql'));
    return res.rows;
  },
  ['recent-watches-cache'],
  {
    revalidate: 604800, // 7 days TTL
    tags: ['recent-watches'],
  }
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const forceRevalidate = searchParams.get('revalidate') === 'true' || Boolean(secret);
  const envSecret = process.env.MY_API_PHRASE || process.env.REVALIDATE_SECRET || '';

  // On-Demand Revalidation Trigger
  if (forceRevalidate) {
    if (!envSecret || secret === envSecret) {
      revalidatePath('/api/screen/recent', 'page');
      revalidatePath('/collection/screen', 'page');
    }
  }

  try {
    const data = forceRevalidate
      ? (await query(loadQuery('dashboard/recent_history.sql'))).rows
      : await getCachedRecentWatches();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': forceRevalidate
          ? 'no-store, no-cache, must-revalidate'
          : 'public, max-age=0, s-maxage=604800, stale-while-revalidate=2592000',
      },
    });
  } catch (error: any) {
    console.error('[api/screen/recent] Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch recent watches' }, { status: 500 });
  }
}
