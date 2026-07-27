'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/shadcn/ui/card';
import { useNowPlayingTimeline } from './useNowPlayingTimeline';
import { PlaybackState } from './types';
import { Pause, Loader2, Search, Clapperboard, Calendar, Check } from 'lucide-react';

function formatSeconds(totalSecs: number): string {
  if (isNaN(totalSecs) || !isFinite(totalSecs) || totalSecs < 0) {
    return '0:00';
  }
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = Math.floor(totalSecs % 60);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
}

export default function NowPlayingCard({
  playback: mockPlayback,
  serverNowMs: mockServerNowMs,
}: {
  playback?: PlaybackState | null;
  serverNowMs?: number;
} = {}) {
  const { playback, position, progress, isExpired, isFinished, isPaused } = useNowPlayingTimeline(
    mockPlayback,
    mockServerNowMs
  );

  // If expired, stopped, or no active media, render nothing
  if (isExpired || !playback || !playback.media) {
    return null;
  }

  const media = playback.media;
  const posterArtwork = media.posterPath || media.stillPath || media.backdropPath;
  const posterUrl = posterArtwork ? `https://image.tmdb.org/t/p/w342${posterArtwork}` : null;

  const backdropArtwork = media.backdropPath || media.stillPath || media.posterPath;
  const backdropUrl = backdropArtwork ? `https://image.tmdb.org/t/p/w780${backdropArtwork}` : null;

  return (
    <Card className="relative overflow-hidden lg:px-6 bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-gold/20">
      {/* Ambient glowing backdrop motif */}
      {backdropUrl && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            className="object-cover opacity-[0.08] blur-xl scale-110"
            unoptimized
          />
        </div>
      )}

      <CardContent className="relative z-10 p-4 md:p-6 flex flex-col gap-4">
        {/* Main Content Row: Artwork on left, Details on right */}
        <div className="flex flex-row gap-4 md:gap-6 items-start">
          {/* Poster Artwork container */}
          <div className="relative shrink-0 w-24 sm:w-28 md:w-32 aspect-2/3 rounded-lg overflow-hidden bg-obsidian border border-border/10 shadow-lg">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={media.title || 'Media poster'}
                fill
                priority
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-quicksilver/40">
                <Clapperboard className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* Text Details & Metadata */}
          <div className="flex-1 min-w-0 flex flex-col justify-start">
            {/* Header Line */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-[10px] uppercase tracking-widest font-bold font-poppins px-1.5 py-0.5 rounded bg-pearl/40 border border-border/10 ${
                  isFinished ? 'text-emerald' : isPaused ? 'text-topaz' : 'text-gold'
                }`}
              >
                {isFinished ? 'Syncing' : isPaused ? 'Paused' : 'Now Playing'}
              </span>
              <span className="text-[10px] text-quicksilver/40 font-medium">•</span>
              <span className="text-[10px] text-quicksilver/70 font-medium font-rubik">
                Live from MemoStream
              </span>
            </div>

            {/* Media Title */}
            <h2 className="text-lg md:text-2xl font-black text-gold tracking-tight line-clamp-1 font-poppins leading-tight">
              {media.seriesTitle || media.title || 'Unknown Title'}
            </h2>

            {/* Subtitles (Episode info or Release year) */}
            {media.mediaType === 'episode' ? (
              <p className="text-md text-platinum/90 mt-0.5 line-clamp-1 leading-normal font-rubik font-medium">
                S{String(media.seasonNumber ?? 0).padStart(2, '0')}E
                {String(media.episodeNumber ?? 0).padStart(2, '0')} •{' '}
                {media.episodeTitle || 'Untitled Episode'}
              </p>
            ) : (
              media.releaseDate && (
                <p className="text-xs md:text-sm text-platinum/75 mt-0.5 line-clamp-1 leading-normal font-rubik font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0 text-quicksilver/50" />
                  {new Date(media.releaseDate).getFullYear()}
                </p>
              )
            )}

            {/* Tagline */}
            {media.tagline && (
              <p className="text-sm italic text-ruby/70 font-rubik line-clamp-1 mt-1">
                "{media.tagline}"
              </p>
            )}

            {/* Overview snippet (Fills desktop nicely) */}
            {media.overview && (
              <p className="text-sm text-quicksilver/80 leading-relaxed line-clamp-2 font-rubik mt-1.5 hidden sm:line-clamp-2">
                {media.overview}
              </p>
            )}

            {/* Watch Complete notice */}
            {isFinished && (
              <p className="text-xs text-emerald font-semibold font-rubik mt-1.5 flex items-center gap-1.5 animate-pulse">
                <Check className="h-3.5 w-3.5 text-emerald shrink-0" />
                Watch complete • Queueing watch history sync
              </p>
            )}
          </div>
        </div>

        {/* Full Width Progress Timeline Bar at Bottom */}
        <div className="w-full pt-1">
          {progress !== null && playback.durationSeconds ? (
            <div className="space-y-1.5">
              {/* Progress bar and Accessibility attributes */}
              <div
                className="relative w-full h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={playback.durationSeconds}
                aria-valuenow={Math.round(position)}
                aria-label="Playback progress"
              >
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                    isFinished
                      ? 'bg-linear-to-r from-emerald to-teal-400'
                      : isPaused
                        ? 'bg-linear-to-r from-topaz to-amber-500'
                        : 'bg-linear-to-r from-gold to-topaz'
                  }`}
                  style={{ width: `${isFinished ? 100 : progress * 100}%` }}
                />
              </div>
              {/* Time Stamps */}
              <div className="flex justify-between items-center text-[10px] text-quicksilver font-bold font-rubik tracking-wider uppercase">
                <span className={isPaused ? 'text-topaz' : ''}>
                  {isPaused ? 'Paused at ' : ''}
                  {formatSeconds(isFinished ? playback.durationSeconds : position)}
                </span>
                <span>{formatSeconds(playback.durationSeconds)}</span>
              </div>
            </div>
          ) : (
            /* Fallback time format if duration is missing */
            <div className="text-[10px] text-quicksilver font-bold font-rubik tracking-wider uppercase flex items-center gap-1.5">
              <span>{isPaused ? 'Paused at:' : 'Elapsed:'}</span>
              <span className={isPaused ? 'text-topaz' : 'text-gold'}>
                {formatSeconds(position)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
