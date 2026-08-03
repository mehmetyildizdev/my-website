// components/screen/slugs/detail/CastSection.tsx
// Creative "Acting" section. Rather than a flat avatar grid, the billed leads
// get tall portrait cards with the character name in a quote-style treatment,
// and the remaining ensemble flows into a denser supporting grid. Works for
// both movies (cast_order/role) and shows (episode_count).

'use client';

import { useState } from 'react';
import SectionShell from './SectionShell';
import PersonCard from './PersonCard';

interface CastSectionProps {
  cast: CastEntry[];
  /** How many billed leads to feature large. */
  leadCount?: number;
}

const COLLAPSED = 18;

export default function CastSection({ cast, leadCount = 4 }: CastSectionProps) {
  const [expanded, setExpanded] = useState(false);
  if (!cast.length) return null;

  // Sort by billing order when present, otherwise by episode count desc.
  const sorted = [...cast].sort((a, b) => {
    if (a.cast_order != null && b.cast_order != null) return a.cast_order - b.cast_order;
    return (b.episode_count ?? 0) - (a.episode_count ?? 0);
  });

  const leads = sorted.slice(0, leadCount);
  const restAll = sorted.slice(leadCount);
  const rest = expanded ? restAll : restAll.slice(0, COLLAPSED);
  const hiddenCount = restAll.length - rest.length;

  return (
    <SectionShell title="Acting" blurb="The faces on screen" token="gold" aside={`${cast.length} credited`}>
      {/* Featured leads — editorial portrait row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {leads.map((m, idx) => (
          <div key={`${m.tmdb_id}-${idx}`} className="group relative">
            <PersonCard tmdb_id={m.tmdb_id} name={m.name} profile_path={m.profile_path} token="gold" variant="portrait" />
            {m.character && (
              <p className="mt-1 px-0.5 text-xs md:text-sm italic text-quicksilver leading-snug line-clamp-2">
                as <span className="text-platinum not-italic font-medium">{m.character}</span>
              </p>
            )}
            {m.episode_count != null && <p className="px-0.5 text-xs text-quicksilver/80">{m.episode_count} eps</p>}
          </div>
        ))}
      </div>

      {/* Supporting ensemble — compact rectangle grid */}
      {rest.length > 0 && (
        <>
          <p className="mb-4 text-[11px] uppercase tracking-widest text-quicksilver/70">Supporting Ensemble</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-5">
            {rest.map((m, idx) => (
              <PersonCard
                key={`${m.tmdb_id}-${idx}`}
                tmdb_id={m.tmdb_id}
                name={m.name}
                profile_path={m.profile_path}
                role={m.character}
                meta={m.episode_count != null ? `${m.episode_count} eps` : null}
                token="gold"
                variant="rectangle"
              />
            ))}
          </div>
        </>
      )}

      {hiddenCount > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-full border border-border/30 bg-card/50 px-5 py-1.5 text-xs font-medium text-quicksilver backdrop-blur-sm transition-colors hover:border-gold/50 hover:text-gold"
          >
            Show {hiddenCount} more
          </button>
        </div>
      )}
    </SectionShell>
  );
}
