import { useState, useEffect } from 'react';
import { useNowPlaying } from './NowPlayingContext';
import { calculateTimelineState } from './timeline';
import { PlaybackState } from './types';

export function useNowPlayingTimeline(
  mockPlayback?: PlaybackState | null,
  mockServerNowMs?: number
) {
  const context = useNowPlaying();
  const playback = mockPlayback !== undefined ? mockPlayback : context.playback;
  const serverNowMs = mockServerNowMs !== undefined ? mockServerNowMs : context.serverNowMs;

  const [localElapsed, setLocalElapsed] = useState(0);
  const [prevPlayback, setPrevPlayback] = useState(playback);

  // Synchronously reset localElapsed during render when playback snapshot updates
  if (playback !== prevPlayback) {
    setPrevPlayback(playback);
    setLocalElapsed(0);
  }

  useEffect(() => {
    if (!playback) return;

    const state = playback.state;
    if (state !== 'playing') return;

    const fetchedAt = performance.now();
    const interval = setInterval(() => {
      setLocalElapsed((performance.now() - fetchedAt) / 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [playback]);

  const state = calculateTimelineState({
    playback,
    serverNowMs,
    localElapsedSeconds: localElapsed,
  });

  const isPaused = playback
    ? playback.state === 'paused' ||
      (!playback.isPlaying &&
        playback.state !== 'loading' &&
        playback.state !== 'seeking' &&
        playback.state !== 'stopped' &&
        playback.state !== 'completed')
    : false;

  const isFinished = !isPaused && playback?.durationSeconds
    ? state.positionSeconds >= playback.durationSeconds
    : false;

  return {
    playback,
    position: state.positionSeconds,
    progress: state.progress,
    isExpired: state.isExpired,
    isFinished,
    isPaused,
  };
}
