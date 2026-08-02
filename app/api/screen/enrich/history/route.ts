import { enrichMissingHistory } from '@/lib/screen/sync/history';
import { redirectTo } from '@/lib/screen/utils/redirect';
import { log } from '@/lib/screen/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const envSecret = process.env.MY_API_PHRASE || '';

  if (!envSecret || !secret || secret !== envSecret) {
    return new Response(JSON.stringify({ error: '🔒 Access Denied: Invalid sync secret phrase.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const limit = parseInt(searchParams.get('limit') ?? '1000', 10);

  log.info(`[API Trigger] /api/screen/enrich/history requested (limit=${limit})`);

  try {
    await enrichMissingHistory(limit);
  } catch (err: any) {
    log.error(`[Enrich History] Fatal error: ${err.message}`);
  }

  return redirectTo('/collection/screen/stats');
}
