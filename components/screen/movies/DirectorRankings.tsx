'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
const PAGE_SIZE = 15;

function ratingColor(rating: number): string {
  if (rating >= 7) return 'text-emerald';
  if (rating >= 6.5) return 'text-sapphire';
  if (rating >= 6) return 'text-topaz';
  if (rating >= 5.5) return 'text-amethyst';
  return 'text-ruby';
}

function barColor(rating: number): string {
  if (rating >= 7) return 'bg-emerald';
  if (rating >= 6.5) return 'bg-sapphire';
  if (rating >= 6) return 'bg-topaz';
  if (rating >= 5.5) return 'bg-amethyst';
  return 'bg-ruby';
}

export default function DirectorRankings({ data }: { data: DirectorData[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.movie_count), 1), [data]);
  const displayed = data.slice(0, visible);

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">
          Top Directors
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Directors ranked by average rating across my watched movies (3+ films).
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1.5">
          {displayed.map((d, idx) => {
            const rating = Number(d.avg_rating);
            const barPct = (d.movie_count / maxCount) * 100;
            return (
              <Tooltip
                key={d.tmdb_id}
                placement="mouse"
                content={
                  <div className="flex flex-col gap-0.5 min-w-[180px]">
                    <span
                      className="font-semibold text-gold"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {d.name}
                    </span>
                    <div className="flex justify-between gap-4 text-[11px] mt-1">
                      <span className="text-quicksilver">Movies Watched</span>
                      <span className="text-platinum tabular-nums">{d.movie_count}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px]">
                      <span className="text-quicksilver">Avg Rating</span>
                      <span className="text-emerald tabular-nums">{rating.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px] pt-1 mt-1 border-t border-border/20">
                      <span className="text-quicksilver">Best Film</span>
                      <span className="text-foreground/80 text-right max-w-[120px] truncate">
                        {d.best_movie}
                      </span>
                    </div>
                  </div>
                }
              >
                <div className="grid grid-cols-[24px_1fr_80px_50px] items-center gap-2 py-1 px-2 hover:bg-pearl/30 rounded transition-colors">
                  <span className="text-[10px] text-muted-foreground tabular-nums text-right">
                    #{idx + 1}
                  </span>
                  <span className="text-sm text-foreground/90 truncate">{d.name}</span>
                  <div className="relative h-2.5 rounded-full bg-border/15 overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${barColor(rating)}`}
                      style={{ width: `${barPct}%`, opacity: 0.75 }}
                    />
                  </div>
                  <span
                    className={`text-sm tabular-nums font-mono font-semibold text-right ${ratingColor(rating)}`}
                  >
                    {rating.toFixed(1)}
                  </span>
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
      </CardContent>
    </Card>
  );
}
