import { NowPlayingResponse } from './types';

let cachedResponse: NowPlayingResponse | null = null;
let lastFetchTime = 0;
let activeFetchPromise: Promise<NowPlayingResponse> | null = null;

export async function fetchNowPlaying(signal?: AbortSignal): Promise<NowPlayingResponse> {
  const now = Date.now();

  // 1. Return cache if fetched within the last 2 seconds (covers Strict Mode / concurrent mounts)
  if (cachedResponse && now - lastFetchTime < 2000) {
    return cachedResponse;
  }

  // 2. If a fetch is already in flight, return that promise
  if (activeFetchPromise) {
    return activeFetchPromise;
  }

  // Client-side calls hit our Next.js API proxy to avoid CORS issues
  const url = '/api/screen/now-playing';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second request timeout

  activeFetchPromise = (async () => {
    try {
      const res = await fetch(url, {
        signal: signal ? abortSignalAny([signal, controller.signal]) : controller.signal,
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch now playing: ${res.status}`);
      }

      const data = (await res.json()) as NowPlayingResponse;
      cachedResponse = data;
      lastFetchTime = Date.now();
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  })();

  // Handle errors on the cleanup branch to prevent unhandled rejection leakage
  activeFetchPromise
    .catch(() => {})
    .finally(() => {
      activeFetchPromise = null;
    });

  return activeFetchPromise;
}

/**
 * Helper to merge two abort signals.
 */
function abortSignalAny(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  const onAbort = () => {
    controller.abort();
    cleanup();
  };
  const cleanup = () => {
    for (const signal of signals) {
      signal.removeEventListener('abort', onAbort);
    }
  };
  for (const signal of signals) {
    if (signal.aborted) {
      onAbort();
      break;
    }
    signal.addEventListener('abort', onAbort);
  }
  return controller.signal;
}
