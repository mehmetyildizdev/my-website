import { PlaybackState } from './types';

export interface TimelineState {
  positionSeconds: number;
  progress: number | null;
  isExpired: boolean;
}

export function calculateTimelineState({
  playback,
  serverNowMs,
  localElapsedSeconds,
}: {
  playback: PlaybackState | null;
  serverNowMs: number;
  localElapsedSeconds: number;
}): TimelineState {
  if (!playback) {
    return { positionSeconds: 0, progress: null, isExpired: true };
  }

  const state = playback.state;
  // Terminal states hide immediately
  if (state === 'stopped' || state === 'completed' || state === 'error') {
    return { positionSeconds: 0, progress: null, isExpired: true };
  }

  // Calculate remaining lifetime based on remote clocks
  const remainingLifetimeMs = playback.expiresAtMs - serverNowMs;
  const isExpired = remainingLifetimeMs <= 0 || localElapsedSeconds * 1000 >= remainingLifetimeMs;

  if (isExpired) {
    return { positionSeconds: 0, progress: null, isExpired: true };
  }

  // Account for remote latency: difference between worker receipt and serverNowMs
  const remoteAgeSeconds = Math.max(0, (serverNowMs - playback.receivedAtMs) / 1000);

  const initialPos = Math.min(
    Math.max((playback.positionSeconds ?? 0) + (state === 'playing' ? remoteAgeSeconds : 0), 0),
    playback.durationSeconds ?? Number.POSITIVE_INFINITY,
  );

  const displayedPos = Math.min(
    Math.max(initialPos + (state === 'playing' ? localElapsedSeconds : 0), 0),
    playback.durationSeconds ?? Number.POSITIVE_INFINITY,
  );

  const duration = playback.durationSeconds ?? null;
  const progress = duration && duration > 0 ? Math.min(Math.max(displayedPos / duration, 0), 1) : null;

  return {
    positionSeconds: displayedPos,
    progress,
    isExpired: false,
  };
}
