'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';

function ratingColor(rating: number): string {
  if (rating >= 7) return 'bg-emerald';
  if (rating >= 6.5) return 'bg-sapphire';
  if (rating >= 6) return 'bg-topaz';
  if (rating >= 5.5) return 'bg-amethyst';
  return 'bg-ruby';
}

export default function MovieDecadeChart({ data }: { data: DecadeData[] }) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">Movies by Decade</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Distribution of watched movies across release decades. Bar height = count, color = avg rating.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-end gap-2 h-52">
          {data.map((d) => {
            const rating = Number(d.avg_rating);
            const heightPct = (d.count / maxCount) * 100;
            const color = ratingColor(rating);

            return (
              <Tooltip
                key={d.decade}
                placement="top"
                content={
                  <div className="flex flex-col gap-0.5 min-w-[140px]">
                    <span className="font-semibold text-gold" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {d.decade}s
                    </span>
                    <div className="flex justify-between gap-4 text-[11px] mt-1">
                      <span className="text-quicksilver">Movies</span>
                      <span className="text-platinum font-semibold tabular-nums">{d.count}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px]">
                      <span className="text-quicksilver">Avg Rating</span>
                      <span className="text-emerald tabular-nums">{rating.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px]">
                      <span className="text-quicksilver">Total Hours</span>
                      <span className="text-sapphire tabular-nums">{d.total_runtime_hours.toLocaleString()}h</span>
                    </div>
                  </div>
                }
              >
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className={`w-full rounded-t-md ${color} transition-all hover:opacity-100`}
                    style={{ height: `${heightPct}%`, opacity: 0.8 }}
                  />
                  <span className="text-[10px] text-muted-foreground tabular-nums">{d.decade}s</span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
