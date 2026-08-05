// components/screen/slugs/genre/motifs/RepeatPatterns.tsx
// Seamless repeating SVG pattern tile components for full-page / hero backgrounds (variant="repeat").

import React from 'react';

export function RepeatPattern({
  genreName,
  uid,
  className = 'absolute inset-0 w-full h-full',
}: {
  genreName: string;
  uid: string;
  className?: string;
}) {
  const normalized = (genreName || '').trim().toLowerCase();
  const patternId = `pat-${normalized.replace(/\s+/g, '-')}-${uid}`;

  return (
    <svg className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        {normalized === 'action' && (
          <pattern id={patternId} width="110" height="110" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
            <g transform="translate(55, 55)" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
              <line x1="-16" y1="16" x2="16" y2="-16" />
              <line x1="-16" y1="-16" x2="16" y2="16" />
              <circle cx="0" cy="0" r="4.5" strokeWidth="1.3" />
              <circle cx="0" cy="0" r="1.2" fill="currentColor" />
            </g>
            <g transform="translate(24, 84)" fill="currentColor" opacity="0.7">
              <path d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z" />
            </g>
          </pattern>
        )}

        {normalized === 'adventure' && (
          <pattern id={patternId} width="220" height="170" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M 0 115 C 35 95, 75 95, 110 115 C 145 135, 185 135, 220 115" />
              <path d="M 0 85 C 35 65, 75 65, 110 85 C 145 105, 185 105, 220 85" />
            </g>
            <g transform="translate(110, 85)" stroke="currentColor" strokeWidth="1.4" fill="none">
              <circle cx="0" cy="0" r="22" strokeDasharray="2 3" opacity="0.5" />
              <path d="M0 -18 L4 -5 L0 -1 L-4 -5 Z" fill="currentColor" />
              <path d="M0 18 L4 5 L0 1 L-4 5 Z" fill="currentColor" fillOpacity="0.4" />
              <path d="M18 0 L5 4 L1 0 L5 -4 Z" fill="currentColor" fillOpacity="0.5" />
              <path d="M-18 0 L-5 4 L-1 0 L-5 -4 Z" fill="currentColor" fillOpacity="0.5" />
            </g>
          </pattern>
        )}

        {normalized === 'comedy' && (
          <pattern id={patternId} width="140" height="120" patternUnits="userSpaceOnUse">
            <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" transform="translate(45, 30)">
              <path d="M8 16 C8 6 38 6 38 16 C38 32 30 42 23 44 C16 42 8 32 8 16 Z" fill="currentColor" fillOpacity="0.06" />
              <circle cx="16" cy="22" r="2" fill="currentColor" />
              <circle cx="30" cy="22" r="2" fill="currentColor" />
              <path d="M14 30 Q23 38 32 30" />
            </g>
            <circle cx="110" cy="20" r="2.5" fill="currentColor" opacity="0.5" />
          </pattern>
        )}

        {normalized === 'crime' && (
          <pattern id={patternId} width="160" height="140" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
            <g transform="translate(80, 70)" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="0" cy="0" r="16" opacity="0.4" />
              <line x1="11" y1="11" x2="24" y2="24" strokeWidth="3" strokeLinecap="round" />
            </g>
            <line x1="10" y1="30" x2="150" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          </pattern>
        )}

        {(normalized === 'science fiction' || normalized === 'scifi') && (
          <pattern id={patternId} width="150" height="150" patternUnits="userSpaceOnUse">
            <g transform="translate(75, 75)" stroke="currentColor" strokeWidth="1.8" fill="none">
              <circle cx="0" cy="0" r="12" fill="currentColor" fillOpacity="0.1" />
              <ellipse cx="0" cy="0" rx="24" ry="7" transform="rotate(-25)" opacity="0.5" />
            </g>
            <circle cx="25" cy="25" r="1.5" fill="currentColor" opacity="0.6" />
          </pattern>
        )}

        {normalized === 'drama' && (
          <pattern id={patternId} width="150" height="130" patternUnits="userSpaceOnUse">
            <g transform="translate(75, 65) scale(0.85)" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M8 16 C8 6 38 6 38 16 C38 32 30 42 23 44 C16 42 8 32 8 16 Z" fill="currentColor" fillOpacity="0.05" />
              <circle cx="16" cy="22" r="2" fill="currentColor" />
              <circle cx="30" cy="22" r="2" fill="currentColor" />
              <path d="M14 34 Q23 26 32 34" />
            </g>
          </pattern>
        )}

        {normalized === 'horror' && (
          <pattern id={patternId} width="140" height="140" patternUnits="userSpaceOnUse">
            <g transform="translate(70, 70) scale(0.85)" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round">
              <path d="M-14 -8 C-14 -20 14 -20 14 -8 C14 0 10 5 8 10 L-8 10 C-10 5 -14 0 -14 -8 Z" fill="currentColor" fillOpacity="0.1" />
              <circle cx="-5" cy="-5" r="3" fill="currentColor" />
              <circle cx="5" cy="-5" r="3" fill="currentColor" />
            </g>
          </pattern>
        )}

        {/* Fallback pattern for all other genres */}
        {!['action', 'adventure', 'comedy', 'crime', 'science fiction', 'scifi', 'drama', 'horror'].includes(normalized) && (
          <pattern id={patternId} width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 -14 L12 0 L0 14 L-12 0 Z" transform="translate(50, 50)" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="15" cy="15" r="1.5" fill="currentColor" opacity="0.4" />
            <circle cx="85" cy="85" r="1.5" fill="currentColor" opacity="0.4" />
          </pattern>
        )}
      </defs>

      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
