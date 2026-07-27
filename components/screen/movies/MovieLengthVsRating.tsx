'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
import { getRatingColorVar } from '@/lib/screen/utils/format';

type MoviePoint = {
  title: string;
  tmdb_id: number;
  runtime: number;
  rating: number;
  release_year: number | null;
};

export default function MovieLengthVsRating({ data }: { data: MoviePoint[] }) {
  const { minRuntime, maxRuntime, minRating, maxRating } = useMemo(() => {
    let minR = Infinity,
      maxR = 0,
      minRt = Infinity,
      maxRt = 0;
    data.forEach((d) => {
      if (d.runtime < minRt) minRt = d.runtime;
      if (d.runtime > maxRt) maxRt = d.runtime;
      if (d.rating < minR) minR = d.rating;
      if (d.rating > maxR) maxR = d.rating;
    });
    return {
      minRuntime: Math.max(0, Math.floor(minRt / 10) * 10 - 10),
      maxRuntime: Math.ceil(maxRt / 10) * 10 + 10,
      minRating: Math.max(0, Math.floor(minR) - 1),
      maxRating: Math.min(10, Math.ceil(maxR) + 1),
    };
  }, [data]);

  // Group movies by identical (runtime, rating) coordinates and pre-slice top 3 movies for stable rendering
  const pointGroups = useMemo(() => {
    const map = new Map<
      string,
      { runtime: number; rating: number; visibleMovies: MoviePoint[]; extraCount: number }
    >();
    data.forEach((d) => {
      const key = `${d.runtime}:${d.rating}`;
      if (!map.has(key)) {
        map.set(key, { runtime: d.runtime, rating: d.rating, visibleMovies: [], extraCount: 0 });
      }
      const entry = map.get(key)!;
      if (entry.visibleMovies.length < 3) {
        entry.visibleMovies.push(d);
      } else {
        entry.extraCount++;
      }
    });
    return Array.from(map.values());
  }, [data]);

  const chartWidth = 100; // SVG viewBox percentage
  const chartHeight = 500;
  const padding = { top: 20, bottom: 30, left: 5, right: 5 };
  const plotW = chartWidth - padding.left - padding.right;
  const plotH = chartHeight - padding.top - padding.bottom;
  const runtimeRange = maxRuntime - minRuntime || 1;
  const ratingRange = maxRating - minRating || 1;

  const toX = (runtime: number) => padding.left + ((runtime - minRuntime) / runtimeRange) * plotW;
  const toY = (rating: number) =>
    padding.top + plotH - ((rating - minRating) / ratingRange) * plotH;

  if (data.length === 0) return null;

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">
          Runtime vs Rating
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Does movie length correlate with how I rate it? Each tick is a rated movie.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          It appears I do like longer movies more. ☺️
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="w-full relative" style={{ height: chartHeight }}>
          {/* Y-axis labels */}
          {Array.from({ length: Math.ceil(ratingRange) + 1 }, (_, i) => {
            const r = minRating + i;
            if (r > maxRating) return null;
            const yPct = (toY(r) / chartHeight) * 100;
            return (
              <span
                key={r}
                className="absolute left-0 text-[10px] text-muted-foreground tabular-nums -translate-y-1/2"
                style={{ top: `${yPct}%` }}
              >
                {r}
              </span>
            );
          })}

          {/* X-axis labels */}
          {Array.from({ length: Math.floor(runtimeRange / 30) + 1 }, (_, i) => {
            const rt = minRuntime + i * 30;
            if (rt > maxRuntime) return null;
            const xPct = (toX(rt) / chartWidth) * 100;
            return (
              <span
                key={rt}
                className="absolute bottom-0 text-[10px] text-muted-foreground tabular-nums -translate-x-1/2"
                style={{ left: `${xPct}%` }}
              >
                {rt}m
              </span>
            );
          })}

          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            {/* Grid */}
            {Array.from({ length: Math.ceil(ratingRange) + 1 }, (_, i) => {
              const r = minRating + i;
              if (r > maxRating) return null;
              return (
                <line
                  key={`gy-${r}`}
                  x1={padding.left}
                  y1={toY(r)}
                  x2={chartWidth - padding.right}
                  y2={toY(r)}
                  stroke="var(--silver)"
                  strokeOpacity={0.15}
                  strokeWidth={0.15}
                  strokeDasharray="0.6 0.6"
                />
              );
            })}
            {Array.from({ length: Math.floor(runtimeRange / 30) + 1 }, (_, i) => {
              const rt = minRuntime + i * 30;
              if (rt > maxRuntime) return null;
              return (
                <line
                  key={`gx-${rt}`}
                  x1={toX(rt)}
                  y1={padding.top}
                  x2={toX(rt)}
                  y2={padding.top + plotH}
                  stroke="var(--silver)"
                  strokeOpacity={0.1}
                  strokeWidth={0.15}
                  strokeDasharray="0.6 0.6"
                />
              );
            })}
            {/* Data points */}
            {data.map((d) => (
              <line
                key={d.tmdb_id}
                x1={toX(d.runtime)}
                y1={toY(d.rating) - 6}
                x2={toX(d.runtime)}
                y2={toY(d.rating) + 6}
                stroke={getRatingColorVar(d.rating)}
                strokeWidth={0.3}
                strokeOpacity={0.8}
              />
            ))}
          </svg>

          {/* Grouped Tooltips for Overlapping Movies with fixed width container */}
          {pointGroups.map((group) => {
            const leftPct = (toX(group.runtime) / chartWidth) * 100;
            const topPct = (toY(group.rating) / chartHeight) * 100;

            return (
              <Tooltip
                key={`tt-${group.runtime}-${group.rating}`}
                placement="top"
                className="w-56 whitespace-normal p-1.5"
                content={
                  <div className="flex flex-col gap-1.5 w-full">
                    {group.visibleMovies.map((m, idx) => (
                      <div
                        key={m.tmdb_id}
                        className={`flex flex-col gap-0.5 ${
                          idx > 0 ? 'border-t border-border/10 pt-1.5' : ''
                        }`}
                      >
                        <span className="font-medium text-gold leading-tight wrap-break-word">
                          {m.title}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {m.runtime}m · ★ {m.rating}
                          {m.release_year ? ` · ${m.release_year}` : ''}
                        </span>
                      </div>
                    ))}
                    {group.extraCount > 0 && (
                      <div className="border-t border-border/15 pt-1 text-[10px] italic text-quicksilver/80">
                        + {group.extraCount} more movie{group.extraCount > 1 ? 's' : ''} at{' '}
                        {group.runtime}m (★ {group.rating})
                      </div>
                    )}
                  </div>
                }
              >
                <div
                  className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 cursor-default bg-transparent"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                />
              </Tooltip>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/10 text-[10px] text-muted-foreground flex-wrap">
          <span>X: Runtime (min) · Y: Your Rating</span>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-amethyst opacity-70" /> ≥9
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-sapphire opacity-70" /> 8–9
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald opacity-70" /> 7–8
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-topaz opacity-70" /> 5–7
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-ruby opacity-70" /> &lt;5
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
