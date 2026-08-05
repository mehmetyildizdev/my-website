// components/screen/slugs/genre/motifs/GenreIcons.tsx
// Modular, vector SVG artwork icons for all genres.
// Renders clean, scalable vector art at high resolution without viewBox distortion.

import React from 'react';

export function ActionIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Crossed Swords */}
        <g transform="rotate(-45)">
          <path d="M0 -24 L3 -5 L5 0 L-5 0 L-3 -5 Z" fill="currentColor" fillOpacity="0.2" />
          <rect x="-8" y="1" width="16" height="3" rx="1" fill="currentColor" fillOpacity="0.6" />
          <rect x="-2" y="4" width="4" height="10" rx="1" fill="currentColor" fillOpacity="0.4" />
          <circle cx="0" cy="16" r="2.5" fill="currentColor" />
        </g>
        <g transform="rotate(45)">
          <path d="M0 -24 L3 -5 L5 0 L-5 0 L-3 -5 Z" fill="currentColor" fillOpacity="0.2" />
          <rect x="-8" y="1" width="16" height="3" rx="1" fill="currentColor" fillOpacity="0.6" />
          <rect x="-2" y="4" width="4" height="10" rx="1" fill="currentColor" fillOpacity="0.4" />
          <circle cx="0" cy="16" r="2.5" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}

export function AdventureIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Compass Rose */}
        <circle cx="0" cy="0" r="26" strokeDasharray="3 3" opacity="0.5" />
        <path d="M0 -24 L5 -6 L0 -2 L-5 -6 Z" fill="currentColor" />
        <path d="M0 24 L5 6 L0 2 L-5 6 Z" fill="currentColor" fillOpacity="0.4" />
        <path d="M24 0 L6 5 L2 0 L6 -5 Z" fill="currentColor" fillOpacity="0.5" />
        <path d="M-24 0 L-6 5 L-2 0 L-6 -5 Z" fill="currentColor" fillOpacity="0.5" />
        <circle cx="0" cy="0" r="3.5" fill="currentColor" />
      </g>
    </svg>
  );
}

export function ComedyIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Theatre Masks (Happy & Sad) */}
        <g transform="translate(-10, -8)">
          <path d="M-12 -12 C-12 -22 12 -22 12 -12 C12 2 5 13 0 15 C-5 13 -12 2 -12 -12 Z" fill="currentColor" fillOpacity="0.1" />
          <circle cx="-5" cy="-7" r="2" fill="currentColor" />
          <circle cx="5" cy="-7" r="2" fill="currentColor" />
          <path d="M-6 2 Q0 10 6 2" />
        </g>
        <g transform="translate(12, 6) scale(0.8)">
          <path d="M-12 -12 C-12 -22 12 -22 12 -12 C12 2 5 13 0 15 C-5 13 -12 2 -12 -12 Z" fill="currentColor" fillOpacity="0.08" />
          <circle cx="-5" cy="-7" r="2" fill="currentColor" />
          <circle cx="5" cy="-7" r="2" fill="currentColor" />
          <path d="M-6 5 Q0 -2 6 5" />
        </g>
      </g>
    </svg>
  );
}

export function CrimeIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(28, 28)">
        {/* Magnifying Glass with Lens Fingerprint */}
        <circle cx="0" cy="0" r="18" />
        <line x1="13" y1="13" x2="28" y2="28" strokeWidth="4" />
        <path d="M-7 -2 Q-3 -9 4 -5 Q9 -2 5 5" strokeWidth="1.2" opacity="0.6" />
        <path d="M-4 0 Q-1 -5 3 -2 Q6 0 3 4" strokeWidth="1.2" opacity="0.5" />
      </g>
    </svg>
  );
}

export function ScifiIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Ringed Planet */}
        <circle cx="0" cy="0" r="14" fill="currentColor" fillOpacity="0.1" />
        <ellipse cx="0" cy="0" rx="26" ry="8" transform="rotate(-25)" strokeWidth="2" />
        <circle cx="-8" cy="-5" r="3" fill="currentColor" fillOpacity="0.3" />
      </g>
    </svg>
  );
}

