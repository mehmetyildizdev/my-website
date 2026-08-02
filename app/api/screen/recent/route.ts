import { NextResponse } from 'next/server';
import { query, loadQuery } from '@/lib/screen/db';
import { revalidatePath } from 'next/cache';

// Daily automatic background revalidation (86400 seconds = 24 hours)
export const revalidate = 86400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const forceRevalidate = searchParams.get('revalidate') === 'true' || Boolean(secret);
  const envSecret = process.env.MY_API_PHRASE || process.env.REVALIDATE_SECRET || '';

  // On-Demand Revalidation Trigger
  if (forceRevalidate) {
    if (!envSecret || secret === envSecret) {
      revalidatePath('/api/screen/recent');
      revalidatePath('/collection/screen');
    }
  }

  try {
    const res = await query(loadQuery('dashboard/recent_history.sql'));
    return NextResponse.json(res.rows, {
      headers: {
        'Cache-Control': forceRevalidate ? 'no-store, no-cache, must-revalidate' : 's-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('[api/screen/recent] Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch recent watches' }, { status: 500 });
  }
}
