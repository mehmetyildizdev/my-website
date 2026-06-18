// components/screen/slugs/detail/MetaPanel.tsx
// Modern metadata panel. Instead of a flat "label: value" list, facts are laid
// out as a responsive mosaic of "fact tiles" — each with a small icon glyph, a
// quiet uppercase label and a prominent value. Empty facts are dropped.

import { TEXT, VAR } from './tokens';
import GenreBackground from '../genre/GenreBackground';

function FactTile({ fact, genres }: { fact: Fact; genres: { name: string }[] }) {
  const token = fact.token ?? 'quicksilver';
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/10 bg-card/50 p-4 backdrop-blur-sm transition-colors hover:border-border/30">
      <GenreBackground genres={genres} intensity={0.25} variant="container" />
      {/* faint corner accent */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-xl z-0"
        style={{ background: VAR[token] }}
      />
      <div className="relative z-10 flex items-center gap-2">
        {fact.glyph && <span className={`text-sm ${TEXT[token]}`}>{fact.glyph}</span>}
        <span className="text-[10px] font-bold uppercase tracking-widest text-quicksilver">
          {fact.label}
        </span>
      </div>
      <div className="relative z-10 mt-1.5 text-sm font-medium text-titanium leading-snug">
        {fact.value}
      </div>
    </div>
  );
}

export default function MetaPanel({
  facts,
  genres,
}: {
  facts: Fact[];
  genres: { name: string }[];
}) {
  const visible = facts.filter((f) => f.value != null && f.value !== '');
  if (!visible.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {visible.map((f, i) => (
        <FactTile key={`${f.label}-${i}`} fact={f} genres={genres} />
      ))}
    </div>
  );
}
