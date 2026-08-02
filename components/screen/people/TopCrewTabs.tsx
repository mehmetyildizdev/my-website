'use client';

import { useState } from 'react';
import InfinitePerformerGrid from '../shared/InfinitePerformerGrid';

// Source of truth for category ordering and labels. Keys must match the
// `category` values written by migration 004 (analytics.top_rated_crew).
export const CREW_CATEGORY_ORDER = [
  'directing',
  'production',
  'screenwriting',
  'cinematography',
  'composition',
  'design',
  'source_material',
] as const;

const CATEGORY_LABEL: Record<CrewCategory, string> = {
  directing: 'Directing',
  production: 'Production',
  screenwriting: 'Screenwriting',
  cinematography: 'Cinematography',
  composition: 'Composition',
  design: 'Design',
  source_material: 'Source Material',
};

export default function TopCrewTabs({ data }: { data: CrewBuckets }) {
  const [category, setCategory] = useState<CrewCategory>('directing');
  const items = data[category] ?? [];

  return (
    <div className="flex flex-col gap-3">
      {/* Category tabs — overflow-x for narrow viewports */}
      <div className="flex gap-1 p-1 rounded-lg bg-pearl/20 border border-border/10 overflow-x-auto w-fit max-w-full">
        {CREW_CATEGORY_ORDER.map((cat) => {
          const count = data[cat]?.length ?? 0;
          const disabled = count === 0;
          return (
            <button
              key={cat}
              onClick={() => !disabled && setCategory(cat)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                category === cat
                  ? 'bg-accent text-background shadow-sm'
                  : disabled
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : 'text-muted-foreground hover:text-foreground hover:bg-pearl/30'
              }`}
            >
              {CATEGORY_LABEL[cat]}
              {count > 0 && <span className="ml-1.5 text-[10px] tabular-nums opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      <InfinitePerformerGrid initialItems={items} mode="top_rated" weighted />
    </div>
  );
}
