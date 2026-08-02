'use client';

import NowPlayingCard from '@/components/screen/now-playing/NowPlayingCard';
import NowPlayingSidebar from '@/components/screen/now-playing/NowPlayingSidebar';
import { PlaybackState } from '@/components/screen/now-playing/types';

const SERVER_NOW = 1784313500200;
const RECEIVED_NOW = 1784313500100;
const EXPIRED_NOW = 1784313800100; // 5 mins later

const MOCK_MOVIE_PLAYING: PlaybackState = {
  state: 'playing',
  isPlaying: true,
  isLoading: false,
  isSeeking: false,
  positionSeconds: 120,
  durationSeconds: 7200,
  observedAtMs: RECEIVED_NOW - 100,
  receivedAtMs: RECEIVED_NOW,
  expiresAtMs: EXPIRED_NOW,
  media: {
    mediaType: 'movie',
    title: 'Avatar: Fire and Ash',
    posterPath: '/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg',
    backdropPath: '/u8DU5fkLoM5tTRukzPC31oGPxaQ.jpg',
    releaseDate: '2025-12-17',
  },
};

const MOCK_COMPLETED_PLAYBACK: PlaybackState = {
  state: 'playing',
  isPlaying: true,
  isLoading: false,
  isSeeking: false,
  positionSeconds: 11840,
  durationSeconds: 11840,
  observedAtMs: RECEIVED_NOW - 100,
  receivedAtMs: RECEIVED_NOW,
  expiresAtMs: EXPIRED_NOW,
  media: {
    mediaType: 'movie',
    title: 'Avatar: Fire and Ash (Completed)',
    posterPath: '/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg',
    backdropPath: '/u8DU5fkLoM5tTRukzPC31oGPxaQ.jpg',
    releaseDate: '2025-12-17',
  },
};

const MOCK_EPISODE_PLAYING: PlaybackState = {
  state: 'playing',
  isPlaying: true,
  isLoading: false,
  isSeeking: false,
  positionSeconds: 300,
  durationSeconds: 3600,
  observedAtMs: RECEIVED_NOW - 100,
  receivedAtMs: RECEIVED_NOW,
  expiresAtMs: EXPIRED_NOW,
  media: {
    mediaType: 'episode',
    seriesTitle: 'House of the Dragon',
    episodeTitle: 'The Narrow Sea',
    seasonNumber: 1,
    episodeNumber: 4,
    posterPath: '/poster.jpg',
    backdropPath: '/backdrop.jpg',
    stillPath: '/still.jpg',
    releaseDate: '2022-09-11',
  },
};

const MOCK_MOVIE_PAUSED: PlaybackState = {
  state: 'paused',
  isPlaying: false,
  isLoading: false,
  isSeeking: false,
  positionSeconds: 2400,
  durationSeconds: 7200,
  observedAtMs: RECEIVED_NOW - 100,
  receivedAtMs: RECEIVED_NOW,
  expiresAtMs: EXPIRED_NOW,
  media: {
    mediaType: 'movie',
    title: 'Interstellar',
    posterPath: '/gEU2QvHwM27slKeJ67lI6Uqz0R5.jpg',
    backdropPath: '/rAiXDVeHKzTsi68hZxf5EQ14g6z.jpg',
    releaseDate: '2014-11-05',
  },
};

const MOCK_EPISODE_LOADING: PlaybackState = {
  state: 'loading',
  isPlaying: false,
  isLoading: true,
  isSeeking: false,
  positionSeconds: 42,
  durationSeconds: 1200,
  observedAtMs: RECEIVED_NOW - 100,
  receivedAtMs: RECEIVED_NOW,
  expiresAtMs: EXPIRED_NOW,
  media: {
    mediaType: 'episode',
    seriesTitle: 'Breaking Bad',
    episodeTitle: 'Ozymandias',
    seasonNumber: 5,
    episodeNumber: 14,
    posterPath: '/poster_bb.jpg',
    stillPath: '/still_bb.jpg',
    releaseDate: '2013-09-15',
  },
};

const MOCK_MISSING_DURATION: PlaybackState = {
  state: 'playing',
  isPlaying: true,
  isLoading: false,
  isSeeking: false,
  positionSeconds: 450,
  durationSeconds: null,
  observedAtMs: RECEIVED_NOW - 100,
  receivedAtMs: RECEIVED_NOW,
  expiresAtMs: EXPIRED_NOW,
  media: {
    mediaType: 'movie',
    title: 'Unknown Live Stream',
    posterPath: null,
    backdropPath: null,
    releaseDate: '2026-01-01',
  },
};

