// components/screen/slugs/detail/SectionShell.tsx
// Reusable titled section wrapper used by every block on the detail pages so
// spacing, dividers and heading treatment stay perfectly consistent.

import type { ReactNode } from 'react';
import { TEXT, VAR } from './tokens';

interface SectionShellProps {
  title: string;
  blurb?: string;
  token?: Token;
  /** Optional element rendered on the right of the header (counts, toggles). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SectionShell({
  title,
  blurb,
  token = 'gold',
  aside,
  children,
  className = '',
}: SectionShellProps) {
  return (
    <section className={className}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* accent tick */}
          <span
            className="h-7 w-1 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${VAR[token]}, transparent)` }}
          />
          <div>
            <h2
              className={`font-poppins text-lg md:text-xl font-semibold ${TEXT[token]} leading-none`}
            >
              {title}
            </h2>
            {blurb && (
              <p className="mt-1 text-[11px] uppercase tracking-widest text-quicksilver">{blurb}</p>
            )}
          </div>
        </div>
        {aside && <div className="shrink-0 text-xs text-quicksilver">{aside}</div>}
      </div>
      {children}
    </section>
  );
}
