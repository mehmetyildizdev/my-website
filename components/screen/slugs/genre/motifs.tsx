// components/screen/slugs/genre/motifs.tsx
// Genre-specific SVG motifs in two variants:
//
// "container" — Non-repeating, corner-emphasis compositions for small cards.
//   Uses a viewBox-based SVG (no <pattern>) with corner bracket decorations
//   and the genre's iconic artwork placed at its anchor corner. Accent elements
//   appear at the opposite corner. Designed to frame card content.
//
// "repeating" — Improved repeating patterns for full-page / hero backgrounds.
//   Uses <pattern> + <rect fill> to tile across any container size.
//   Each pattern is more detailed and genre-specific than the original set.
//
// Both variants paint with `currentColor` so the parent sets the theme tint.
// Motifs render at low opacity behind body text — keep them textural.

import React from "react";

export interface MotifProps {
  /** Unique id suffix so multiple stacked <pattern> defs never collide. */
  uid: string;
  className?: string;
  /** "container" = corner-emphasis/full page. "repeat" = repeating patterns. */
  variant?: "container" | "repeat";
  token?: "ruby" | "sapphire" | "emerald" | "amethyst" | "topaz";
  anchor?: Anchor;
}

/**
 * Computes coordinate offsets for the container variant based on the gemstone group (token)
 * and active anchor quadrant. Pushes stacked corners inwards to form clean tiered clusters.
 */
export function getThemeOffset(token?: string, anchor?: Anchor) {
  if (!token || !anchor) return { x: 0, y: 0 };
  
  if (anchor === "c") {
    switch (token) {
      case "ruby":     return { x: 0,   y: -20 };
      case "sapphire": return { x: 25,  y: 15  };
      case "emerald":  return { x: -25, y: 15  };
      case "amethyst": return { x: 25,  y: -15 };
      case "topaz":    return { x: -25, y: -15 };
      default:         return { x: 0,   y: 0   };
    }
  }

  // Corner multipliers to offset inwards
  const sx = (anchor === "tl" || anchor === "bl") ? 1 : -1;
  const sy = (anchor === "tl" || anchor === "tr") ? 1 : -1;

  switch (token) {
    case "ruby":     return { x: 0,       y: 0       };
    case "sapphire": return { x: 25 * sx, y: 10 * sy };
    case "emerald":  return { x: 10 * sx, y: 25 * sy };
    case "amethyst": return { x: 35 * sx, y: 35 * sy };
    case "topaz":    return { x: 45 * sx, y: 15 * sy };
    default:         return { x: 0,       y: 0       };
  }
}

const FULL = "absolute inset-0 h-full w-full";

// ── Shared SVG paths (reused across genres) ────────────────────────────────

/** 4-point sparkle / starburst. */
const SPARK =
  "M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z";
/** Simple heart. */
const HEART =
  "M0 -4 C0 -8 -7 -8 -7 -2 C-7 4 0 9 0 12 C0 9 7 4 7 -2 C7 -8 0 -8 0 -4 Z";
/** 5-point star. */
const STAR5 =
  "M0 -10 L2.4 -3 L9.5 -3 L3.5 1.5 L5.9 8.1 L0 4 L-5.9 8.1 L-3.5 1.5 L-9.5 -3 L-2.4 -3 Z";

// ── Corner bracket styles (viewBox 400×300 coordinates) ────────────────────

/** Sharp L-brackets with small tick marks — Action, Crime, War, Thriller, Documentary. */
function TacticalCorners() {
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" >
      <path d="M50 10 H10 V50" />
      <line x1="10" y1="26" x2="16" y2="26" />
      <line x1="26" y1="10" x2="26" y2="16" />
      <path d="M350 10 H390 V50" />
      <line x1="390" y1="26" x2="384" y2="26" />
      <line x1="374" y1="10" x2="374" y2="16" />
      <path d="M50 290 H10 V250" />
      <line x1="10" y1="274" x2="16" y2="274" />
      <path d="M350 290 H390 V250" />
      <line x1="390" y1="274" x2="384" y2="274" />
    </g>
  );
}

/** Curved scroll brackets — Fantasy, Romance, Drama, History. */
function OrnateCorners() {
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinecap="round" opacity="0.38" >
      <path d="M55 10 Q10 10 10 55" />
      <path d="M22 10 Q10 10 10 22" />
      <path d="M345 10 Q390 10 390 55" />
      <path d="M378 10 Q390 10 390 22" />
      <path d="M55 290 Q10 290 10 245" />
      <path d="M22 290 Q10 290 10 278" />
      <path d="M345 290 Q390 290 390 245" />
      <path d="M378 290 Q390 290 390 278" />
    </g>
  );
}

/** Stepped circuit brackets with junction dots — Sci-Fi, Animation. */
function TechCorners() {
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1.2" opacity="0.45">
      <path d="M52 10 H24 V18 H10 V52" />
      <circle cx="10" cy="10" r="2.5" fill="currentColor" />
      <path d="M348 10 H376 V18 H390 V52" />
      <circle cx="390" cy="10" r="2.5" fill="currentColor" />
      <path d="M52 290 H24 V282 H10 V248" />
      <circle cx="10" cy="290" r="2.5" fill="currentColor" />
      <path d="M348 290 H376 V282 H390 V248" />
      <circle cx="390" cy="290" r="2.5" fill="currentColor" />
    </g>
  );
}

/** Smooth quarter-arc brackets — Comedy, Family, Kids, Music, Adventure, Reality, Western. */
function RoundCorners() {
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1.6" strokeLinecap="round" opacity="0.35" >
      <path d="M52 10 Q10 10 10 52" />
      <path d="M348 10 Q390 10 390 52" />
      <path d="M52 290 Q10 290 10 248" />
      <path d="M348 290 Q390 290 390 248" />
    </g>
  );
}

/** Clean minimal L-brackets — Mystery, Horror, Politics, Default. */
function SimpleCorners() {
  return (
    <g stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinecap="round" opacity="0.32" >
      <path d="M48 10 H10 V48" />
      <path d="M352 10 H390 V48" />
      <path d="M48 290 H10 V252" />
      <path d="M352 290 H390 V252" />
    </g>
  );
}

