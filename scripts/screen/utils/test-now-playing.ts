/*
 * Usage:
 *   pnpm tsx scripts/screen/utils/update-analytics.ts
 */

import { calculateTimelineState } from '../../../components/screen/now-playing/timeline';
import assert from 'assert';

console.log('Running Now Playing Timeline Engine Tests...');

// Helper builder for mock playback objects
function createMockPlayback(overrides = {}) {
  return {
    schemaVersion: 2,
    sessionId: 'session-123',
    sequence: 1,
    state: 'playing' as const,
    isPlaying: true,
    isLoading: false,
    isSeeking: false,
    positionSeconds: 100,
    durationSeconds: 1000,
    progress: 0.1,
    observedAtMs: 100000,
    receivedAtMs: 100100,
    expiresAtMs: 400100, // Expires 5 minutes after receivedAtMs (approx)
    media: {
      key: 'movie:123',
      mediaType: 'movie',
      title: 'Mock Movie',
      posterPath: '/poster.jpg',
      backdropPath: '/backdrop.jpg',
      releaseDate: '2026-01-01',
    },
    ...overrides,
  };
}

// Test 1: playback: null renders no component
{
  const state = calculateTimelineState({
    playback: null,
    serverNowMs: 100200,
    localElapsedSeconds: 0,
  });
  assert.strictEqual(state.isExpired, true, 'Null playback must be expired/hidden');
  assert.strictEqual(state.progress, null, 'Progress must be null for null playback');
  console.log('✓ Test 1: playback: null renders no component');
}

// Test 2: A playing snapshot starts at server-adjusted position and advances locally
{
  const playback = createMockPlayback({
    state: 'playing',
    positionSeconds: 100,
    receivedAtMs: 100100,
  });

  // serverNowMs is 100500, so latency = (100500 - 100100) / 1000 = 0.4s.
  // Initial position should be 100 + 0.4 = 100.4s.
  // At localElapsedSeconds = 5s, display position should be 100.4 + 5s = 105.4s.
  const state = calculateTimelineState({
    playback,
    serverNowMs: 100500,
    localElapsedSeconds: 5,
  });
  assert.strictEqual(state.positionSeconds, 105.4, 'Position should advance with remote age and local elapsed time');
  assert.strictEqual(state.isExpired, false, 'Should not be expired');
  console.log('✓ Test 2: Playing snapshot advances locally');
}

// Test 3: Paused/loading/seeking snapshots do not advance
{
  const pausedPlayback = createMockPlayback({
    state: 'paused',
    positionSeconds: 100,
    receivedAtMs: 100100,
  });
  const loadingPlayback = createMockPlayback({
    state: 'loading',
    positionSeconds: 100,
    receivedAtMs: 100100,
  });
  const seekingPlayback = createMockPlayback({
    state: 'seeking',
    positionSeconds: 100,
    receivedAtMs: 100100,
  });

  const states = [pausedPlayback, loadingPlayback, seekingPlayback].map((pb) =>
    calculateTimelineState({
      playback: pb,
      serverNowMs: 100500,
      localElapsedSeconds: 5,
    }),
  );

  for (const s of states) {
    assert.strictEqual(s.positionSeconds, 100, 'Non-playing state should not advance');
    assert.strictEqual(s.isExpired, false, 'Should not be expired');
  }
  console.log('✓ Test 3: Non-playing states (paused/loading/seeking) do not advance');
}

// Test 4: Position clamps to duration and progress clamps to 100%
{
  const playback = createMockPlayback({
    state: 'playing',
    positionSeconds: 950,
    durationSeconds: 1000,
    receivedAtMs: 100100,
  });
  // If local elapsed is 100s, total position = 950 + (100500 - 100100)/1000 + 100 = 1050.4s.
  // Clamped position should be 1000s, and progress should be 1.0 (100%).
  const state = calculateTimelineState({
    playback,
    serverNowMs: 100500,
    localElapsedSeconds: 100,
  });
  assert.strictEqual(state.positionSeconds, 1000, 'Position must clamp to duration');
  assert.strictEqual(state.progress, 1, 'Progress must clamp to 1.0 (100%)');
  console.log('✓ Test 4: Clamping behaves correctly');
}

// Test 5: The component hides when its local expiry timer fires
{
  const playback = createMockPlayback({ expiresAtMs: 400100, receivedAtMs: 100100 });
  // serverNowMs = 100100, so remaining lifetime = 300,000ms (300 seconds).
  // If localElapsedSeconds is 301 seconds, it should mark it as expired.
  const state = calculateTimelineState({
    playback,
    serverNowMs: 100100,
    localElapsedSeconds: 301,
  });
  assert.strictEqual(state.isExpired, true, 'Must expire when elapsed time exceeds remaining lifetime');
  console.log('✓ Test 5: Expired states hide');
}

// Test 6: Terminal states render nothing
{
  const stoppedPlayback = createMockPlayback({ state: 'stopped' });
  const completedPlayback = createMockPlayback({ state: 'completed' });
  const errorPlayback = createMockPlayback({ state: 'error' });

  for (const pb of [stoppedPlayback, completedPlayback, errorPlayback]) {
    const state = calculateTimelineState({
      playback: pb,
      serverNowMs: 100100,
      localElapsedSeconds: 0,
    });
    assert.strictEqual(state.isExpired, true, 'Terminal state must render nothing (isExpired = true)');
  }
  console.log('✓ Test 6: Terminal states render nothing');
}

// Test 7: Missing duration degrades cleanly
{
  const playback = createMockPlayback({ durationSeconds: null, progress: null });
  const state = calculateTimelineState({
    playback,
    serverNowMs: 100500,
    localElapsedSeconds: 5,
  });
  assert.strictEqual(state.progress, null, 'Progress must be null when duration is missing');
  assert.strictEqual(state.positionSeconds, 105.4, 'Position should still advance normally without duration');
  console.log('✓ Test 7: Missing duration degrades cleanly');
}

// Test 8: Missing artwork/metadata
{
  const playback = createMockPlayback({
    media: {
      title: 'No Art Movie',
      posterPath: null,
      backdropPath: null,
      stillPath: null,
    },
  });
  const state = calculateTimelineState({
    playback,
    serverNowMs: 100100,
    localElapsedSeconds: 0,
  });
  assert.strictEqual(state.isExpired, false, 'Missing artwork should not cause expiry');
  console.log('✓ Test 8: Missing artwork/metadata degrades cleanly');
}

console.log('All Now Playing tests passed successfully!');