export function DramaIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Tragedy Mask & Quill */}
        <g transform="translate(-6, -4)">
          <path d="M-12 -12 C-12 -22 12 -22 12 -12 C12 2 5 13 0 15 C-5 13 -12 2 -12 -12 Z" fill="currentColor" fillOpacity="0.1" />
          <circle cx="-5" cy="-7" r="2" fill="currentColor" />
          <circle cx="5" cy="-7" r="2" fill="currentColor" />
          <path d="M-6 5 Q0 -2 6 5" />
        </g>
        {/* Quill */}
        <path d="M8 -20 Q18 -5 22 15 L18 17 Q12 0 4 -16 Z" fill="currentColor" fillOpacity="0.3" />
      </g>
    </svg>
  );
}

export function HorrorIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 30)">
        {/* Skull */}
        <path d="M-16 -10 C-16 -24 16 -24 16 -10 C16 0 12 6 10 12 L-10 12 C-12 6 -16 0 -16 -10 Z" fill="currentColor" fillOpacity="0.1" />
        <ellipse cx="-6" cy="-6" rx="4" ry="5" fill="currentColor" />
        <ellipse cx="6" cy="-6" rx="4" ry="5" fill="currentColor" />
        <path d="M-2 4 L0 1 L2 4 Z" fill="currentColor" />
        <line x1="-6" y1="12" x2="-6" y2="18" />
        <line x1="0" y1="12" x2="0" y2="18" />
        <line x1="6" y1="12" x2="6" y2="18" />
      </g>
    </svg>
  );
}

export function FantasyIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Crescent Moon & Stars */}
        <path d="M-6 -22 C6 -22 18 -12 14 6 C10 20 -6 24 -20 14 C-10 14 -2 -6 -6 -22 Z" fill="currentColor" fillOpacity="0.2" />
        <g transform="translate(10, -10)">
          <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="currentColor" />
        </g>
        <g transform="translate(16, 10) scale(0.7)">
          <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}

export function RomanceIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Heart Cluster & Arrow */}
        <path d="M0 -4 C0 -12 -12 -12 -12 -2 C-12 8 0 16 0 20 C0 16 12 8 12 -2 C12 -12 0 -12 0 -4 Z" fill="currentColor" fillOpacity="0.25" />
        <line x1="-20" y1="16" x2="20" y2="-16" strokeWidth="2.2" />
        <path d="M14 -16 L20 -16 L20 -10" strokeWidth="2.2" />
      </g>
    </svg>
  );
}

export function MusicIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Treble Clef & Notes */}
        <path d="M-4 22 C-14 22 -14 10 -4 10 C6 10 6 22 -4 22 Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M2 -24 C2 -24 6 -8 2 0 C-4 8 -8 16 -4 22" strokeWidth="2.2" />
        <circle cx="8" cy="-6" r="4" fill="currentColor" />
        <line x1="12" y1="-6" x2="12" y2="-20" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function ThrillerIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Menacing Eye & ECG Pulse */}
        <path d="M-24 0 Q0 -16 24 0 Q0 16 -24 0 Z" fill="currentColor" fillOpacity="0.1" />
        <circle cx="0" cy="0" r="7" strokeWidth="1.8" />
        <ellipse cx="0" cy="0" rx="2.5" ry="6" fill="currentColor" />
      </g>
    </svg>
  );
}

export function AnimationIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Film Frame & Play Button */}
        <rect x="-20" y="-15" width="40" height="30" rx="3" fill="currentColor" fillOpacity="0.1" />
        <circle cx="-24" cy="-8" r="1.8" fill="currentColor" />
        <circle cx="-24" cy="0" r="1.8" fill="currentColor" />
        <circle cx="-24" cy="8" r="1.8" fill="currentColor" />
        <path d="M-5 -7 L7 0 L-5 7 Z" fill="currentColor" />
      </g>
    </svg>
  );
}

export function HistoryIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Ionic Column */}
        <line x1="-16" y1="-20" x2="16" y2="-20" strokeWidth="3" />
        <line x1="-12" y1="20" x2="12" y2="20" strokeWidth="3" />
        <line x1="-8" y1="-16" x2="-8" y2="16" />
        <line x1="0" y1="-16" x2="0" y2="16" />
        <line x1="8" y1="-16" x2="8" y2="16" />
      </g>
    </svg>
  );
}

