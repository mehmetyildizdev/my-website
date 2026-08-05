// components/screen/slugs/genre/GenreBackground.tsx
// Modular, responsive genre background.
// Supports both:
//   - "container": Fluid CSS corner-anchored vector motif icons + single container corner bracket frame.
//   - "repeat": Layered repeating SVG pattern tiles with slow drift animation for hero/full-page backgrounds.

import React from 'react';
import { getGenreTheme, TOKEN_VAR } from './genreThemes';
import { CornerBrackets, RepeatPattern, getGenreMotifMeta, type Anchor } from './motifs';

interface GenreBackgroundProps {
  genres: { name: string }[];
  /** 0–1 overall intensity. Lower for very text-dense sections. */
  intensity?: number;
  /** Enable slow drift animation (still respects reduced-motion). */
  animated?: boolean;
  /** "container" for card/header containers, "repeat" for cards/tiling backgrounds. */
  variant?: 'container' | 'repeat';
  /** "normal" for headers, "small" for compact card tiles like FactTile. */
  size?: 'normal' | 'small';
  className?: string;
}

// Literal animation drift classes for repeat variant
const DRIFTS = [
  'motion-safe:animate-motifDriftA',
  'motion-safe:animate-motifDriftB',
  'motion-safe:animate-motifDriftC',
  'motion-safe:animate-motifDriftD',
  'motion-safe:animate-motifDriftE',
];

