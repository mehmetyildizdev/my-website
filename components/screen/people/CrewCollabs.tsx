'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';

const PAGE_SIZE = 20;

function groupWorks(works: WorkEntry[]): { label: string; indent: boolean }[] {
  const result: { label: string; indent: boolean }[] = [];
  const collections = new Map<string, string[]>();
  const standalones: string[] = [];

  for (const w of works) {
    if (w.collection) {
      if (!collections.has(w.collection)) collections.set(w.collection, []);
      collections.get(w.collection)!.push(w.title);
    } else {
      standalones.push(w.title);
    }
  }

  for (const [collName, movies] of collections) {
    result.push({ label: collName, indent: false });
    for (const movie of movies.sort()) {
      result.push({ label: movie, indent: true });
    }
  }

  for (const title of standalones.sort()) {
    result.push({ label: title, indent: false });
  }

  return result;
}

export default function CrewCollabs({ data }: { data: CollabPair[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const displayed = useMemo(() => data.slice(0, visible), [data, visible]);
  const maxShared = useMemo(() => Math.max(...data.map((d) => d.shared_titles), 1), [data]);

  if (data.length === 0) return null;

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">Crew Collaborations</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Crew members from different departments who frequently work together across your watched films.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {displayed.map((pair, idx) => {
            const rating = Number(pair.avg_rating);
            const barPct = (pair.shared_titles / maxShared) * 100;
            const collectionPct = pair.shared_titles > 0 ? (pair.collection_movie_count / pair.shared_titles) * barPct : 0;
            const standalonePct = barPct - collectionPct;
            const grouped = groupWorks(pair.works);

            return (
              <Tooltip
                key={idx}
                placement="mouse"
                content={
                  <div className="flex flex-col gap-0.5 min-w-55 max-w-75">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gold" style={{ fontFamily: 'var(--font-poppins)' }}>
                        {pair.person_a_name}
                      </span>
                      <span className="text-[9px] text-amethyst bg-amethyst/10 px-1.5 py-0.5 rounded">{pair.category_a}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gold" style={{ fontFamily: 'var(--font-poppins)' }}>
                        {pair.person_b_name}
                      </span>
                      <span className="text-[9px] text-sapphire bg-sapphire/10 px-1.5 py-0.5 rounded">{pair.category_b}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px] mt-1">
                      <span className="text-quicksilver">Total Movies</span>
                      <span className="text-platinum tabular-nums">{pair.shared_titles}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px]">
                      <span className="text-quicksilver">Avg Rating</span>
                      <span className="text-emerald tabular-nums">{rating.toFixed(1)}</span>
                    </div>
                    {grouped.length > 0 && (
                      <div className="mt-1 pt-1 border-t border-border/20 space-y-0.5">
                        {grouped.slice(0, 12).map((item, i) => (
                          <p
                            key={i}
                            className={`text-[10px] ${item.indent ? 'text-foreground/50 pl-3' : 'text-foreground/80 font-medium'}`}
                          >
                            {item.indent ? '↳ ' : ''}
                            {item.label}
                          </p>
                        ))}
                        {grouped.length > 12 && <p className="text-[10px] text-muted-foreground">+{grouped.length - 12} more</p>}
                      </div>
                    )}
                  </div>
                }
              >
                <div className="grid grid-cols-[1fr_80px_40px] items-center gap-3 py-1.5 px-2 hover:bg-pearl/30 rounded transition-colors">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] text-muted-foreground tabular-nums w-5 shrink-0">#{idx + 1}</span>
                    <span className="text-sm text-foreground/90 truncate">{pair.person_a_name}</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">({pair.category_a})</span>
                    <span className="text-xs text-muted-foreground">×</span>
                    <span className="text-sm text-foreground/90 truncate">{pair.person_b_name}</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">({pair.category_b})</span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-border/15 overflow-hidden flex">
                    {collectionPct > 0 && (
                      <div className="h-full bg-sapphire" style={{ width: `${(collectionPct / barPct) * 100}%`, opacity: 0.7 }} />
                    )}
                    {standalonePct > 0 && (
                      <div className="h-full bg-emerald" style={{ width: `${(standalonePct / barPct) * 100}%`, opacity: 0.7 }} />
                    )}
                  </div>
                  <span className="text-xs tabular-nums text-platinum text-right font-medium">{pair.shared_titles}</span>
                </div>
              </Tooltip>
            );
          })}
        </div>

        {visible < data.length && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full mt-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-pearl/30 rounded-md border border-border/10 transition-colors"
          >
            Show more ({data.length - visible} remaining)
          </button>
        )}

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/10 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-sapphire opacity-70" /> Collection films
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-emerald opacity-70" /> Standalone films
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
