// components/screen/slugs/genre/motifs/CornerBrackets.tsx
// Single, unified container corner bracket frame.
// Renders clean decorative corner brackets at the 4 outer edges of any container.

import React from 'react';
import type { BracketStyle, CornerBracketsProps } from './types';

export function CornerBrackets({ style = 'round', size = 'normal', className = '' }: CornerBracketsProps) {
  const isSmall = size === 'small';
  const bracketSize = isSmall ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-6 h-6 sm:w-8 sm:h-8';

  const posTL = isSmall ? 'top-1 left-1' : 'top-2 left-2';
  const posTR = isSmall ? 'top-1 right-1' : 'top-2 right-2';
  const posBL = isSmall ? 'bottom-1 left-1' : 'bottom-2 left-2';
  const posBR = isSmall ? 'bottom-1 right-1' : 'bottom-2 right-2';

  return (
    <div aria-hidden className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Top-Left Bracket */}
      <div className={`absolute ${posTL} ${bracketSize} opacity-40`}>
        <BracketCorner style={style} position="tl" />
      </div>

      {/* Top-Right Bracket */}
      <div className={`absolute ${posTR} ${bracketSize} opacity-40`}>
        <BracketCorner style={style} position="tr" />
      </div>

      {/* Bottom-Left Bracket */}
      <div className={`absolute ${posBL} ${bracketSize} opacity-40`}>
        <BracketCorner style={style} position="bl" />
      </div>

      {/* Bottom-Right Bracket */}
      <div className={`absolute ${posBR} ${bracketSize} opacity-40`}>
        <BracketCorner style={style} position="br" />
      </div>
    </div>
  );
}

function BracketCorner({ style, position }: { style: BracketStyle; position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transform =
    position === 'tr'
      ? 'scale(-1, 1)'
      : position === 'bl'
      ? 'scale(1, -1)'
      : position === 'br'
      ? 'scale(-1, -1)'
      : undefined;

  return (
    <svg viewBox="0 0 32 32" className="w-full h-full text-current" fill="none" stroke="currentColor" style={{ transform }}>
      {style === 'tactical' && (
        <g strokeWidth="1.8" strokeLinecap="round">
          <path d="M28 4 H4 V28" />
          <line x1="4" y1="14" x2="10" y2="14" />
          <line x1="14" y1="4" x2="14" y2="10" />
        </g>
      )}

      {style === 'ornate' && (
        <g strokeWidth="1.5" strokeLinecap="round">
          <path d="M28 4 Q4 4 4 28" />
          <path d="M14 4 Q4 4 4 14" />
        </g>
      )}

      {style === 'tech' && (
        <g strokeWidth="1.5">
          <path d="M28 4 H14 V10 H4 V28" />
          <circle cx="4" cy="4" r="2" fill="currentColor" />
        </g>
      )}

      {style === 'round' && (
        <g strokeWidth="1.8" strokeLinecap="round">
          <path d="M28 4 Q4 4 4 28" />
        </g>
      )}

      {style === 'simple' && (
        <g strokeWidth="1.5" strokeLinecap="round">
          <path d="M28 4 H4 V28" />
        </g>
      )}
    </svg>
  );
}
