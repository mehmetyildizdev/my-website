'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlaybackState } from './types';
import { fetchNowPlaying } from './client';

interface NowPlayingContextProps {
  playback: PlaybackState | null;
  serverNowMs: number;
  loading: boolean;
}

const NowPlayingContext = createContext<NowPlayingContextProps>({
  playback: null,
  serverNowMs: 0,
  loading: true,
});

export function NowPlayingProvider({ children }: { children: React.ReactNode }) {
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [serverNowMs, setServerNowMs] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let expiryTimer: NodeJS.Timeout | null = null;

    function checkPlaybackStatus() {
      fetchNowPlaying(controller.signal)
        .then((res) => {
          const pb = res.playback;
          if (!pb) {
            setPlayback(null);
            setServerNowMs(res.serverNowMs);
            return;
          }

          // Terminal states hide immediately
          const state = pb.state;
          if (state === 'stopped' || state === 'completed' || state === 'error') {
            setPlayback(null);
            setServerNowMs(res.serverNowMs);
            return;
          }

          // Validate if observation age is within 5 minutes (300,000 ms) of server time
          const observationAgeMs = res.serverNowMs - pb.observedAtMs;
          if (observationAgeMs > 5 * 60 * 1000) {
            setPlayback(null);
            setServerNowMs(res.serverNowMs);
            return;
          }

          setPlayback(pb);
          setServerNowMs(res.serverNowMs);

          // Schedule next validation check 3 seconds BEFORE snapshot expires to prevent unmount flash while fetching
          const remainingLifetimeMs = pb.expiresAtMs - res.serverNowMs;
          const nextCheckMs = Math.max(2000, remainingLifetimeMs - 3000);

          expiryTimer = setTimeout(() => {
            checkPlaybackStatus();
          }, nextCheckMs);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Failed to fetch now playing:', err);
            setPlayback(null);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }

    checkPlaybackStatus();

    return () => {
      controller.abort();
      if (expiryTimer) {
        clearTimeout(expiryTimer);
      }
    };
  }, []);

  return <NowPlayingContext.Provider value={{ playback, serverNowMs, loading }}>{children}</NowPlayingContext.Provider>;
}

export function useNowPlaying() {
  return useContext(NowPlayingContext);
}