/** Wrapper for container variant SVGs — provides the viewBox frame. */
function ContainerSvg({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {children}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Genre Motifs
// ═══════════════════════════════════════════════════════════════════════════

/* ── Action — crossed swords, martial star, impact bursts ────────────── */
export function ActionMotif({ uid, className, variant = "repeat", token = "sapphire" }: MotifProps) {
  const id = `action-${uid}`;
  const offset = getThemeOffset(token, "tr");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <TacticalCorners />
        {/* Crossed swords — TR corner with offset */}
        <g transform={`translate(${340 + offset.x}, ${58 + offset.y})`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
          <g transform="rotate(-40)" fill="none">
            <path d="M0 -30 L3 -6 L5.5 0 L-5.5 0 L-3 -6 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
            <rect x="-9" y="1" width="18" height="3" rx="1" fill="currentColor" fillOpacity="0.5" />
            <rect x="-2" y="5" width="4" height="12" rx="1" fill="currentColor" fillOpacity="0.35" />
            <circle cx="0" cy="20" r="2.5" fill="currentColor" fillOpacity="0.3" />
          </g>
          <g transform="rotate(40)" fill="none">
            <path d="M0 -30 L3 -6 L5.5 0 L-5.5 0 L-3 -6 Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
            <rect x="-9" y="1" width="18" height="3" rx="1" fill="currentColor" fillOpacity="0.5" />
            <rect x="-2" y="5" width="4" height="12" rx="1" fill="currentColor" fillOpacity="0.35" />
            <circle cx="0" cy="20" r="2.5" fill="currentColor" fillOpacity="0.3" />
          </g>
        </g>
        {/* Shuriken / martial star — BL accent */}
        <g transform="translate(55, 248)" fill="currentColor" opacity="0.45">
          <path d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z" />
          <circle cx="0" cy="0" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </g>
        {/* Speed/impact lines from TR */}
        <g stroke="currentColor" strokeWidth="1.2" opacity="0.22" strokeLinecap="round" >
          <line x1="290" y1="25" x2="240" y2="25" />
          <line x1="295" y1="45" x2="230" y2="45" />
          <line x1="300" y1="65" x2="250" y2="65" />
          <line x1="285" y1="85" x2="260" y2="85" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern
          id={id}
          width="110"
          height="110"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(12)"
        >
          {/* Crossed swords - Moved to Center (55, 55) */}
          <g transform="translate(55, 55)" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" >
            <line x1="-16" y1="16" x2="16" y2="-16" />
            <line x1="-16" y1="-16" x2="16" y2="16" />
            <circle cx="0" cy="0" r="4.5" strokeWidth="1.3" />
            <circle cx="0" cy="0" r="1.2" fill="currentColor" />
          </g>
          {/* Shuriken - Moved to BL */}
          <g transform="translate(24, 84)" fill="currentColor" opacity="0.7">
            <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" />
          </g>
          {/* Impact starburst - Moved to TL */}
          <g transform="translate(26, 26)" stroke="currentColor" strokeWidth="1.2" opacity="0.6" >
            <line x1="0" y1="-6" x2="0" y2="6" />
            <line x1="-6" y1="0" x2="6" y2="0" />
            <line x1="-4" y1="-4" x2="4" y2="4" />
            <line x1="4" y1="-4" x2="-4" y2="4" />
          </g>
          {/* Chevrons - Moved to BR */}
          <path d="M72 88 L80 80 L88 88" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Adventure — compass rose, topographic contours, mountain peaks ──── */
export function AdventureMotif({ uid, className, variant = "repeat", token = "amethyst" }: MotifProps) {
  const id = `adv-${uid}`;
  const offset = getThemeOffset(token, "tl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <RoundCorners />
        {/* Compass rose — TL corner with offset */}
        <g transform={`translate(${58 + offset.x}, ${42 + offset.y})`} stroke="currentColor" strokeWidth="1.5" fill="none" >
          <circle cx="0" cy="0" r="30" strokeDasharray="2 3" opacity="0.5" />
          <path d="M0 -26 L5 -7 L0 -2 L-5 -7 Z" fill="currentColor" />
          <path d="M0 26 L5 7 L0 2 L-5 7 Z" fill="currentColor" fillOpacity="0.4" />
          <path d="M26 0 L7 5 L2 0 L7 -5 Z" fill="currentColor" fillOpacity="0.5" />
          <path d="M-26 0 L-7 5 L-2 0 L-7 -5 Z" fill="currentColor" fillOpacity="0.5" />
          <circle cx="0" cy="0" r="3.5" fill="currentColor" />
          <line x1="-18" y1="-18" x2="-6" y2="-6" opacity="0.4" />
          <line x1="18" y1="-18" x2="6" y2="-6" opacity="0.4" />
          <line x1="-18" y1="18" x2="-6" y2="6" opacity="0.4" />
          <line x1="18" y1="18" x2="6" y2="6" opacity="0.4" />
        </g>
        {/* Mountain silhouette — bottom edge */}
        <path d="M120 290 L170 230 L195 260 L230 210 L265 255 L290 220 L330 290 Z" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
        {/* Trail dots — BL accent */}
        <g fill="currentColor" opacity="0.3">
          <circle cx="55" cy="248" r="2.5" />
          <circle cx="70" cy="263" r="1.8" />
          <circle cx="63" cy="280" r="2" />
        </g>
        {/* Topo contour accents */}
        <g stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2">
          <path d="M150 30 Q220 15 300 35" />
          <path d="M140 50 Q210 32 310 52" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="220" height="170" patternUnits="userSpaceOnUse">
          {/* Topographic contours */}
          <g fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M 0 115 C 35 95, 75 95, 110 115 C 145 135, 185 135, 220 115" />
            <path d="M 0 85 C 35 65, 75 65, 110 85 C 145 105, 185 105, 220 85" />
            <path d="M 0 145 C 35 125, 75 125, 110 145 C 145 165, 185 165, 220 145" />
          </g>
          {/* Compass rose - Moved to Center (110, 85) */}
          <g transform="translate(110, 85)" stroke="currentColor" strokeWidth="1.4" fill="none" >
            <circle cx="0" cy="0" r="22" strokeDasharray="2 3" />
            <path d="M0 -18 L4 -5 L0 -1 L-4 -5 Z" fill="currentColor" />
            <path d="M0 18 L4 5 L0 1 L-4 5 Z" fill="currentColor" fillOpacity="0.4" />
            <path d="M18 0 L5 4 L1 0 L5 -4 Z" fill="currentColor" fillOpacity="0.5" />
            <path d="M-18 0 L-5 4 L-1 0 L-5 -4 Z" fill="currentColor" fillOpacity="0.5" />
            <circle cx="0" cy="0" r="3" fill="currentColor" />
          </g>
          {/* Mountain peaks */}
          <path d="M0 170 L30 130 L50 150 L80 110 L110 145 L130 120 L160 170" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Animation — film cel, sprockets, play triangle, confetti ────────── */
export function AnimationMotif({ uid, className, variant = "repeat", token = "amethyst" }: MotifProps) {
  const id = `anim-${uid}`;
  const offset = getThemeOffset(token, "bl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <TechCorners />
        {/* Film cel frame — BL corner with offset */}
        <g transform={`translate(${28 + offset.x}, ${220 + offset.y})`} stroke="currentColor" strokeWidth="2" fill="none" >
          <rect x="0" y="0" width="60" height="45" rx="3" />
          {/* Sprocket holes */}
          <circle cx="-5" cy="10" r="2.5" fill="currentColor" fillOpacity="0.3" />
          <circle cx="-5" cy="22" r="2.5" fill="currentColor" fillOpacity="0.3" />
          <circle cx="-5" cy="34" r="2.5" fill="currentColor" fillOpacity="0.3" />
          {/* Play triangle inside */}
          <path d="M22 14 L42 22.5 L22 31 Z" fill="currentColor" fillOpacity="0.25" strokeWidth="1.5" />
        </g>
        {/* Bouncing confetti — scattered */}
        <g fill="currentColor" opacity="0.35">
          <path d="M340 240 l14 24 l-28 0 z" />
          {/* triangle */}
          <rect x="350" y="60" width="12" height="12" rx="2" transform="rotate(20 356 66)" />
          <circle cx="330" cy="260" r="4" />
          <circle cx="180" cy="30" r="3" opacity="0.25" />
        </g>
        {/* Small star accent — TR */}
        <g transform="translate(360, 40)" fill="currentColor" opacity="0.3">
          <path d={STAR5} transform="scale(0.8)" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="130" height="130" patternUnits="userSpaceOnUse">
          {/* Film cel frame */}
          <g stroke="currentColor" strokeWidth="1.5" fill="none">
            <rect x="15" y="15" width="50" height="38" rx="2" />
            <circle cx="10" cy="22" r="2.5" fill="currentColor" fillOpacity="0.3" />
            <circle cx="10" cy="34" r="2.5" fill="currentColor" fillOpacity="0.3" />
            <circle cx="10" cy="46" r="2.5" fill="currentColor" fillOpacity="0.3" />
            <path d="M28 26 L45 34 L28 42 Z" fill="currentColor" fillOpacity="0.2" />
          </g>
          {/* Confetti shapes */}
          <path d="M85 28 l10 18 l-20 0 z" fill="currentColor" opacity="0.5" />
          <rect x="95" y="80" width="10" height="10" rx="2" fill="currentColor" opacity="0.4" transform="rotate(25 100 85)" />
          <circle cx="45" cy="100" r="3.5" fill="currentColor" opacity="0.45" />
          <circle cx="110" cy="50" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.4" />
          <path d={STAR5} fill="currentColor" transform="translate(80 105) scale(0.6)" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Comedy — theatre masks (happy + sad), confetti, spotlight ────────── */
export function ComedyMotif({ uid, className, variant = "repeat", token = "emerald" }: MotifProps) {
  const id = `com-${uid}`;
  const offset = getThemeOffset(token, "tr");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <RoundCorners />
        {/* Theatre masks pair — TR corner with offset */}
        <g transform={`translate(${320 + offset.x}, ${28 + offset.y})`}>
          {/* Happy mask */}
          <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" >
            <path d="M10 18 C10 8 40 8 40 18 C40 35 32 48 25 50 C18 48 10 35 10 18 Z" fill="currentColor" fillOpacity="0.1" />
            <circle cx="18" cy="24" r="2.5" fill="currentColor" />
            <circle cx="32" cy="24" r="2.5" fill="currentColor" />
            <path d="M16 34 Q25 44 34 34" />
          </g>
          {/* Sad mask — offset, smaller */}
          <g transform="translate(28, 18) scale(0.8)" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" >
            <path d="M10 18 C10 8 40 8 40 18 C40 35 32 48 25 50 C18 48 10 35 10 18 Z" fill="currentColor" fillOpacity="0.07" />
            <circle cx="18" cy="24" r="2.5" fill="currentColor" />
            <circle cx="32" cy="24" r="2.5" fill="currentColor" />
            <path d="M16 38 Q25 30 34 38" />
          </g>
        </g>
        {/* Confetti dots — BL + scatter */}
        <g fill="currentColor" opacity="0.3">
          <circle cx="40" cy="260" r="3" />
          <circle cx="55" cy="248" r="2" />
          <circle cx="30" cy="245" r="2.5" />
          <circle cx="200" cy="268" r="1.8" />
          <circle cx="180" cy="20" r="1.5" />
        </g>
        {/* Spotlight cone from top */}
        <path d="M200 0 L160 90 L240 90 Z" fill="currentColor" fillOpacity="0.03" stroke="none" />
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="140" height="120" patternUnits="userSpaceOnUse">
          {/* Happy mask - Moved to Center */}
          <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" transform="translate(45, 30)" >
            <path d="M8 16 C8 6 38 6 38 16 C38 32 30 42 23 44 C16 42 8 32 8 16 Z" fill="currentColor" fillOpacity="0.06" />
            <circle cx="16" cy="22" r="2" fill="currentColor" />
            <circle cx="30" cy="22" r="2" fill="currentColor" />
            <path d="M14 30 Q23 38 32 30" />
          </g>
          {/* Sad mask — Moved to Center offset */}
          <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" transform="translate(95, 60) scale(0.75)" >
            <path d="M8 16 C8 6 38 6 38 16 C38 32 30 42 23 44 C16 42 8 32 8 16 Z" fill="currentColor" fillOpacity="0.05" />
            <circle cx="16" cy="22" r="2" fill="currentColor" />
            <circle cx="30" cy="22" r="2" fill="currentColor" />
            <path d="M14 34 Q23 26 32 34" />
          </g>
          {/* Confetti */}
          <circle cx="110" cy="20" r="2.5" fill="currentColor" opacity="0.5" />
          <circle cx="25" cy="100" r="2" fill="currentColor" opacity="0.4" />
          <path d={STAR5} fill="currentColor" transform="translate(120 95) scale(0.5)" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Crime — magnifying glass with fingerprint, venetian blinds, noir ── */
export function CrimeMotif({ uid, className, variant = "repeat", token = "ruby" }: MotifProps) {
  const id = `crime-${uid}`;
  const offset = getThemeOffset(token, "br");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <TacticalCorners />
        {/* Magnifying glass with fingerprint — BR corner with offset */}
        <g transform={`translate(${345 + offset.x}, ${232 + offset.y})`} stroke="currentColor" strokeWidth="2" fill="none" >
          <circle cx="0" cy="0" r="20" />
          <line x1="14" y1="14" x2="32" y2="32" strokeWidth="3.5" strokeLinecap="round" />
          {/* Fingerprint inside lens */}
          <path d="M-8 -2 Q-4 -10 4 -6 Q10 -2 6 5 Q2 10 -4 8" strokeWidth="1.2" opacity="0.5" />
          <path d="M-5 0 Q-2 -6 4 -3 Q8 0 4 5" strokeWidth="1.2" opacity="0.4" />
        </g>
        {/* Venetian blind lines — top area */}
        <g stroke="currentColor" strokeWidth="1" opacity="0.15">
          <line x1="100" y1="15" x2="300" y2="15" />
          <line x1="100" y1="30" x2="300" y2="30" />
          <line x1="100" y1="45" x2="300" y2="45" />
          <line x1="100" y1="60" x2="300" y2="60" />
        </g>
        {/* Evidence marker — BL accent */}
        <g transform="translate(55, 252)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" >
          <path d="M-8 -12 h16 v24 L0 16 L-8 12 Z" fill="currentColor" fillOpacity="0.15" />
          <text
            x="0"
            y="2"
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            fontWeight="bold"
            stroke="none"
          >
            1
          </text>
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern
          id={id}
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-6)"
        >
          {/* Venetian blinds */}
          <rect x="0" y="0" width="120" height="7" fill="currentColor" opacity="0.18" />
          <rect x="0" y="28" width="120" height="7" fill="currentColor" opacity="0.18" />
          <rect x="0" y="56" width="120" height="7" fill="currentColor" opacity="0.18" />
          <rect x="0" y="84" width="120" height="7" fill="currentColor" opacity="0.18" />
          {/* Magnifying glass */}
          <g transform="translate(85, 85)" fill="none" stroke="currentColor" strokeWidth="2" >
            <circle cx="12" cy="12" r="9" />
            <line x1="18" y1="18" x2="28" y2="28" strokeWidth="3" strokeLinecap="round" />
          </g>
          {/* Fingerprint whorl accent */}
          <g transform="translate(25, 85)" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" >
            <path d="M0 8 Q4 0 10 4 Q16 8 12 14 Q8 18 4 14" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Documentary — camera viewfinder, film strip, reference grid ─────── */
export function DocumentaryMotif({
  uid,
  className,
  variant = "repeat",
  token = "sapphire",
  anchor = "tl",
}: MotifProps) {
  const id = `doc-${uid}`;
  const offset = getThemeOffset(token, anchor);
  if (variant === "container") {
    const isBR = anchor === "br";
    const vx = isBR ? 315 + offset.x : 25 + offset.x;
    const vy = isBR ? 238 + offset.y : 22 + offset.y;
    const lx = isBR ? 42 : 358;
    const ly = isBR ? 50 : 250;
    return (
      <ContainerSvg className={className}>
        <TacticalCorners />
        {/* Camera viewfinder — anchor corner with offset */}
        <g transform={`translate(${vx}, ${vy})`} stroke="currentColor" strokeWidth="2" fill="none" >
          <rect x="0" y="0" width="60" height="42" rx="2" />
          <circle cx="30" cy="21" r="12" strokeWidth="1.5" />
          <circle cx="30" cy="21" r="4" fill="currentColor" fillOpacity="0.2" />
          {/* Focus corners inside viewfinder */}
          <path d="M6 6 H14 M6 6 V14" strokeWidth="1.2" />
          <path d="M54 6 H46 M54 6 V14" strokeWidth="1.2" />
          <path d="M6 36 H14 M6 36 V28" strokeWidth="1.2" />
          <path d="M54 36 H46 M54 36 V28" strokeWidth="1.2" />
          {/* REC indicator */}
          <circle cx="52" cy="8" r="3" fill="currentColor" fillOpacity="0.4" />
        </g>
        {/* Film strip edge — left/right side */}
        <g fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="0.6" opacity="0.3" transform={isBR ? "translate(388, 0)" : ""} >
          <rect x="2" y="80" width="8" height="6" rx="1" />
          <rect x="2" y="96" width="8" height="6" rx="1" />
          <rect x="2" y="112" width="8" height="6" rx="1" />
          <rect x="2" y="128" width="8" height="6" rx="1" />
        </g>
        {/* Lens circle — opposite accent corner */}
        <g transform={`translate(${lx}, ${ly})`} stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35" >
          <circle cx="0" cy="0" r="16" />
          <circle cx="0" cy="0" r="8" />
          <circle cx="0" cy="0" r="2.5" fill="currentColor" fillOpacity="0.3" />
        </g>
      </ContainerSvg>
    );
  }
  const rx = anchor === "br" ? 36 : 18;
  const ry = anchor === "br" ? 36 : 18;
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="90" height="90" patternUnits="userSpaceOnUse">
          {/* Reference grid */}
          <path d="M90 0 H0 V90" fill="none" stroke="currentColor" strokeWidth="0.7" strokeDasharray="3 3" />
          {/* Camera viewfinder */}
          <g fill="none" stroke="currentColor" strokeWidth="1.5" transform={`translate(${rx}, ${ry})`} >
            <rect x="0" y="0" width="48" height="34" rx="2" />
            <circle cx="24" cy="17" r="9" />
            <circle cx="24" cy="17" r="3" fill="currentColor" fillOpacity="0.2" />
            <rect x="4" y="4" width="5" height="4" fill="currentColor" fillOpacity="0.4" stroke="none" />
            <rect x="39" y="4" width="5" height="4" fill="currentColor" fillOpacity="0.4" stroke="none" />
          </g>
          {/* Lens flare dots */}
          <circle cx="78" cy="72" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="78" cy="72" r="1.5" fill="currentColor" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Drama — tragedy mask, feather quill, manuscript scroll, flowing curtains ── */
export function DramaMotif({ uid, className, variant = "repeat", token = "topaz" }: MotifProps) {
  const id = `drama-${uid}`;
  const offset = getThemeOffset(token, "br");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <OrnateCorners />
        {/* Tragedy mask — BR corner area with offset */}
        <g transform={`translate(${350 + offset.x}, ${205 + offset.y})`} stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" >
          <path d="M8 18 C8 6 42 6 42 18 C42 38 34 52 25 55 C16 52 8 38 8 18 Z" fill="currentColor" fillOpacity="0.08" />
          <circle cx="17" cy="26" r="3" fill="currentColor" />
          <circle cx="33" cy="26" r="3" fill="currentColor" />
          <path d="M15 40 Q25 32 35 40" />
          {/* frown */}
          <path d="M18 30 L19.5 34 L16.5 34 Z" fill="currentColor" stroke="none" />
          {/* nose */}
          <path d="M14 26 L12 36 L15 34 Z" fill="currentColor" opacity="0.6" stroke="none" />
          {/* teardrop on mask */}
        </g>
        {/* Manuscript Scroll + Quill — BR corner area with offset */}
        <g transform={`translate(${295 + offset.x}, ${230 + offset.y})`} stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" >
          {/* Scroll roll */}
          <path d="M-10 15 H20 C25 15 28 10 28 5 C28 0 24 -3 20 -3 H-10 C-14 -3 -18 0 -18 5 C-18 10 -14 15 -10 15 Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M-10 -15 H20 C25 -15 28 -20 28 -25 C28 -30 24 -33 20 -33 H-10 C-14 -33 -18 -30 -18 -25 C-18 -20 -14 -15 -10 -15 Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M-18 -25 V5 M28 -25 V5" />
          {/* Quill Pen */}
          <g transform="translate(15, -10) rotate(-45)">
            <line x1="0" y1="20" x2="0" y2="-15" strokeWidth="1.5" />
            <path d="M-4 -5 C-3 -15 0 -22 0 -22 C0 -22 3 -15 4 -5 C4 5 0 10 0 10" fill="currentColor" fillOpacity="0.2" />
          </g>
        </g>
        {/* Curtain drapes from top corners */}
        <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.2">
          <path d="M10 0 Q20 90 40 160 Q50 210 25 290" />
          <path d="M390 0 Q380 90 360 160 Q350 210 375 290" />
        </g>
        {/* Teardrop accent — TL */}
        <g transform="translate(48, 60)" fill="currentColor" opacity="0.3">
          <path d="M0 -6 Q4 -2 4 3 Q4 8 0 10 Q-4 8 -4 3 Q-4 -2 0 -6 Z" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern
          id={id}
          width="160"
          height="160"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-15)"
        >
          {/* Tragedy mask - Centered */}
          <g transform="translate(55, 50)" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" >
            <path d="M8 18 C8 6 42 6 42 18 C42 38 34 52 25 55 C16 52 8 38 8 18 Z" fill="currentColor" fillOpacity="0.06" />
            <circle cx="17" cy="26" r="2.5" fill="currentColor" />
            <circle cx="33" cy="26" r="2.5" fill="currentColor" />
            <path d="M15 40 Q25 32 35 40" />
            <path d="M18 30 L19.5 34 L16.5 34 Z" fill="currentColor" stroke="none" />
          </g>
          {/* Quill + inkpot - Centered */}
          <g transform="translate(100, 95)" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" >
            <path d="M-8 10 H8 V2 H-8 Z" fill="currentColor" fillOpacity="0.1" />
            <line x1="-3" y1="2" x2="12" y2="-18" />
            <path d="M9 -12 C10 -16 12 -18 12 -18 C12 -18 9 -16 5 -12" />
          </g>
          {/* Teardrops */}
          <path d="M25 110 Q28 113 28 116 Q28 120 25 122 Q22 120 22 116 Q22 113 25 110 Z" fill="currentColor" opacity="0.25" />
          {/* Decorative flourish lines */}
          <path d="M0 80 Q80 85 160 80" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Family — interlocked chain rings, small house, heart accent ──────── */
export function FamilyMotif({ uid, className, variant = "repeat", token = "emerald" }: MotifProps) {
  const id = `fam-${uid}`;
  const offset = getThemeOffset(token, "tl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <RoundCorners />
        {/* Three interlocked rings — TL corner with offset */}
        <g transform={`translate(${60 + offset.x}, ${50 + offset.y})`} stroke="currentColor" strokeWidth="2.5" fill="none" >
          <circle cx="-20" cy="0" r="16" />
          <circle cx="0" cy="-8" r="16" />
          <circle cx="20" cy="0" r="16" />
        </g>
        {/* House silhouette — center-bottom */}
        <g transform="translate(185, 248)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.25" >
          <path d="M-15 0 L0 -15 L15 0 Z" fill="currentColor" fillOpacity="0.1" />
          {/* roof */}
          <rect x="-12" y="0" width="24" height="18" />
          {/* walls */}
          <rect x="-4" y="8" width="8" height="10" fill="currentColor" fillOpacity="0.15" />
          {/* door */}
        </g>
        {/* Heart accent — BR */}
        <g transform="translate(345, 235)" fill="currentColor" opacity="0.3">
          <path d={HEART} transform="scale(1.2)" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="110" height="100" patternUnits="userSpaceOnUse">
          {/* Interlocked rings */}
          <circle cx="20" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="40" cy="22" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="60" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* Small heart */}
          <g transform="translate(85, 75)" fill="currentColor" opacity="0.35">
            <path d={HEART} transform="scale(0.6)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Fantasy — crescent moon, constellation stars, crystal shards ─────── */
export function FantasyMotif({ uid, className, variant = "repeat", token = "amethyst" }: MotifProps) {
  const id = `fan-${uid}`;
  const offset = getThemeOffset(token, "tr");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <OrnateCorners />
        {/* Crescent moon & Constellation — TR corner with offset */}
        <g transform={`translate(${offset.x}, ${offset.y})`}>
          {/* Crescent moon — TR corner */}
          <g transform="translate(348, 42)" fill="currentColor" stroke="currentColor" strokeWidth="1.5" >
            <path d="M0 -20 A 16 16 0 1 0 0 20 A 20 20 0 1 1 0 -20" fillOpacity="0.2" />
          </g>
          {/* Constellation stars — TR area */}
          <g fill="currentColor">
            <path d={SPARK} transform="translate(320, 28) scale(0.7)" />
            <path d={SPARK} transform="translate(375, 65) scale(0.5)" />
            <path d={SPARK} transform="translate(360, 15) scale(0.45)" />
            <path d={SPARK} transform="translate(310, 55) scale(0.55)" />
            {/* Constellation connecting lines */}
            <g stroke="currentColor" strokeWidth="0.7" opacity="0.3" fill="none">
              <line x1="320" y1="28" x2="348" y2="42" />
              <line x1="348" y1="42" x2="375" y2="65" />
              <line x1="310" y1="55" x2="320" y2="28" />
            </g>
          </g>
        </g>
        {/* Crystal shard — BL accent */}
        <g transform="translate(48, 245)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" opacity="0.4" >
          <path d="M0 -18 L8 0 L4 18 L-4 18 L-8 0 Z" />
          <line x1="0" y1="-18" x2="4" y2="18" opacity="0.5" />
        </g>
        {/* Small sparkle dots */}
        <g fill="currentColor" opacity="0.2">
          <circle cx="130" cy="45" r="1.5" />
          <circle cx="260" cy="30" r="1" />
          <circle cx="180" cy="270" r="1.2" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="150" height="150" patternUnits="userSpaceOnUse">
          {/* 4-point sparkle stars */}
          <path d={SPARK} fill="currentColor" transform="translate(32, 36) scale(1.3)" />
          <path d={SPARK} fill="currentColor" transform="translate(110, 68) scale(0.75)" />
          <path d={SPARK} fill="currentColor" transform="translate(68, 120) scale(1.0)" />
          {/* Crescent moon */}
          <path d="M100 28 A 14 14 0 1 0 100 52 A 18 18 0 1 1 100 28" fill="currentColor" />
          {/* Crystal shard */}
          <g transform="translate(28, 100)" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.08" >
            <path d="M0 -12 L5 0 L3 12 L-3 12 L-5 0 Z" />
          </g>
          {/* Constellation lines */}
          <g stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.35">
            <line x1="32" y1="36" x2="110" y2="68" />
            <line x1="110" y1="68" x2="68" y2="120" />
          </g>
          {/* Star dots */}
          <circle cx="18" cy="65" r="1.5" fill="currentColor" opacity="0.4" />
          <circle cx="135" cy="130" r="1" fill="currentColor" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── History — classical ionic column, hourglass, laurel, Greek key ──── */
export function HistoryMotif({ uid, className, variant = "repeat", token = "topaz" }: MotifProps) {
  const id = `hist-${uid}`;
  const offset = getThemeOffset(token, "tr");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <OrnateCorners />
        {/* Ionic column — TR corner with offset */}
        <g transform={`translate(${345 + offset.x - 16}, ${40 + offset.y})`} stroke="currentColor" strokeWidth="2" fill="none" >
          {/* Capital (scroll volutes) */}
          <path d="M-2 0 Q-2 -8 6 -8" strokeWidth="1.5" />
          <path d="M34 0 Q34 -8 26 -8" strokeWidth="1.5" />
          <rect x="0" y="0" width="32" height="4" fill="currentColor" fillOpacity="0.15" />
          {/* Shaft with fluting */}
          <rect x="2" y="4" width="28" height="80" fill="currentColor" fillOpacity="0.05" />
          <line x1="10" y1="4" x2="10" y2="84" strokeWidth="0.8" opacity="0.3" />
          <line x1="16" y1="4" x2="16" y2="84" strokeWidth="0.8" opacity="0.3" />
          <line x1="22" y1="4" x2="22" y2="84" strokeWidth="0.8" opacity="0.3" />
          {/* Base */}
          <rect x="-2" y="84" width="36" height="5" rx="1" fill="currentColor" fillOpacity="0.12" />
          <rect x="-5" y="89" width="42" height="4" rx="1" fill="currentColor" fillOpacity="0.08" />
        </g>
        {/* Scroll accent — BL */}
        <g transform="translate(32, 235)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35" >
          <rect x="0" y="0" width="30" height="22" rx="2" fill="currentColor" fillOpacity="0.06" />
          <path d="M28 4 Q35 4 35 11 Q35 18 28 18" />
          {/* scroll curl */}
          <line x1="5" y1="7" x2="22" y2="7" strokeWidth="0.8" />
          <line x1="5" y1="11" x2="22" y2="11" strokeWidth="0.8" />
          <line x1="5" y1="15" x2="18" y2="15" strokeWidth="0.8" />
        </g>
        {/* Laurel leaf accent — top center */}
        <g transform="translate(200, 18)" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15" opacity="0.3" >
          <path d="M0 0 Q-8 -4 -12 4 Q-6 2 0 0" />
          <path d="M0 0 Q8 -4 12 4 Q6 2 0 0" />
          <path d="M0 -3 Q-10 -8 -15 0 Q-8 -2 0 -3" />
          <path d="M0 -3 Q10 -8 15 0 Q8 -2 0 -3" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="150" height="150" patternUnits="userSpaceOnUse">
          {/* Column */}
          <g fill="none" stroke="currentColor" strokeWidth="2" transform="translate(80, 0)" >
            <line x1="30" y1="12" x2="30" y2="130" />
            <line x1="42" y1="12" x2="42" y2="130" />
            <line x1="54" y1="12" x2="54" y2="130" />
            <path d="M20 12 h44 M20 130 h44" strokeWidth="3.5" />
          </g>
          {/* Hourglass */}
          <g transform="translate(35, 95) scale(0.8)" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" >
            <path d="M8 8 h30 L8 48 h30 Z" />
            <line x1="10" y1="10" x2="28" y2="10" strokeWidth="3" />
            <line x1="10" y1="46" x2="28" y2="46" strokeWidth="3" />
            <circle cx="23" cy="38" r="2" fill="currentColor" />
          </g>
          {/* Laurel leaves */}
          <g transform="translate(100, 120)" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="0.8" >
            <path d="M0 0 Q-6 -3 -10 3 Q-5 1 0 0" />
            <path d="M0 0 Q6 -3 10 3 Q5 1 0 0" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Horror — skull, claw scratches, spider web, drips, bat ──────────── */
export function HorrorMotif({ uid, className, variant = "repeat", token = "ruby" }: MotifProps) {
  const id = `hor-${uid}`;
  const offset = getThemeOffset(token, "tl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <SimpleCorners />
        {/* Skull — TL corner with offset */}
        <g transform={`translate(${30 + offset.x}, ${22 + offset.y})`} stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" >
          <path d="M25 5 C12 5 3 18 3 32 C3 44 10 52 20 55 L20 64 H24 V60 H30 V64 H34 V55 C44 52 51 44 51 32 C51 18 42 5 29 5 Z" fill="currentColor" fillOpacity="0.08" />
          <circle cx="18" cy="28" r="5.5" />
          <circle cx="36" cy="28" r="5.5" />
          <path d="M24 40 L27 44 L30 40" strokeWidth="1.5" />
          <path d="M18 52 v5 M23 52 v5 M28 52 v5 M33 52 v5" strokeWidth="1.3" />
        </g>
        {/* Claw scratch marks from TL corner */}
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.25" >
          <path d="M90 10 C100 60 95 120 88 180" />
          <path d="M108 10 C118 55 114 110 108 165" />
          <path d="M126 10 C134 50 132 100 128 150" />
        </g>
        {/* Spider web — BR corner */}
        <g transform="translate(390, 290)" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.28" >
          <line x1="0" y1="0" x2="-50" y2="0" />
          <line x1="0" y1="0" x2="0" y2="-50" />
          <line x1="0" y1="0" x2="-35" y2="-35" />
          <path d="M-18 0 Q-16 -8 -12 -12 Q-8 -16 0 -18" />
          <path d="M-36 0 Q-32 -16 -24 -24 Q-16 -32 0 -36" />
        </g>
        {/* Drip marks from top */}
        <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" >
          <path d="M200 0 v18 Q200 22 200 24" />
          <path d="M230 0 v12" />
          <path d="M260 0 v22 Q260 28 260 30" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern
          id={id}
          width="160"
          height="200"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(6)"
        >
          {/* Claw scratches */}
          <g fill="none" stroke="currentColor" strokeLinecap="round">
            <path d="M30 0 C40 60 36 130 26 200" strokeWidth="2.5" />
            <path d="M54 0 C64 60 60 130 50 200" strokeWidth="4" />
            <path d="M78 0 C88 60 84 130 74 200" strokeWidth="2" />
          </g>
          {/* Skull mini */}
          <g transform="translate(115, 55) scale(0.45)" stroke="currentColor" strokeWidth="2.5" fill="none" >
            <path d="M25 5 C12 5 3 18 3 32 C3 44 10 52 20 55 L20 60 H34 V55 C44 52 51 44 51 32 C51 18 42 5 29 5 Z" fill="currentColor" fillOpacity="0.1" />
            <circle cx="18" cy="28" r="5" />
            <circle cx="36" cy="28" r="5" />
            <path d="M24 40 L27 44 L30 40" />
          </g>
          {/* Bat silhouette */}
          <path d="M120 140 Q130 130 140 140 Q148 126 155 145 Q142 148 138 143 Q134 148 120 140" fill="currentColor" opacity="0.5" transform="scale(0.7) translate(40, 40)" />
          {/* Drip */}
          <path d="M140 0 v14 Q140 20 140 22" stroke="currentColor" strokeWidth="1" opacity="0.3" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Music — treble clef, beamed notes, equalizer bars, vinyl ─────────── */
export function MusicMotif({ uid, className, variant = "repeat", token = "emerald" }: MotifProps) {
  const id = `mus-${uid}`;
  const offset = getThemeOffset(token, "bl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <RoundCorners />
        {/* Treble clef — BL corner with offset */}
        <g transform={`translate(${58 + offset.x}, ${200 + offset.y})`} stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" >
          <line x1="18" y1="5" x2="18" y2="65" />
          <path d="M18 22 C32 22 32 40 18 40 C8 40 8 52 18 52" strokeWidth="2" />
          <circle cx="14" cy="52" r="6" fill="currentColor" fillOpacity="0.2" strokeWidth="2" />
          <circle cx="18" cy="10" r="3" fill="currentColor" fillOpacity="0.3" />
        </g>
        {/* Beamed notes floating */}
        <g fill="currentColor" opacity="0.35">
          <g transform="translate(100, 230)">
            <circle cx="0" cy="0" r="5" />
            <line x1="5" y1="0" x2="5" y2="-20" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="-6" r="5" />
            <line x1="23" y1="-6" x2="23" y2="-20" stroke="currentColor" strokeWidth="2" />
            <line x1="5" y1="-20" x2="23" y2="-20" stroke="currentColor" strokeWidth="2.5" />
          </g>
        </g>
        {/* Equalizer bars — TR accent */}
        <g transform="translate(340, 50)" fill="currentColor" opacity="0.25">
          <rect x="0" y="10" width="4" height="12" rx="1" />
          <rect x="7" y="4" width="4" height="18" rx="1" />
          <rect x="14" y="8" width="4" height="14" rx="1" />
          <rect x="21" y="0" width="4" height="22" rx="1" />
          <rect x="28" y="6" width="4" height="16" rx="1" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="150" height="140" patternUnits="userSpaceOnUse">
          {/* Treble clef */}
          <g transform="translate(25, 22)" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" >
            <line x1="14" y1="5" x2="14" y2="52" />
            <path d="M14 18 C26 18 26 32 14 32 C6 32 6 42 14 42" strokeWidth="1.8" />
            <circle cx="11" cy="42" r="5" fill="currentColor" fillOpacity="0.2" />
          </g>
          {/* Beamed double notes */}
          <g transform="translate(80, 40)" fill="currentColor">
            <circle cx="8" cy="30" r="6" />
            <circle cx="30" cy="24" r="6" />
            <path d="M14 30 V10 h24 V24 M14 18 h24" fill="none" stroke="currentColor" strokeWidth="2.5" />
          </g>
          {/* Single note */}
          <g transform="translate(110, 90) scale(0.7)" fill="currentColor">
            <circle cx="8" cy="22" r="6" />
            <path d="M14 22 V4" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M14 4 Q22 4 22 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* EQ bars */}
          <g transform="translate(60, 100)" fill="currentColor" opacity="0.4">
            <rect x="0" y="8" width="3" height="10" rx="1" />
            <rect x="5" y="3" width="3" height="15" rx="1" />
            <rect x="10" y="6" width="3" height="12" rx="1" />
            <rect x="15" y="0" width="3" height="18" rx="1" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Mystery — ornate keyhole, question mark, fingerprint whorls, fog ── */
export function MysteryMotif({ uid, className, variant = "repeat", token = "topaz" }: MotifProps) {
  const id = `mys-${uid}`;
  const offset = getThemeOffset(token, "tl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <SimpleCorners />
        {/* Ornate keyhole — TL corner with offset */}
        <g transform={`translate(${45 + offset.x}, ${38 + offset.y})`} stroke="currentColor" strokeWidth="2.2" fill="none" >
          <circle cx="0" cy="0" r="14" />
          <circle cx="0" cy="0" r="5" fill="currentColor" fillOpacity="0.25" />
          <path d="M-5 12 L0 38 L5 12" fill="currentColor" fillOpacity="0.1" />
          {/* Decorative border */}
          <circle cx="0" cy="0" r="18" strokeDasharray="3 3" strokeWidth="1" opacity="0.4" />
        </g>
        {/* Question mark — BR accent */}
        <g transform="translate(350, 240)" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" >
          <path d="M-6 -10 C-6 -18 8 -18 8 -10 Q8 -4 0 -2 V4" />
          <circle cx="0" cy="10" r="2" fill="currentColor" />
        </g>
        {/* Fog/smoke dots scattered */}
        <g fill="currentColor" opacity="0.12">
          <circle cx="150" cy="80" r="20" />
          <circle cx="200" cy="120" r="15" />
          <circle cx="250" cy="60" r="12" />
          <circle cx="180" cy="200" r="18" />
          <circle cx="300" cy="180" r="14" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="140" height="140" patternUnits="userSpaceOnUse">
          {/* Keyhole */}
          <g transform="translate(45, 30)" stroke="currentColor" strokeWidth="2" fill="none" >
            <circle cx="0" cy="0" r="12" />
            <circle cx="0" cy="0" r="4" fill="currentColor" fillOpacity="0.2" />
            <path d="M-4 10 L0 30 L4 10" fill="currentColor" fillOpacity="0.08" />
          </g>
          {/* Question mark */}
          <g transform="translate(100, 70)" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" >
            <path d="M-5 -8 C-5 -16 7 -16 7 -8 Q7 -2 0 0 V4" />
            <circle cx="0" cy="9" r="2" fill="currentColor" />
          </g>
          {/* Fingerprint whorls */}
          <g transform="translate(95, 110)" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" >
            <path d="M-6 0 Q-2 -8 6 -4 Q12 0 8 8 Q4 14 -2 10" />
            <path d="M-3 2 Q0 -4 5 -1 Q9 2 6 7" />
          </g>
          {/* Fog dots */}
          <circle cx="20" cy="105" r="10" fill="currentColor" opacity="0.06" />
          <circle cx="120" cy="25" r="8" fill="currentColor" opacity="0.05" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Romance — heart cluster, cupid's arrow, vine curves ─────────────── */
export function RomanceMotif({ uid, className, variant = "repeat", token = "emerald" }: MotifProps) {
  const id = `rom-${uid}`;
  const offset = getThemeOffset(token, "br");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <OrnateCorners />
        {/* Heart cluster with arrow — BR corner with offset */}
        <g transform={`translate(${345 + offset.x}, ${235 + offset.y})`}>
          <g fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.8" >
            <path d={HEART} transform="scale(2.2)" />
            <path d={HEART} transform="translate(-22, -8) scale(1.4)" />
            <path d={HEART} transform="translate(12, -14) scale(1.0)" />
          </g>
          {/* Cupid's arrow through */}
          <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" >
            <line x1="-35" y1="15" x2="25" y2="-20" />
            <path d="M25 -20 L20 -14 M25 -20 L19 -19" />
            <path d="M-35 15 L-30 12 L-32 18" fill="currentColor" fillOpacity="0.3" />
          </g>
        </g>
        {/* Vine curves — left edge */}
        <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2">
          <path d="M10 100 Q20 80 10 60 Q0 40 10 20" />
          <path d="M10 60 Q18 55 22 62" />
          <path d="M10 40 Q2 35 -2 42" />
        </g>
        {/* Small rose — TL accent */}
        <g transform="translate(50, 55)" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" >
          <circle cx="0" cy="0" r="5" />
          <path d="M-3 -2 Q0 -8 3 -2" />
          <path d="M-5 0 Q-8 -3 -5 -5" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="160" height="160" patternUnits="userSpaceOnUse">
          {/* Large heart */}
          <g transform="translate(35, 35)" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" >
            <path d={HEART} transform="scale(2.0)" />
          </g>
          {/* Smaller hearts */}
          <g fill="currentColor" opacity="0.4">
            <path d={HEART} transform="translate(110, 90) scale(1.2)" />
            <path d={HEART} transform="translate(90, 30) scale(0.7)" />
          </g>
          {/* Arrow */}
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" fill="none" >
            <line x1="10" y1="120" x2="80" y2="80" />
            <path d="M80 80 L74 84 M80 80 L76 74" />
          </g>
          {/* Vine */}
          <path d="M120 0 Q130 30 120 60 Q110 90 120 120" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Science Fiction — ringed planet, circuit traces, hex grid, stars ── */
export function ScifiMotif({ uid, className, variant = "repeat", token = "sapphire" }: MotifProps) {
  const id = `sci-${uid}`;
  const offset = getThemeOffset(token, "bl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <TechCorners />
        {/* Ringed planet — BL corner with offset */}
        <g transform={`translate(${55 + offset.x}, ${248 + offset.y})`} stroke="currentColor" strokeWidth="2" fill="none" >
          <circle cx="0" cy="0" r="18" fill="currentColor" fillOpacity="0.12" />
          <ellipse cx="0" cy="0" rx="32" ry="8" transform="rotate(-18)" strokeWidth="2.2" />
          {/* Shadow crescent */}
          <path d="M-8 -14 C-2 -14 8 -6 8 2 C8 12 -2 18 -8 14" fill="currentColor" fillOpacity="0.1" stroke="none" />
        </g>
        {/* Circuit traces from corners */}
        <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.25">
          <path d="M10 10 H40 V30 H60" />
          <circle cx="60" cy="30" r="2" fill="currentColor" />
          <path d="M390 290 H360 V270 H340" />
          <circle cx="340" cy="270" r="2" fill="currentColor" />
          <path d="M10 290 V270 H30 V250" />
          <circle cx="30" cy="250" r="2" fill="currentColor" />
        </g>
        {/* Star dots */}
        <g fill="currentColor" opacity="0.25">
          <circle cx="280" cy="25" r="1.5" />
          <circle cx="300" cy="85" r="1" />
          <circle cx="250" cy="50" r="1.8" />
          <circle cx="120" cy="260" r="1.2" />
          <circle cx="200" cy="280" r="1" />
        </g>
        {/* Atom/orbital accent — TR */}
        <g transform="translate(345, 55)" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35" >
          <circle cx="0" cy="0" r="4" fill="currentColor" fillOpacity="0.3" />
          <ellipse cx="0" cy="0" rx="14" ry="5" />
          <ellipse cx="0" cy="0" rx="14" ry="5" transform="rotate(60)" />
          <ellipse cx="0" cy="0" rx="14" ry="5" transform="rotate(-60)" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="130" height="130" patternUnits="userSpaceOnUse">
          {/* Ringed planet - Moved to BL */}
          <g transform="translate(30, 95)">
            <circle cx="0" cy="0" r="14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
            <ellipse cx="0" cy="0" rx="28" ry="7" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(-15)" />
          </g>
          {/* Hex grid accent - Moved to TR */}
          <g stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.25">
            <path d="M105 20 L115 25 L115 35 L105 40 L95 35 L95 25 Z" />
            <path d="M105 40 L115 45 L115 55 L105 60 L95 55 L95 45 Z" />
          </g>
          {/* Circuit trace - Moved to TL/BR */}
          <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35">
            <path d="M15 25 H35 V35 H55" />
            <circle cx="55" cy="35" r="2" fill="currentColor" />
            <path d="M80 90 V100 H100" />
            <circle cx="100" cy="100" r="2" fill="currentColor" />
          </g>
          {/* Stars */}
          <circle cx="65" cy="15" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="115" cy="80" r="1.5" fill="currentColor" opacity="0.3" />
          <circle cx="75" cy="60" r="1" fill="currentColor" opacity="0.25" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Thriller — menacing eye, ECG heartbeat, warning sign, razor wire ── */
export function ThrillerMotif({ uid, className, variant = "repeat", token = "ruby" }: MotifProps) {
  const id = `thr-${uid}`;
  const offset = getThemeOffset(token, "bl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <TacticalCorners />
        {/* Half-open menacing eye — BL corner with offset */}
        <g transform={`translate(${60 + offset.x}, ${220 + offset.y})`} stroke="currentColor" strokeWidth="2" fill="none" >
          <path d="M-35 0 Q0 -22 35 0 Q0 22 -35 0 Z" fill="currentColor" fillOpacity="0.05" />
          <circle cx="0" cy="0" r="10" strokeWidth="1.8" />
          <ellipse cx="0" cy="0" rx="3.5" ry="8" fill="currentColor" />
          <circle cx="3" cy="-3" r="2" fill="currentColor" fillOpacity="0.2" />
          {/* highlight */}
          {/* Partial lid */}
          <path d="M-35 0 Q-15 -10 0 -14 Q15 -10 35 0" strokeWidth="2.5" />
        </g>
        {/* ECG heartbeat line — horizontal */}
        <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinejoin="round" >
          <path d="M10 240 H80 l8 -22 l10 44 l8 -32 l6 10 H160" />
          <path d="M240 240 H310 l8 -22 l10 44 l8 -32 l6 10 H390" />
        </g>
        {/* Warning triangle — TR accent */}
        <g transform="translate(340, 50)" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.35" strokeLinejoin="round" >
          <polygon points="0,-14 14,10 -14,10" />
          <line x1="0" y1="-6" x2="0" y2="2" strokeWidth="2" />
          <circle cx="0" cy="6" r="1.5" fill="currentColor" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="210" height="100" patternUnits="userSpaceOnUse">
          {/* ECG heartbeat */}
          <path d="M0 50 H60 l10 -28 l12 56 l10 -42 l8 14 H130 l8 -24 l10 48 l8 -32 l6 8 H210" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          {/* Eye fragment - Centered */}
          <g transform="translate(105, 50) scale(0.55)" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" >
            <path d="M-25 0 Q0 -16 25 0 Q0 16 -25 0 Z" />
            <circle cx="0" cy="0" r="6" />
            <ellipse cx="0" cy="0" rx="2" ry="5" fill="currentColor" />
          </g>
          {/* Warning triangle - Corner */}
          <g transform="translate(40, 15) scale(0.6)" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" opacity="0.5" >
            <polygon points="15,2 28,26 2,26" />
            <line x1="15" y1="10" x2="15" y2="18" />
            <circle cx="15" cy="22" r="1.2" fill="currentColor" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── War — shield with cross, crossed swords, military chevrons, dog tag */
export function WarMotif({ uid, className, variant = "repeat", token = "ruby" }: MotifProps) {
  const id = `war-${uid}`;
  const offset = getThemeOffset(token, "tr");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <TacticalCorners />
        {/* Shield with crossed swords — TR corner with offset */}
        <g transform={`translate(${310 + offset.x}, ${20 + offset.y})`}>
          {/* Swords behind */}
          <g stroke="currentColor" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" >
            <line x1="-8" y1="-4" x2="68" y2="72" />
            <line x1="68" y1="-4" x2="-8" y2="72" />
          </g>
          {/* Shield */}
          <g stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinejoin="round" >
            <path d="M8 8 h44 v18 C52 40 30 52 30 52 C30 52 8 40 8 26 Z" fill="currentColor" fillOpacity="0.08" />
            <line x1="30" y1="14" x2="30" y2="40" strokeWidth="1.8" />
            <line x1="16" y1="22" x2="44" y2="22" strokeWidth="1.8" />
          </g>
        </g>
        {/* Military rank chevrons — BL accent */}
        <g transform="translate(40, 240)" stroke="currentColor" strokeWidth="2.2" fill="none" opacity="0.4" strokeLinecap="round" >
          <path d="M-15 -8 L0 4 L15 -8" />
          <path d="M-15 2 L0 14 L15 2" />
          <path d="M-15 12 L0 24 L15 12" />
        </g>
        {/* Dog tag — TL accent */}
        <g transform="translate(40, 150)" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.2" >
          <rect x="0" y="0" width="18" height="28" rx="4" fill="currentColor" fillOpacity="0.05" />
          <circle cx="9" cy="4" r="2" />
          <line x1="3" y1="12" x2="15" y2="12" strokeWidth="0.8" />
          <line x1="3" y1="16" x2="12" y2="16" strokeWidth="0.8" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Shield */}
          <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" transform="translate(30, 25)" >
            <path d="M5 5 h35 v16 C40 32 22 42 22 42 C22 42 5 32 5 21 Z" fill="currentColor" fillOpacity="0.06" />
            <line x1="22" y1="10" x2="22" y2="32" />
            <line x1="12" y1="18" x2="32" y2="18" />
          </g>
          {/* Chevrons */}
          <path d="M78 80 l15 -12 l15 12 M78 92 l15 -12 l15 12" fill="none" stroke="currentColor" strokeWidth="2.2" />
          {/* Dog tag */}
          <g transform="translate(85, 20)" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" >
            <rect x="0" y="0" width="14" height="22" rx="3" />
            <circle cx="7" cy="3" r="1.5" />
            <line x1="2" y1="10" x2="12" y2="10" strokeWidth="0.7" />
          </g>
          {/* Barbed wire accent */}
          <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3">
            <path d="M0 115 Q30 108 60 115 Q90 122 120 115" />
            <g fill="currentColor">
              <circle cx="20" cy="112" r="1" />
              <circle cx="50" cy="115" r="1" />
              <circle cx="80" cy="112" r="1" />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Western — sheriff star badge, cactus silhouette, lasso ──────────── */
export function WesternMotif({ uid, className, variant = "repeat", token = "topaz" }: MotifProps) {
  const id = `west-${uid}`;
  const offset = getThemeOffset(token, "bl");
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <RoundCorners />
        {/* Sheriff star badge — BL corner with offset */}
        <g transform={`translate(${55 + offset.x}, ${232 + offset.y})`} stroke="currentColor" strokeWidth="2" fill="none" >
          <path d={STAR5} transform="scale(2.5)" fill="currentColor" fillOpacity="0.1" />
          <circle cx="0" cy="0" r="8" fill="currentColor" fillOpacity="0.15" />
          <circle cx="0" cy="0" r="3" fill="currentColor" fillOpacity="0.3" />
        </g>
        {/* Cactus — right side */}
        <g transform="translate(345, 180)" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" >
          <line x1="0" y1="5" x2="0" y2="55" />
          {/* main trunk */}
          <path d="M-12 30 H0 M-12 30 V18" />
          {/* left arm */}
          <path d="M12 22 H0 M12 22 V12" />
          {/* right arm */}
        </g>
        {/* Lasso loop — TL accent */}
        <g transform="translate(50, 50)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" >
          <ellipse cx="0" cy="0" rx="18" ry="12" />
          <path d="M18 0 Q22 5 20 12 Q18 18 22 25" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="130" height="130" patternUnits="userSpaceOnUse">
          {/* Cactus */}
          <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" transform="translate(30, 30)" >
            <line x1="15" y1="5" x2="15" y2="50" />
            <path d="M5 28 h10 M5 28 V16" />
            <path d="M25 22 h-10 M25 22 V12" />
          </g>
          {/* Sheriff star */}
          <g transform="translate(90, 75)">
            <path d={STAR5} fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" transform="scale(1.3)" />
            <circle cx="0" cy="0" r="3" fill="currentColor" fillOpacity="0.3" />
          </g>
          {/* Lasso */}
          <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35" transform="translate(50, 100)" >
            <ellipse cx="0" cy="0" rx="14" ry="8" />
            <path d="M14 0 Q18 4 16 10" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Politics — Greek temple (Parthenon), scales of justice, laurel ──── */
export function PoliticsMotif({ uid, className, variant = "repeat", token = "topaz", anchor = "c" }: MotifProps) {
  const id = `pol-${uid}`;
  const offset = getThemeOffset(token, anchor);
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <SimpleCorners />
        {/* Greek temple (Parthenon) — Center with offset */}
        <g transform={`translate(${200 + offset.x - 38}, ${150 + offset.y - 35})`} stroke="currentColor" strokeWidth="2" fill="none" >
          {/* Pediment triangle */}
          <path d="M5 32 L38 8 L71 32 Z" fill="currentColor" fillOpacity="0.08" strokeLinejoin="round" />
          {/* Columns */}
          <line x1="14" y1="32" x2="14" y2="62" strokeWidth="2.5" />
          <line x1="28" y1="32" x2="28" y2="62" strokeWidth="2.5" />
          <line x1="48" y1="32" x2="48" y2="62" strokeWidth="2.5" />
          <line x1="62" y1="32" x2="62" y2="62" strokeWidth="2.5" />
          {/* Entablature */}
          <rect x="8" y="28" width="60" height="4" fill="currentColor" fillOpacity="0.1" />
          {/* Base / stylobate */}
          <rect x="4" y="62" width="68" height="4" rx="1" fill="currentColor" fillOpacity="0.1" />
          <rect x="0" y="66" width="76" height="3" rx="1" fill="currentColor" fillOpacity="0.06" />
        </g>
        {/* Scales of justice — BL accent */}
        <g transform="translate(48, 235)" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.4" >
          {/* Beam */}
          <line x1="-18" y1="0" x2="18" y2="0" />
          {/* Fulcrum */}
          <path d="M-3 0 L0 -8 L3 0" fill="currentColor" fillOpacity="0.2" />
          {/* Pans */}
          <path d="M-18 0 L-24 12 h12 Z" />
          <path d="M18 0 L12 12 h12 Z" />
          {/* Stand */}
          <line x1="0" y1="0" x2="0" y2="16" />
          <line x1="-8" y1="16" x2="8" y2="16" />
        </g>
        {/* Laurel branches — TR accent */}
        <g transform="translate(350, 50)" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.12" opacity="0.3" >
          <path d="M0 0 Q-8 -4 -13 3 Q-7 1 0 0" />
          <path d="M0 0 Q8 -4 13 3 Q7 1 0 0" />
          <path d="M0 -3 Q-11 -9 -16 -1 Q-9 -3 0 -3" />
          <path d="M0 -3 Q11 -9 16 -1 Q9 -3 0 -3" />
          <path d="M0 -6 Q-9 -13 -15 -5 Q-8 -7 0 -6" />
          <path d="M0 -6 Q9 -13 15 -5 Q8 -7 0 -6" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="160" height="130" patternUnits="userSpaceOnUse">
          {/* Greek temple - Moved to BR corner */}
          <g transform="translate(90, 70)" stroke="currentColor" strokeWidth="2" fill="none" >
            <path d="M5 28 L35 6 L65 28 Z" fill="currentColor" fillOpacity="0.06" strokeLinejoin="round" />
            <line x1="14" y1="28" x2="14" y2="55" strokeWidth="2.2" />
            <line x1="28" y1="28" x2="28" y2="55" strokeWidth="2.2" />
            <line x1="42" y1="28" x2="42" y2="55" strokeWidth="2.2" />
            <line x1="56" y1="28" x2="56" y2="55" strokeWidth="2.2" />
            <rect x="6" y="55" width="58" height="3" fill="currentColor" fillOpacity="0.1" />
          </g>
          {/* Scales - Moved to BL corner */}
          <g transform="translate(30, 80)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" >
            <line x1="-14" y1="0" x2="14" y2="0" />
            <path d="M-2 0 L0 -6 L2 0" fill="currentColor" fillOpacity="0.2" />
            <path d="M-14 0 L-18 10 h8 Z" />
            <path d="M14 0 L10 10 h8 Z" />
            <line x1="0" y1="0" x2="0" y2="12" />
            <line x1="-6" y1="12" x2="6" y2="12" />
          </g>
          {/* Laurel */}
          <g transform="translate(95, 90)" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="0.8" >
            <path d="M0 0 Q-5 -3 -8 2 Q-4 0 0 0" />
            <path d="M0 0 Q5 -3 8 2 Q4 0 0 0" />
          </g>
          {/* Diagonal banner stripes */}
          <g stroke="currentColor" strokeWidth="0.5" opacity="0.12">
            <line x1="0" y1="0" x2="160" y2="130" />
            <line x1="0" y1="20" x2="140" y2="130" />
            <line x1="20" y1="0" x2="160" y2="110" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Reality / Talk / News — broadcast tower, signal waves, spotlight ── */
export function RealityMotif({ uid, className, variant = "repeat", token = "ruby", anchor = "c" }: MotifProps) {
  const id = `real-${uid}`;
  const offset = getThemeOffset(token, anchor);
  if (variant === "container") {
    const isCenter = anchor === "c";
    const tx = isCenter ? 200 + offset.x - 10 : 340 + offset.x - 10;
    const ty = isCenter ? 150 + offset.y - 30 : 240 + offset.y - 30;
    const cx = isCenter ? 340 : 42;
    const cy = isCenter ? 240 : 22;
    return (
      <ContainerSvg className={className}>
        <RoundCorners />
        {/* Broadcast tower — Center or BR with offset */}
        <g transform={`translate(${tx}, ${ty})`} stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" >
          {/* Tower */}
          <path d="M18 12 L10 65 h20 Z" fill="currentColor" fillOpacity="0.05" />
          <line x1="12" y1="35" x2="28" y2="35" strokeWidth="1.5" />
          <line x1="11" y1="50" x2="29" y2="50" strokeWidth="1.5" />
          {/* Antenna */}
          <line x1="20" y1="12" x2="20" y2="2" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="2" r="2.5" fill="currentColor" fillOpacity="0.4" />
          {/* Signal waves */}
          <path d="M8 8 C3 14 3 22 8 28" strokeWidth="1.5" opacity="0.5" />
          <path d="M32 8 C37 14 37 22 32 28" strokeWidth="1.5" opacity="0.5" />
          <path d="M2 5 C-4 14 -4 25 2 32" strokeWidth="1.2" opacity="0.3" />
          <path d="M38 5 C44 14 44 25 38 32" strokeWidth="1.2" opacity="0.3" />
        </g>
        {/* Camera frame — opposite corner accent */}
        <g transform={`translate(${cx}, ${cy})`} stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35" >
          <rect x="0" y="0" width="32" height="22" rx="2" />
          <circle cx="24" cy="6" r="3" />
          <path d="M22 18 h4 l-2 4 z" fill="currentColor" />
        </g>
        {/* Spotlight cone from top */}
        {isCenter && (
          <path d="M200 0 L170 85 L230 85 Z" fill="currentColor" fillOpacity="0.03" stroke="none" />
        )}
      </ContainerSvg>
    );
  }
  let rx = 96, ry = 74; // Default BR corner
  if (anchor === "c") {
    if (token === "ruby") {
      rx = 24; ry = 74; // reality -> BL corner
    } else {
      rx = 96; ry = 24; // talk -> TR corner
    }
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="130" height="110" patternUnits="userSpaceOnUse">
          {/* Camera/monitor frame */}
          <rect x={rx - 12} y={ry - 6} width="60" height="42" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <circle cx={rx + 60} cy={ry + 2} r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d={`M${rx + 56} ${ry + 16} h8 l-4 6 z`} fill="currentColor" />
          {/* Signal waves */}
          <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4">
            <path d={`M${rx + 70} ${ry - 6} C${rx + 76} ${ry} ${rx + 76} ${ry + 8} ${rx + 70} ${ry + 14}`} />
            <path d={`M${rx + 75} ${ry - 10} C${rx + 84} ${ry} ${rx + 84} ${ry + 12} ${rx + 75} ${ry + 18}`} />
          </g>
          {/* Spotlight */}
          <g stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.04" opacity="0.3" >
            <path d={`M${rx + 18} ${ry + 42} L${rx + 8} ${ry + 76} h20 Z`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Kids — balloon cluster, stars, building blocks ──────────────────── */
export function KidsMotif({ uid, className, variant = "repeat", token = "amethyst", anchor = "c" }: MotifProps) {
  const id = `kids-${uid}`;
  const offset = getThemeOffset(token, anchor);
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <RoundCorners />
        {/* Balloon cluster — Center with offset */}
        <g transform={`translate(${200 + offset.x - 12}, ${150 + offset.y - 20})`}>
          {/* Balloon 1 */}
          <ellipse cx="0" cy="0" rx="14" ry="18" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8" />
          <path d="M0 18 L-2 22 L2 22 Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M0 22 C-3 35 3 45 0 55" fill="none" stroke="currentColor" strokeWidth="0.8" />
          {/* Balloon 2 */}
          <ellipse cx="24" cy="8" rx="11" ry="15" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.8" />
          <path d="M24 23 L22 26 L26 26 Z" fill="currentColor" fillOpacity="0.25" />
          <path d="M24 26 C21 38 27 46 24 55" fill="none" stroke="currentColor" strokeWidth="0.8" />
          {/* Balloon 3 */}
          <ellipse cx="12" cy="-18" rx="12" ry="16" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 -2 L10 2 L14 2 Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 2 C9 20 15 35 12 55" fill="none" stroke="currentColor" strokeWidth="0.8" />
        </g>
        {/* Stars scattered — TL and BR */}
        <g fill="currentColor" opacity="0.35">
          <path d={STAR5} transform="translate(50, 45) scale(1.0)" />
          <path d={STAR5} transform="translate(340, 45) scale(0.6)" />
          <path d={STAR5} transform="translate(100, 250) scale(0.7)" />
        </g>
        {/* Building block — BL accent */}
        <g transform="translate(40, 240)" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" opacity="0.35" >
          <rect x="0" y="0" width="18" height="18" rx="2" />
          <rect x="4" y="-6" width="10" height="8" rx="2" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="140" height="140" patternUnits="userSpaceOnUse">
          {/* Balloon - Moved to TL Corner */}
          <g transform="translate(30, 25)">
            <ellipse cx="0" cy="0" rx="12" ry="16" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.8" />
            <path d="M0 16 L-2 20 L2 20 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M0 20 v16" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </g>
          {/* Stars */}
          <path d={STAR5} fill="currentColor" transform="translate(25, 95) scale(1.2)" />
          <path d={STAR5} fill="currentColor" transform="translate(98, 30) scale(0.75)" />
          {/* Building blocks — Moved to BR */}
          <g transform="translate(80, 95)" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.08" >
            <rect x="0" y="0" width="14" height="14" rx="2" />
            <rect x="14" y="0" width="14" height="14" rx="2" />
            <rect x="7" y="-12" width="14" height="14" rx="2" />
          </g>
          {/* Small circle */}
          <circle cx="120" cy="60" r="3" fill="currentColor" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Default — calm dot field + subtle diamond facets ─────────────────── */
export function DefaultMotif({ uid, className, variant = "repeat" }: MotifProps) {
  const id = `def-${uid}`;
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <SimpleCorners />
        {/* Diamond facet — center */}
        <g transform="translate(200, 150)" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.25" >
          <path d="M0 -20 L22 0 L0 25 L-22 0 Z" fill="currentColor" fillOpacity="0.06" />
          <line x1="0" y1="-20" x2="0" y2="25" opacity="0.4" />
          <line x1="-22" y1="0" x2="22" y2="0" opacity="0.4" />
        </g>
        {/* Corner dots */}
        <g fill="currentColor" opacity="0.2">
          <circle cx="30" cy="30" r="2" />
          <circle cx="370" cy="30" r="2" />
          <circle cx="30" cy="270" r="2" />
          <circle cx="370" cy="270" r="2" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id={id} width="46" height="46" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ── Soap — ornate vanity mirror frame, floating bubbles, rose silhouette ── */
export function SoapMotif({ uid, className, variant = "repeat", token = "emerald", anchor = "c" }: MotifProps) {
  const id = `soap-${uid}`;
  const offset = getThemeOffset(token, anchor);
  if (variant === "container") {
    return (
      <ContainerSvg className={className}>
        <OrnateCorners />
        {/* Vanity Mirror — Center with offset */}
        <g transform={`translate(${200 + offset.x - 25}, ${150 + offset.y - 30})`} stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" strokeLinecap="round" >
          {/* Mirror frame */}
          <path d="M10 20 C10 -5 40 -5 40 20 C40 45 10 45 10 20 Z" fill="currentColor" fillOpacity="0.08" />
          <path d="M5 20 C5 -10 45 -10 45 20 C45 50 25 55 25 62" />
          {/* Mirror stand base */}
          <path d="M15 62 H35" strokeWidth="2.5" />
          {/* Mirror reflection lines */}
          <line x1="20" y1="10" x2="30" y2="30" opacity="0.25" strokeWidth="1.2" />
          <line x1="16" y1="18" x2="24" y2="34" opacity="0.2" strokeWidth="1.2" />
        </g>
        {/* Rose Silhouette — BR Accent */}
        <g transform="translate(335, 235)" stroke="currentColor" strokeWidth="1.5" fill="none" >
          {/* Rose flower head */}
          <path d="M0 0 C-6 -8 0 -15 8 -12 C14 -9 12 0 6 3 C0 6 -6 3 0 0 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M3 -4 C1 -9 -3 -7 -1 -2" />
          {/* Stem & leaf */}
          <path d="M6 3 Q4 12 -4 20" strokeLinecap="round" />
          <path d="M5 10 Q12 12 14 6" strokeLinecap="round" />
        </g>
        {/* Floating Soap Bubbles */}
        <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35">
          <circle cx="55" cy="70" r="5" />
          <circle cx="68" cy="62" r="3" />
          <circle cx="210" cy="75" r="7" fill="currentColor" fillOpacity="0.03" />
          <circle cx="230" cy="85" r="4" />
          <circle cx="180" cy="180" r="6" />
          <circle cx="310" cy="110" r="4.5" />
        </g>
      </ContainerSvg>
    );
  }
  return (
    <svg
      className={`${FULL} ${className ?? ""}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern
          id={id}
          width="150"
          height="150"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(25)"
        >
          {/* Ornate mirror silhouette - Moved to TR Corner */}
          <g transform="translate(110, 25)" stroke="currentColor" strokeWidth="1.8" fill="none" >
            <path d="M8 16 C8 -4 32 -4 32 16 C32 36 8 36 8 16 Z" fill="currentColor" fillOpacity="0.05" />
            <path d="M4 16 C4 -8 36 -8 36 16 C36 40 20 44 20 50" />
            <line x1="12" y1="50" x2="28" y2="50" />
          </g>
          {/* Bubbles */}
          <circle cx="100" cy="40" r="6" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
          <circle cx="112" cy="32" r="3" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" />
          <circle cx="120" cy="110" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
          <circle cx="45" cy="115" r="5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
          {/* Rose stem/outline */}
          <path d="M85 85 C80 80 85 75 90 77 C95 79 92 85 88 88" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35" />
          <path d="M88 88 Q87 95 80 100" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
