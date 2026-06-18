'use client';

import { useState } from 'react';
import InfinitePerformerGrid from '../shared/InfinitePerformerGrid';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'overall', label: 'Overall' },
  { id: 'movies', label: 'Movies' },
  { id: 'shows', label: 'Shows' },
];

const MODES: { id: RankMode; label: string }[] = [
  { id: 'top_rated', label: 'Top Rated' },
  { id: 'most_watched', label: 'Most Watched' },
  { id: 'most_exposed', label: 'Most Exposed' },
];

export default function TopActorsTabs({ data }: { data: TopActorsBuckets }) {
  const [scope, setScope] = useState<Scope>('overall');
  const [mode, setMode] = useState<RankMode>('top_rated');

  const items = data[scope][mode];
  const weighted = scope === 'overall' && mode === 'top_rated';

  return (
    <div className="flex flex-col gap-3">
      {/* Scope tabs (primary) */}
      <div className="flex gap-1 p-1 rounded-lg bg-pearl/20 border border-border/10 w-fit">
        {SCOPES.map((s) => (
          <button
            key={s.id}
            onClick={() => setScope(s.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              scope === s.id
                ? 'bg-accent text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-pearl/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Mode tabs (secondary) */}
      <div className="flex gap-1 text-xs">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-2.5 py-1 rounded-md transition-all border ${
              mode === m.id
                ? 'border-accent/50 text-accent bg-accent/10'
                : 'border-border/15 text-muted-foreground hover:text-foreground hover:border-border/30'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Subtle hint when the rating is approximate */}
      {mode === 'most_exposed' && scope !== 'movies' && (
        <p className="text-[10px] text-muted-foreground italic">
          Show runtime is approximated from your average watched-episode length per show.
        </p>
      )}

      <InfinitePerformerGrid initialItems={items} mode={mode} weighted={weighted} />
    </div>
  );
}
