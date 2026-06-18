// components/screen/slugs/detail/PersonCard.tsx
// Reusable person tile used across cast + every crew department.
//
// Rules baked in:
//   • People WITHOUT a photo are NOT linked (per requirement) and render as a
//     quiet monogram tile.
//   • People WITH a photo link to their /p/[id] page.
//   • All images are `unoptimized` (no Vercel image caching).
//
// Two visual variants:
//   • "portrait"  — taller poster-style tile (used for headline roles)
//   • "rectangle" — compact rectangular tile (used for dense cast grids)

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TEXT, BORDER, BORDER_HOVER, RING_HOVER, TEXT_HOVER } from './tokens';

interface PersonCardProps {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  /** Role / character / job line under the name. */
  role?: string | null;
  /** Optional secondary line (e.g. episode count). */
  meta?: string | null;
  token?: Token;
  variant?: 'portrait' | 'rectangle';
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function PersonCard({
  tmdb_id,
  name,
  profile_path,
  role,
  meta,
  token = 'gold',
  variant = 'portrait',
}: PersonCardProps) {
  const [loaded, setLoaded] = useState(false);
  const hasPhoto = Boolean(profile_path);

  const isPortrait = variant === 'portrait';

  const media = (
    <div
      className={
        isPortrait
          ? `relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-obsidian border ${BORDER[token]} ${hasPhoto ? BORDER_HOVER[token] : ''} transition-all duration-300`
          : `relative mx-auto aspect-3/4 w-full overflow-hidden rounded-xl bg-obsidian border ${BORDER[token]} ${hasPhoto ? BORDER_HOVER[token] : ''} transition-all duration-300`
      }
    >
      {hasPhoto ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 bg-pearl/10 dark:bg-obsidian/40 animate-pulse z-0" />
          )}
          <Image
            src={`https://image.tmdb.org/t/p/w342${profile_path}`}
            alt={name}
            fill
            unoptimized
            onLoad={() => setLoaded(true)}
            sizes="(max-width: 768px) 33vw, 160px"
            className={`object-cover object-top transition-all duration-500 z-10 group-hover:scale-[1.04] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span
            className={`font-poppins font-bold ${TEXT[token]} ${isPortrait ? 'text-2xl' : 'text-lg'} opacity-50 select-none`}
          >
            {initials(name) || '?'}
          </span>
        </div>
      )}

      {/* gradient floor for legibility on portrait variant */}
      {isPortrait && hasPhoto && (
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-obsidian/80 to-transparent z-10" />
      )}
    </div>
  );

  const caption = (
    <div className="mt-2 px-1">
      <p
        className={`${isPortrait ? 'text-base md:text-lg' : 'text-xs md:text-sm'} font-semibold leading-tight line-clamp-2 text-titanium ${
          hasPhoto ? `${TEXT_HOVER[token]} transition-colors` : ''
        }`}
      >
        {name}
      </p>
      {role && (
        <p
          className={`${isPortrait ? 'text-xs md:text-sm' : 'text-[11px] md:text-xs'} leading-snug ${token === 'gold' ? 'text-platinum' : TEXT[token]} opacity-90 line-clamp-2 mt-0.5`}
        >
          {role}
        </p>
      )}
      {meta && (
        <p className={`${isPortrait ? 'text-xs' : 'text-[10px]'} text-quicksilver mt-0.5`}>
          {meta}
        </p>
      )}
    </div>
  );

  if (!hasPhoto) {
    // No photo → not a link. Rendered as a plain, non-interactive tile.
    return (
      <div className="block opacity-90" title={`${name}${role ? ` — ${role}` : ''}`}>
        {media}
        {caption}
      </div>
    );
  }

  return (
    <Link
      href={`/collection/screen/p/${tmdb_id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
    >
      {media}
      {caption}
    </Link>
  );
}