const MOCK_EXPIRED: PlaybackState = {
  state: 'playing',
  isPlaying: true,
  isLoading: false,
  isSeeking: false,
  positionSeconds: 500,
  durationSeconds: 1000,
  observedAtMs: RECEIVED_NOW,
  receivedAtMs: RECEIVED_NOW,
  expiresAtMs: SERVER_NOW - 10, // Already expired
  media: {
    mediaType: 'movie',
    title: 'Expired Movie',
    posterPath: '/poster.jpg',
  },
};

export default function NowPlayingPreviewPage() {
  return (
    <div className="space-y-12 pb-24">
      <header>
        <h1 className="font-poppins text-3xl font-bold text-gold">Now Playing — Previews</h1>
        <p className="mt-2 text-sm text-quicksilver">
          Visual sandbox to inspect standard and compact (sidebar) versions of the Now Playing component under different playback scenarios.
        </p>
      </header>

      {/* Grid for different states */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Full Card Previews (takes 8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-xl font-bold text-titanium font-poppins border-b border-border/10 pb-2">Full Dashboard Cards</h2>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-quicksilver uppercase tracking-wider">1. Movie Active Playback (Avatar)</h3>
            <NowPlayingCard playback={MOCK_MOVIE_PLAYING} serverNowMs={SERVER_NOW} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-quicksilver uppercase tracking-wider">
              2. Episode Active Playback (House of the Dragon)
            </h3>
            <NowPlayingCard playback={MOCK_EPISODE_PLAYING} serverNowMs={SERVER_NOW} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-quicksilver uppercase tracking-wider">3. Paused Movie (Interstellar)</h3>
            <NowPlayingCard playback={MOCK_MOVIE_PAUSED} serverNowMs={SERVER_NOW} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-quicksilver uppercase tracking-wider">4. Loading Episode (Breaking Bad)</h3>
            <NowPlayingCard playback={MOCK_EPISODE_LOADING} serverNowMs={SERVER_NOW} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-quicksilver uppercase tracking-wider">5. Missing Duration & Artwork (Degraded)</h3>
            <NowPlayingCard playback={MOCK_MISSING_DURATION} serverNowMs={SERVER_NOW} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-quicksilver uppercase tracking-wider">
              6. Expired / Stopped (Expected: Renders nothing)
            </h3>
            <div className="p-4 rounded-xl border border-dashed border-border/20 text-xs text-center text-quicksilver/60">
              <NowPlayingCard playback={MOCK_EXPIRED} serverNowMs={SERVER_NOW} />
              (Blank space above indicates successful null-rendering)
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-quicksilver uppercase tracking-wider">
              7. Watch Completed & Syncing (Avatar Finished)
            </h3>
            <NowPlayingCard playback={MOCK_COMPLETED_PLAYBACK} serverNowMs={SERVER_NOW} />
          </div>
        </div>

        {/* Sidebar Compact Previews (takes 4 cols) */}
        <div className="lg:col-span-4 space-y-8 border-l border-border/10 pl-0 lg:pl-8">
          <h2 className="text-xl font-bold text-titanium font-poppins border-b border-border/10 pb-2">Compact Sidebar Previews</h2>

          <div className="max-w-60 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-quicksilver uppercase tracking-wider mb-2">1. Movie Playing</h3>
              <NowPlayingSidebar playback={MOCK_MOVIE_PLAYING} serverNowMs={SERVER_NOW} />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-quicksilver uppercase tracking-wider mb-2">2. Episode Playing</h3>
              <NowPlayingSidebar playback={MOCK_EPISODE_PLAYING} serverNowMs={SERVER_NOW} />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-quicksilver uppercase tracking-wider mb-2">3. Movie Paused</h3>
              <NowPlayingSidebar playback={MOCK_MOVIE_PAUSED} serverNowMs={SERVER_NOW} />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-quicksilver uppercase tracking-wider mb-2">4. Episode Loading</h3>
              <NowPlayingSidebar playback={MOCK_EPISODE_LOADING} serverNowMs={SERVER_NOW} />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-quicksilver uppercase tracking-wider mb-2">5. Degraded State</h3>
              <NowPlayingSidebar playback={MOCK_MISSING_DURATION} serverNowMs={SERVER_NOW} />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-quicksilver uppercase tracking-wider mb-2">6. Watch Completed / Syncing</h3>
              <NowPlayingSidebar playback={MOCK_COMPLETED_PLAYBACK} serverNowMs={SERVER_NOW} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
