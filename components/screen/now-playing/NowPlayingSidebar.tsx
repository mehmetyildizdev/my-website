'use client';

import Image from 'next/image';
import { useNowPlayingTimeline } from './useNowPlayingTimeline';
import { PlaybackState } from './types';
import { Clapperboard } from 'lucide-react';

function formatSeconds(totalSecs: number): string {
  if (isNaN(totalSecs) || !isFinite(totalSecs) || totalSecs < 0) {
    return '0:00';
  }
  const m = Math.floor(totalSecs / 60);
  const s = Math.floor(totalSecs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function NowPlayingSidebar({
  playback: mockPlayback,
  serverNowMs: mockServerNowMs,
}: {
  playback?: PlaybackState | null;
  serverNowMs?: number;
} = {}) {
  const {
    playback,
    position,
    progress,
    isExpired,
    isFinished,
    isPaused,
  } = useNowPlayingTimeline(mockPlayback, mockServerNowMs);

  // If expired, stopped, or no active media, render nothing
  if (isExpired || !playback || !playback.media) {
    return null;
  }

  const media = playback.media;
  const artwork = media.posterPath || media.stillPath || media.backdropPath;
  const imageUrl = artwork ? `https://image.tmdb.org/t/p/w92${artwork}` : null;

  return (
    <div className="mx-3 mt-4 p-2.5 rounded-xl border border-border/10 bg-pearl/20 shadow-md transition-all duration-300 hover:border-gold/30 hover:bg-pearl/30">
      <div className="flex gap-2.5 items-center">
        {/* Thumbnail on left (2:3 portrait) */}
        <div className="relative shrink-0 w-10 aspect-2/3 rounded-md overflow-hidden bg-obsidian border border-border/5">
          {imageUrl ? (
            <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-quicksilver/30">
              <Clapperboard className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Text Details on right */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 leading-none mb-1">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              {isFinished ? (
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald" />
              ) : isPaused ? (
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-topaz" />
              ) : playback.state === 'playing' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sapphire" />
              )}
            </span>
            <span
              className={`text-[9px] uppercase tracking-wider font-bold font-poppins ${
                isFinished
                  ? 'text-emerald'
                  : isPaused
                    ? 'text-topaz'
                    : 'text-gold'
              }`}
            >
              {isFinished ? 'Syncing' : isPaused ? 'Paused' : 'Now Playing'}
            </span>
          </div>

          <h4 className="text-[11px] font-semibold text-titanium line-clamp-1 leading-tight font-poppins">
            {media.seriesTitle || media.title || 'Unknown'}
          </h4>

          <p className="text-[10px] text-quicksilver line-clamp-1 leading-normal font-rubik mt-0.5">
            {media.mediaType === 'episode'
              ? `S${String(media.seasonNumber ?? 0).padStart(2, '0')}E${String(media.episodeNumber ?? 0).padStart(2, '0')}`
              : media.releaseDate
                ? new Date(media.releaseDate).getFullYear()
                : 'Movie'}
          </p>
        </div>
      </div>

      {/* Progress slider bar */}
      {progress !== null && playback.durationSeconds ? (
        <div className="mt-2.5">
          <div
            className="w-full h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={playback.durationSeconds}
            aria-valuenow={Math.round(position)}
            aria-label="Playback progress"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFinished
                  ? 'bg-emerald'
                  : isPaused
                    ? 'bg-topaz'
                    : 'bg-gold'
              }`}
              style={{ width: `${isFinished ? 100 : progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-quicksilver/70 font-mono mt-1">
            <span className={isPaused ? 'text-topaz' : ''}>
              {formatSeconds(isFinished ? playback.durationSeconds : position)}
            </span>
            <span>{formatSeconds(playback.durationSeconds)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-[9px] text-quicksilver/70 font-mono flex items-center justify-between">
          <span>{isPaused ? 'Paused' : 'Elapsed'}</span>
          <span className={isPaused ? 'text-topaz' : 'text-gold'}>{formatSeconds(position)}</span>
        </div>
      )}
    </div>
  );
}
