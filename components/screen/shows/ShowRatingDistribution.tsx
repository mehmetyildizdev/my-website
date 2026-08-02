'use client';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
import { getRatingBgColorClass } from '@/lib/screen/utils/format';

type RatingBucket = {
  rating: number;
  count: number;
  show_names: string[];
};

export default function ShowRatingDistribution({ data }: { data: RatingBucket[] }) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  if (data.length === 0) return null;

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">Show Rating Distribution</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">How I rate TV shows, distribution across the 1–10 scale.</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-end gap-1.5 h-72">
          {data.map((bucket) => {
            const heightPct = (bucket.count / maxCount) * 100;
            const colorClass = getRatingBgColorClass(bucket.rating);

            return (
              <Tooltip
                key={bucket.rating}
                placement="mouse"
                content={
                  <div className="flex flex-col gap-0.5 min-w-[140px]">
                    <span className="font-semibold text-gold" style={{ fontFamily: 'var(--font-poppins)' }}>
                      Rating: {bucket.rating}/10
                    </span>
                    <div className="flex justify-between gap-4 text-[11px] mt-1">
                      <span className="text-quicksilver">Shows</span>
                      <span className="text-platinum tabular-nums">{bucket.count}</span>
                    </div>
                    {bucket.show_names.length > 0 && (
                      <div className="mt-1 pt-1 border-t border-border/20 space-y-0.5">
                        {bucket.show_names.slice(0, 6).map((name) => (
                          <p key={name} className="text-[10px] text-foreground/70">
                            {name}
                          </p>
                        ))}
                        {bucket.show_names.length > 6 && (
                          <p className="text-[10px] text-muted-foreground">+{bucket.show_names.length - 6} more</p>
                        )}
                      </div>
                    )}
                  </div>
                }
              >
                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] text-platinum tabular-nums font-medium">{bucket.count}</span>
                  <div
                    className={`w-full rounded-t-md ${colorClass} transition-all hover:opacity-100`}
                    style={{
                      height: `${heightPct}%`,
                      opacity: 0.8,
                      minHeight: bucket.count > 0 ? 4 : 0,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground tabular-nums">{bucket.rating}</span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