export function MysteryIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Keyhole */}
        <circle cx="0" cy="-6" r="10" fill="currentColor" fillOpacity="0.15" />
        <path d="M-5 0 L5 0 L8 18 L-8 18 Z" fill="currentColor" fillOpacity="0.25" />
      </g>
    </svg>
  );
}

export function WarIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Shield */}
        <path d="M-16 -20 L16 -20 L16 0 C16 14 0 22 0 22 C0 22 -16 14 -16 0 Z" fill="currentColor" fillOpacity="0.15" />
        <line x1="0" y1="-20" x2="0" y2="22" opacity="0.4" />
        <line x1="-16" y1="0" x2="16" y2="0" opacity="0.4" />
      </g>
    </svg>
  );
}

export function WesternIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Sheriff Star */}
        <path d="M0 -22 L5 -7 L20 -7 L8 3 L12 18 L0 9 L-12 18 L-8 3 L-20 -7 L-5 -7 Z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="0" cy="0" r="5" fill="currentColor" />
      </g>
    </svg>
  );
}

export function DocumentaryIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Viewfinder Frame */}
        <rect x="-20" y="-15" width="40" height="30" rx="3" fill="currentColor" fillOpacity="0.1" />
        <path d="M-15 -8 H-8 V-15" strokeWidth="1.5" />
        <path d="M15 -8 H8 V-15" strokeWidth="1.5" />
        <path d="M-15 8 H-8 V15" strokeWidth="1.5" />
        <path d="M15 8 H8 V15" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="3" fill="currentColor" />
      </g>
    </svg>
  );
}

export function FamilyIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Interlocked Chain Rings */}
        <circle cx="-8" cy="0" r="14" fill="currentColor" fillOpacity="0.1" />
        <circle cx="8" cy="0" r="14" fill="currentColor" fillOpacity="0.1" />
      </g>
    </svg>
  );
}

export function PoliticsIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Parthenon / Capitol Temple */}
        <path d="M-22 -10 L0 -24 L22 -10 Z" fill="currentColor" fillOpacity="0.2" />
        <line x1="-20" y1="-8" x2="20" y2="-8" strokeWidth="2.5" />
        <line x1="-20" y1="16" x2="20" y2="16" strokeWidth="2.5" />
        <line x1="-14" y1="-8" x2="-14" y2="16" />
        <line x1="-4" y1="-8" x2="-4" y2="16" />
        <line x1="4" y1="-8" x2="4" y2="16" />
        <line x1="14" y1="-8" x2="14" y2="16" />
      </g>
    </svg>
  );
}

export function RealityIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Signal Waves */}
        <line x1="0" y1="18" x2="0" y2="-12" strokeWidth="2.5" />
        <circle cx="0" cy="-14" r="3" fill="currentColor" />
        <path d="M-10 -6 Q-18 -14 -10 -22" strokeWidth="1.8" />
        <path d="M10 -6 Q18 -14 10 -22" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

export function KidsIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Balloon Cluster */}
        <ellipse cx="-8" cy="-6" rx="8" ry="11" fill="currentColor" fillOpacity="0.2" />
        <ellipse cx="6" cy="-8" rx="8" ry="11" fill="currentColor" fillOpacity="0.2" />
        <path d="M-8 5 Q-4 15 0 22" strokeWidth="1.2" />
        <path d="M6 3 Q2 15 0 22" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

export function SoapIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Vanity Mirror Frame */}
        <ellipse cx="0" cy="0" rx="14" ry="18" fill="currentColor" fillOpacity="0.15" />
        <line x1="0" y1="18" x2="0" y2="24" strokeWidth="3" />
      </g>
    </svg>
  );
}

export function DefaultIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(32, 32)">
        {/* Diamond Facet */}
        <path d="M0 -18 L16 0 L0 18 L-16 0 Z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="0" cy="0" r="4" fill="currentColor" opacity="0.4" />
      </g>
    </svg>
  );
}
