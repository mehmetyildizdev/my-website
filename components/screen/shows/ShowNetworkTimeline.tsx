'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';

type NetworkYear = {
  network_name: string;
  year: number;
  show_count: number;
  avg_rating: string | number;
  show_names: string[] | null;
};

const NETWORK_COLORS: Record<string, string> = {
  Netflix: 'var(--ruby)',
  HBO: 'var(--amethyst)',
  'Amazon Prime Video': 'var(--sapphire)',
  'Prime Video': 'var(--sapphire)',
  'Apple TV+': 'var(--quicksilver)',
  Hulu: 'var(--emerald)',
  'Disney+': 'var(--sapphire)',
  BBC: 'var(--topaz)',
  FX: 'var(--gold)',
  AMC: 'var(--emerald)',
  Showtime: 'var(--ruby)',
  Syfy: 'var(--gold)',
  'The WB': 'var(--gold)',
};

// Gemstone cycle for networks not in the static map
const GEM_CYCLE = [
  'var(--sapphire)',
  'var(--ruby)',
  'var(--emerald)',
  'var(--amethyst)',
  'var(--topaz)',
];

function getNetworkColor(name: string, index: number): string {
  if (NETWORK_COLORS[name]) return NETWORK_COLORS[name];
  return GEM_CYCLE[index % GEM_CYCLE.length];
}

// Empty cell style — set to "transparent" for invisible, or a color value for a dot
const EMPTY_CIRCLE_COLOR = 'transparent';
const ROW_HEIGHT = 36;
const MAX_BUBBLE = 26;
const MIN_BUBBLE = 6;

export default function ShowNetworkTimeline({ data }: { data: NetworkYear[] }) {
  // Group by network
  const networks = useMemo(() => {
    const map = new Map<
      string,
      { years: Map<number, { count: number; rating: number; shows: string[] }>; total: number }
    >();
    data.forEach((d) => {
      if (!map.has(d.network_name)) map.set(d.network_name, { years: new Map(), total: 0 });
      const entry = map.get(d.network_name)!;
      entry.years.set(d.year, {
        count: d.show_count,
        rating: Number(d.avg_rating),
        shows: d.show_names ?? [],
      });
      entry.total += d.show_count;
    });
    // Sort by total shows descending, take top 10
    return Array.from(map.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10);
  }, [data]);

  const years = useMemo(() => {
    const set = new Set<number>();
    data.forEach((d) => set.add(d.year));
    return Array.from(set).sort();
  }, [data]);

  const maxCount = useMemo(() => {
    let max = 0;
    data.forEach((d) => {
      if (d.show_count > max) max = d.show_count;
    });
    return max || 1;
  }, [data]);

  if (networks.length === 0) {
    return null;
  }

  // Calculate a fixed width per year column to ensure proper scrolling
  const yearColWidth = 56; // px per year column
  const labelWidth = 130; // px for network name
  const dataWidth = years.length * yearColWidth;

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">
          Network Timeline
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Shows watched per year from top networks. Bubble size = count.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <div className="flex" style={{ minWidth: labelWidth + dataWidth }}>
            {/* Sticky left column — network names */}
            <div
              className="sticky left-0 z-10 bg-background/80 backdrop-blur-sm shrink-0"
              style={{ width: labelWidth }}
            >
              {/* Header spacer */}
              <div className="mb-2" style={{ height: 20 }} />
              {/* Network labels */}
              {networks.map(([name], networkIdx) => {
                const color = getNetworkColor(name, networkIdx);
                return (
                  <div
                    key={name}
                    className="flex items-center gap-1.5 pr-2"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-foreground/80 truncate">{name}</span>
                  </div>
                );
              })}
            </div>

            {/* Scrollable data area */}
            <div className="flex-1" style={{ minWidth: dataWidth }}>
              {/* Year headers */}
              <div className="flex items-center mb-2" style={{ height: 20 }}>
                {years.map((y) => (
                  <div key={y} style={{ width: yearColWidth }} className="shrink-0 text-center">
                    <span className="text-[10px] text-muted-foreground tabular-nums">{y}</span>
                  </div>
                ))}
              </div>

              {/* Network data rows — fixed height */}
              {networks.map(([name, { years: yearMap }], networkIdx) => {
                const color = getNetworkColor(name, networkIdx);
                return (
                  <div
                    key={name}
                    className="flex items-center hover:bg-pearl/20 rounded transition-colors"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {years.map((y) => {
                      const entry = yearMap.get(y);
                      if (!entry) {
                        return (
                          <div
                            key={y}
                            style={{ width: yearColWidth }}
                            className="shrink-0 flex justify-center items-center"
                          >
                            {EMPTY_CIRCLE_COLOR !== 'transparent' && (
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: EMPTY_CIRCLE_COLOR }}
                              />
                            )}
                          </div>
                        );
                      }
                      const size = Math.max(MIN_BUBBLE, (entry.count / maxCount) * MAX_BUBBLE);
                      return (
                        <Tooltip
                          key={y}
                          placement="top"
                          offset={16}
                          content={
                            <div className="flex flex-col gap-0.5 min-w-[160px]">
                              <span
                                className="font-semibold text-gold"
                                style={{ fontFamily: 'var(--font-poppins)' }}
                              >
                                {name} ({y})
                              </span>
                              <div className="flex justify-between gap-4 text-[11px] mt-1">
                                <span className="text-quicksilver">Shows</span>
                                <span className="text-platinum font-semibold tabular-nums">
                                  {entry.count}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4 text-[11px]">
                                <span className="text-quicksilver">Avg Rating</span>
                                <span className="text-emerald tabular-nums">
                                  {entry.rating.toFixed(1)}
                                </span>
                              </div>
                              {entry.shows.length > 0 && (
                                <div className="mt-1 pt-1 border-t border-border/20 space-y-0.5">
                                  {entry.shows.slice(0, 8).map((show) => (
                                    <p key={show} className="text-[10px] text-foreground/70">
                                      {show}
                                    </p>
                                  ))}
                                  {entry.shows.length > 8 && (
                                    <p className="text-[10px] text-muted-foreground">
                                      +{entry.shows.length - 8} more
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          }
                        >
                          <div
                            style={{ width: yearColWidth }}
                            className="shrink-0 flex justify-center items-center"
                          >
                            <div
                              className="rounded-full transition-all hover:scale-125"
                              style={{
                                width: size,
                                height: size,
                                backgroundColor: color,
                                opacity: 0.75,
                              }}
                            />
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
