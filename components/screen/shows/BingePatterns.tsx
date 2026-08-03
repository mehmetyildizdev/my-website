'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';

type BingeData = {
  show_name: string;
  show_tmdb_id: number;
  binge_date: string;
  episodes_watched: number;
  total_runtime_min: number;
};

function formatHours(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function BingePatterns({ data }: { data: BingeData[] }) {
  // Top 20 biggest binge days
  const top = useMemo(() => data.slice(0, 20), [data]);
  const maxEps = useMemo(() => Math.max(...top.map((d) => d.episodes_watched), 1), [top]);

  if (top.length === 0) return null;

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">Biggest Binge Days</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Days where you watched the most episodes of a single show in one sitting.</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1.5">
          {top.map((d, idx) => {
            const barPct = (d.episodes_watched / maxEps) * 100;
            return (
              <Tooltip
                key={`${d.show_tmdb_id}-${d.binge_date}`}
                placement="mouse"
                content={
                  <div className="flex flex-col gap-0.5 min-w-40">
                    <span className="font-semibold text-gold" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {d.show_name}
                    </span>
                    <div className="flex justify-between gap-4 text-[11px] mt-1">
                      <span className="text-quicksilver">Date</span>
                      <span className="text-platinum tabular-nums">{d.binge_date}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px]">
                      <span className="text-quicksilver">Episodes</span>
                      <span className="text-sapphire tabular-nums">{d.episodes_watched}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px]">
                      <span className="text-quicksilver">Watch Time</span>
                      <span className="text-emerald tabular-nums">{formatHours(d.total_runtime_min)}</span>
                    </div>
                  </div>
                }
              >
                <div className="grid grid-cols-[24px_1fr_100px_60px] items-center gap-2 py-1 px-2 hover:bg-pearl/30 rounded transition-colors">
                  <span className="text-[10px] text-muted-foreground tabular-nums text-right">#{idx + 1}</span>
                  <div className="min-w-0">
                    <span className="text-sm text-foreground/90 truncate block">{d.show_name}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{d.binge_date}</span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-border/15 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-amethyst" style={{ width: `${barPct}%`, opacity: 0.75 }} />
                  </div>
                  <span className="text-sm tabular-nums text-platinum text-right font-medium">{d.episodes_watched} eps</span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