// Corner placement CSS classes (normal vs small container cards)
const ANCHOR_CORNER_CLASSES_NORMAL: Record<Anchor, string> = {
  tl: 'top-3 left-3 sm:top-5 sm:left-5',
  tr: 'top-3 right-3 sm:top-5 sm:right-5',
  bl: 'bottom-3 left-3 sm:bottom-5 sm:left-5',
  br: 'bottom-3 right-3 sm:bottom-5 sm:right-5',
  c: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

const ANCHOR_CORNER_CLASSES_SMALL: Record<Anchor, string> = {
  tl: 'top-1 left-1 sm:top-1.5 sm:left-1.5',
  tr: 'top-1 right-1 sm:top-1.5 sm:right-1.5',
  bl: 'bottom-1 left-1 sm:bottom-1.5 sm:left-1.5',
  br: 'bottom-1 right-1 sm:bottom-1.5 sm:right-1.5',
  c: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

// Tiered offset classes for multiple genres assigned to the same corner quadrant
const CORNER_TIER_OFFSETS_NORMAL: Record<Anchor, string[]> = {
  tl: ['translate-x-0 translate-y-0', 'translate-x-12 translate-y-4', 'translate-x-4 translate-y-12'],
  tr: ['translate-x-0 translate-y-0', '-translate-x-12 translate-y-4', '-translate-x-4 translate-y-12'],
  bl: ['translate-x-0 translate-y-0', 'translate-x-12 -translate-y-4', 'translate-x-4 -translate-y-12'],
  br: ['translate-x-0 translate-y-0', '-translate-x-12 -translate-y-4', '-translate-x-4 -translate-y-12'],
  c: ['translate-x-0 translate-y-0', 'translate-x-10 translate-y-6', '-translate-x-10 -translate-y-6'],
};

const CORNER_TIER_OFFSETS_SMALL: Record<Anchor, string[]> = {
  tl: ['translate-x-0 translate-y-0', 'translate-x-5 translate-y-1', 'translate-x-1 translate-y-5'],
  tr: ['translate-x-0 translate-y-0', '-translate-x-5 translate-y-1', '-translate-x-1 translate-y-5'],
  bl: ['translate-x-0 translate-y-0', 'translate-x-5 -translate-y-1', 'translate-x-1 -translate-y-5'],
  br: ['translate-x-0 translate-y-0', '-translate-x-5 -translate-y-1', '-translate-x-1 -translate-y-5'],
  c: ['translate-x-0 translate-y-0', 'translate-x-4 translate-y-2', '-translate-x-4 -translate-y-2'],
};

// Per-layer motif opacity decays as more genres stack
const MOTIF_OPACITY = [0.85, 0.65, 0.45, 0.35, 0.25];

export default function GenreBackground({
  genres,
  intensity = 1,
  animated = true,
  variant = 'container',
  size = 'normal',
  className = '',
}: GenreBackgroundProps) {
  const safeGenres = genres ?? [];
  const themes = safeGenres.map((g) => ({ name: g.name, theme: getGenreTheme(g.name) }));
  const layers = themes.slice(0, 5);

  const isContainer = variant === 'container';
  const isSmall = size === 'small';
  const primaryMeta = safeGenres[0] ? getGenreMotifMeta(safeGenres[0].name) : null;

  const cornerClasses = isSmall ? ANCHOR_CORNER_CLASSES_SMALL : ANCHOR_CORNER_CLASSES_NORMAL;
  const tierOffsets = isSmall ? CORNER_TIER_OFFSETS_SMALL : CORNER_TIER_OFFSETS_NORMAL;
  const iconSizeClass = isSmall
    ? 'w-5 h-5 sm:w-6 sm:h-6 opacity-60'
    : 'w-[clamp(2.75rem,7vw,5.5rem)] h-[clamp(2.75rem,7vw,5.5rem)] drop-shadow-md';

  // Build the blended glow: one radial per genre, summed in a single background.
  const glowLayers = layers
    .map(({ theme }, i) => {
      const isMain = ['drama', 'action', 'thriller', 'comedy', 'adventure'].includes(theme.label.toLowerCase());
      const baseAlpha = isMain ? 0.31 : 0.13;
      const alpha = (baseAlpha - i * 0.031) * intensity;
      const pos = theme.glowPos;

      return `radial-gradient(${theme.glowSpread} at ${pos}, color-mix(in oklch, ${TOKEN_VAR[theme.token]}, transparent ${Math.round(
        (1 - alpha) * 100
      )}%), transparent 100%)`;
    })
    .join(', ');

  // Count corner quadrant occurrences to calculate non-overlapping offsets
  const anchorCounts: Record<Anchor, number> = { tl: 0, tr: 0, bl: 0, br: 0, c: 0 };

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Blended composite radial glow */}
      <div className="absolute inset-0 z-0 opacity-80" style={{ backgroundImage: glowLayers }} />

      {/* ── Variant 1: Container Mode (Corner-Anchored Icons + Outer Corner Bracket Frame) ── */}
      {isContainer ? (
        <>
          {/* Single, unified outer corner bracket frame */}
          {primaryMeta && <CornerBrackets style={primaryMeta.bracketStyle} size={size} className="z-10" />}

          {/* Fluid Corner-Anchored Vector Motif Icons */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {layers.map(({ name, theme }, i) => {
              const meta = getGenreMotifMeta(name);
              const Icon = meta.Icon;
              const anchor = meta.anchor;

              const tierIndex = anchorCounts[anchor] % 3;
              anchorCounts[anchor] += 1;

              const cornerClass = cornerClasses[anchor] || cornerClasses.c;
              const tierOffset = tierOffsets[anchor]?.[tierIndex] || '';
              const opacity = (MOTIF_OPACITY[i] ?? 0.3) * intensity;

              return (
                <div
                  key={`${name}-${i}`}
                  className={`absolute transition-all duration-500 ${cornerClass} ${tierOffset}`}
                  style={{
                    color: TOKEN_VAR[theme.token],
                    opacity,
                  }}
                >
                  <Icon className={`${iconSizeClass} transition-transform duration-300 hover:scale-105`} />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* ── Variant 2: Repeat Mode (Layered Repeating SVG Patterns with Slow Drift Animation) ── */
        <div className="absolute inset-0 z-10">
          {layers.map(({ name, theme }, i) => {
            const drift = animated ? DRIFTS[i % DRIFTS.length] : '';
            const opacity = (MOTIF_OPACITY[i] ?? 0.05) * intensity;

            return (
              <div
                key={`repeat-${name}-${i}`}
                className="absolute inset-0"
                style={{ color: TOKEN_VAR[theme.token], opacity }}
              >
                <div className={`absolute inset-0 ${drift}`} style={{ transformOrigin: 'center' }}>
                  <RepeatPattern genreName={name} uid={`${i}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtle background vignette for legibility */}
      <div className="absolute inset-0 z-20 bg-radial from-transparent via-transparent to-background/40" />
    </div>
  );
}
