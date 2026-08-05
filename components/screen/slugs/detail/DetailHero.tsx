// components/screen/slugs/detail/DetailHero.tsx
// Cinematic header. The backdrop is a full-bleed image that fills the whole hero
// card and is *overlaid* with the genre-based background (tint + motifs) plus
// legibility gradients. Height is driven by the content, so the image's bottom
// edge lines up with the poster's bottom edge — the poster no longer pokes out
// below the artwork. Shared by both movie and show pages.

'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import GenreBackground from '../genre/GenreBackground';
import GenreChips from './GenreChips';
import { getGenreTheme } from '../genre/genreThemes';
import { BG_SOFT } from './tokens';
import { Skeleton } from '@/components/shadcn/ui/skeleton';

interface DetailHeroProps {
  title: string;
  originalTitle?: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  genres: { name: string }[];
  ratings: ReactNode;
  watchBadges?: ReactNode;
}

export default function DetailHero({ title, originalTitle, posterPath, backdropPath, genres, ratings, watchBadges }: DetailHeroProps) {
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  const primaryTheme = getGenreTheme(genres[0]?.name);
  const token = primaryTheme?.token || 'quicksilver';

  return (
    <header className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-border/10 shadow-2xl">
        {/* ── Full-bleed backdrop artwork ─────────────────────────────── */}
        <div className="absolute inset-0 bg-card/40">
          {backdropPath ? (
            <>
              {!backdropLoaded && <Skeleton className={`absolute inset-0 rounded-none bg-transparent ${BG_SOFT[token]}`} />}
              <Image
                src={`https://image.tmdb.org/t/p/w1280${backdropPath}`}
                alt={title}
                fill
                unoptimized
                priority
                onLoad={() => setBackdropLoaded(true)}
                className={`object-cover object-center transition-opacity duration-700 ${backdropLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              {/* Genre background overlaid ON TOP of the image: tints the artwork
                 with the title's genre identity while staying subtle. */}
              <div className="absolute inset-0 mix-blend-luminosity opacity-85">
                <GenreBackground genres={genres} intensity={1.2} variant="container" />
              </div>
            </>
          ) : (
            /* No backdrop image: render container motifs with strong visibility */
            <div className="absolute inset-0">
              <GenreBackground genres={genres} intensity={1.2} variant="container" />
            </div>
          )}

          {/* Legibility wash — strong toward the bottom & left where the text
             lives, lighter at the top so the artwork still reads. */}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-background/10" />
          <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/25 to-transparent" />
        </div>

        {/* ── Content (poster + identity) — drives the hero height ─────── */}
        <div className="relative z-10 flex flex-col gap-5 p-5 pt-44 sm:pt-56 md:flex-row md:items-end md:gap-8 md:p-8 md:pt-72">
          {/* Poster */}
          <div className="relative w-36 md:w-52 shrink-0 aspect-2/3 self-start md:self-end overflow-hidden rounded-2xl border border-border/20 bg-pearl shadow-2xl ring-1 ring-gold/10">
            {posterPath ? (
              <>
                {!posterLoaded && <Skeleton className={`absolute inset-0 rounded-2xl bg-transparent ${BG_SOFT[token]} z-0`} />}
                <Image
                  src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                  alt={title}
                  fill
                  unoptimized
                  priority
                  onLoad={() => setPosterLoaded(true)}
                  className={`object-cover transition-opacity duration-500 z-10 ${posterLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-quicksilver text-sm">No Poster</div>
            )}
          </div>

          {/* Identity */}
          <div className="flex flex-col justify-end gap-3 min-w-0">
            <GenreChips genres={genres} />

            <h1 className="font-poppins text-3xl md:text-5xl font-bold tracking-tight leading-tight text-titanium text-shadow-sm">
              {title}
            </h1>

            {originalTitle && originalTitle !== title && <p className="text-sm text-quicksilver -mt-1">{originalTitle}</p>}

            <div className="flex flex-wrap items-center gap-4">{ratings}</div>

            {watchBadges && <div className="flex flex-wrap items-center gap-3 mt-1">{watchBadges}</div>}
          </div>
        </div>
      </div>
    </header>
  );
}
