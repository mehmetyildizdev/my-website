'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
import { getGenreColor } from '@/components/screen/slugs/genre/genreThemes';

function getColor(genre: string): string {
  return getGenreColor(genre);
}

const DECADES = [
  { value: '1980', label: '1980s' },
  { value: '1990', label: '1990s' },
  { value: '2000', label: '2000s' },
  { value: '2010', label: '2010s' },
  { value: '2020', label: '2020s' },
];

export default function GenreBumpChart({ data }: { data: YearlyGenreData[] }) {
  const [decade, setDecade] = useState<string>('2010');

  // Dynamically filter decades that actually have data
  const availableDecades = useMemo(() => {
    return DECADES.filter((d) => {
      const start = parseInt(d.value);
      const end = start + 9;
      return data.some((item) => item.year >= start && item.year <= end);
    });
  }, [data]);

  // Adjust selected decade if current one is not available
  const activeDecade = useMemo(() => {
    if (availableDecades.some((d) => d.value === decade)) {
      return decade;
    }
    return availableDecades[availableDecades.length - 1]?.value || '2010';
  }, [availableDecades, decade]);

  // All genres across all decades (for persistent legend)
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => set.add(d.name));
    return Array.from(set).sort();
  }, [data]);

  const decadeStart = parseInt(activeDecade);
  const decadeEnd = decadeStart + 9;

  // Filter data to selected decade
  const filtered = useMemo(() => {
    return data.filter((d) => d.year >= decadeStart && d.year <= decadeEnd);
  }, [data, decadeStart, decadeEnd]);

  // Get genres that have data in this decade (at least 3 years of data)
  const genres = useMemo(() => {
    const genreYears = new Map<string, number>();
    filtered.forEach((d) => {
      genreYears.set(d.name, (genreYears.get(d.name) || 0) + 1);
    });
    return Array.from(genreYears.entries())
      .filter(([, count]) => count >= 3)
      .map(([name]) => name)
      .sort();
  }, [filtered]);

  // Build data structure: genre → year → rating
  const genreData = useMemo(() => {
    const map = new Map<string, Map<number, { rating: number; count: number }>>();
    filtered.forEach((d) => {
      if (!genres.includes(d.name)) return;
      if (!map.has(d.name)) map.set(d.name, new Map());
      map.get(d.name)!.set(d.year, { rating: Number(d.avg_rating), count: d.count });
    });
    return map;
  }, [filtered, genres]);

  // Years in this decade
  const years = useMemo(() => {
    const set = new Set<number>();
    filtered.forEach((d) => {
      if (genres.includes(d.name)) set.add(d.year);
    });
    return Array.from(set).sort();
  }, [filtered, genres]);

  // Chart dimensions
  const chartHeight = 560;
  const chartPadding = { top: 20, bottom: 30, left: 10, right: 10 };
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  // Rating scale (find min/max across visible data)
  const { minRating, maxRating } = useMemo(() => {
    let min = 10,
      max = 0;
    genreData.forEach((yearMap) => {
      yearMap.forEach(({ rating }) => {
        if (rating < min) min = rating;
        if (rating > max) max = rating;
      });
    });
    return {
      minRating: Math.max(0, Math.floor(min - 0.5)),
      maxRating: Math.min(10, Math.ceil(max + 0.5)),
    };
  }, [genreData]);

  const ratingRange = maxRating - minRating || 1;

  // Convert rating to Y position
  const ratingToY = (rating: number) => {
    return chartPadding.top + plotHeight - ((rating - minRating) / ratingRange) * plotHeight;
  };

  // X positions for each year
  const yearToX = (year: number) => {
    if (years.length <= 1) return 50;
    const idx = years.indexOf(year);
    const pct = idx / (years.length - 1);
    return 5 + pct * 90; // 5% to 95% of width
  };

  // Active genre for highlighting — persists across decade changes
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [lockedGenre, setLockedGenre] = useState<string | null>(null);

  // Toggle genre lock on click
  const toggleGenre = (genre: string) => {
    if (lockedGenre === genre) {
      setLockedGenre(null);
      setActiveGenre(null);
    } else {
      setLockedGenre(genre);
      setActiveGenre(genre);
    }
  };

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-accent">
            Genre Rating Trends
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            How my average rating per genre changes across release years. Hover lines to highlight.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:self-center self-start">
          {availableDecades.map((d) => {
            const isSelected = activeDecade === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setDecade(d.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-accent/60 bg-accent/15 text-accent shadow-sm'
                    : 'border-border/20 bg-card/40 text-muted-foreground hover:border-border/50 hover:text-foreground'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {genres.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-8">
            Not enough data for this decade.
          </p>
        ) : (
          <>
            {/* SVG Chart */}
            <div className="w-full relative" style={{ height: chartHeight }}>
              {/* Y-axis labels (HTML) */}
              {Array.from({ length: Math.ceil(ratingRange) + 1 }, (_, i) => {
                const rating = minRating + i;
                if (rating > maxRating) return null;
                const yPct =
                  ((chartPadding.top +
                    plotHeight -
                    ((rating - minRating) / ratingRange) * plotHeight) /
                    chartHeight) *
                  100;
                return (
                  <span
                    key={`y-${rating}`}
                    className="absolute left-0 text-[10px] text-muted-foreground tabular-nums -translate-y-1/2"
                    style={{ top: `${yPct}%` }}
                  >
                    {rating}
                  </span>
                );
              })}

              {/* X-axis labels (HTML) */}
              {years.map((year) => (
                <span
                  key={`x-${year}`}
                  className="absolute bottom-0 text-[10px] text-muted-foreground tabular-nums -translate-x-1/2"
                  style={{ left: `${yearToX(year)}%` }}
                >
                  {year}
                </span>
              ))}

              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 100 ${chartHeight}`}
                preserveAspectRatio="none"
                className="overflow-visible"
              >
                {/* Y-axis grid lines */}
                {Array.from({ length: Math.ceil(ratingRange) + 1 }, (_, i) => {
                  const rating = minRating + i;
                  if (rating > maxRating) return null;
                  const y = ratingToY(rating);
                  return (
                    <line
                      key={`grid-y-${rating}`}
                      x1="5"
                      y1={y}
                      x2="95"
                      y2={y}
                      stroke="var(--silver)"
                      strokeOpacity={0.15}
                      strokeWidth={0.12}
                      strokeDasharray="0.5 0.5"
                    />
                  );
                })}

                {/* X-axis grid lines */}
                {years.map((year) => {
                  const x = yearToX(year);
                  return (
                    <line
                      key={`grid-x-${year}`}
                      x1={x}
                      y1={chartPadding.top}
                      x2={x}
                      y2={chartPadding.top + plotHeight}
                      stroke="var(--silver)"
                      strokeOpacity={0.1}
                      strokeWidth={0.1}
                      strokeDasharray="0.5 0.5"
                    />
                  );
                })}

                {/* Lines for each genre */}
                {genres.map((genre) => {
                  const yearMap = genreData.get(genre);
                  if (!yearMap) return null;
                  const points = years
                    .filter((y) => yearMap.has(y))
                    .map((y) => ({
                      x: yearToX(y),
                      y: ratingToY(yearMap.get(y)!.rating),
                      year: y,
                      ...yearMap.get(y)!,
                    }));

                  if (points.length < 2) return null;

                  const pathD = points
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                    .join(' ');

                  const isActive = activeGenre === genre;
                  const isDimmed = activeGenre !== null && !isActive;

                  // Line thickness based on total count for this genre in the decade
                  const totalCount = points.reduce((sum, p) => sum + p.count, 0);
                  const maxGenreCount = Math.max(
                    ...genres.map((g) => {
                      const ym = genreData.get(g);
                      if (!ym) return 0;
                      let s = 0;
                      ym.forEach((v) => {
                        s += v.count;
                      });
                      return s;
                    }),
                    1
                  );
                  const countRatio = totalCount / maxGenreCount;
                  const baseWidth = 0.2 + countRatio * 0.5; // range: 0.2 to 0.7
                  const strokeW = isActive ? baseWidth * 1.8 : baseWidth;

                  return (
                    <g key={genre}>
                      {/* Thick transparent path for easier hover/click targeting */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="cursor-pointer"
                        onMouseEnter={() => {
                          if (!lockedGenre) setActiveGenre(genre);
                        }}
                        onMouseLeave={() => {
                          if (!lockedGenre) setActiveGenre(null);
                        }}
                        onClick={() => toggleGenre(genre)}
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={getColor(genre)}
                        strokeWidth={strokeW}
                        strokeOpacity={isDimmed ? 0.15 : isActive ? 1 : 0.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => {
                          if (!lockedGenre) setActiveGenre(genre);
                        }}
                        onMouseLeave={() => {
                          if (!lockedGenre) setActiveGenre(null);
                        }}
                        onClick={() => toggleGenre(genre)}
                      />
                      {/* Dots at data points */}
                      {points.map((p) => (
                        <circle
                          key={p.year}
                          cx={p.x}
                          cy={p.y}
                          r={isActive ? 0.8 : 0.45 + countRatio * 0.25}
                          fill={getColor(genre)}
                          fillOpacity={isDimmed ? 0.15 : isActive ? 1 : 0.7}
                          className="cursor-pointer"
                          onMouseEnter={() => {
                            if (!lockedGenre) setActiveGenre(genre);
                          }}
                          onMouseLeave={() => {
                            if (!lockedGenre) setActiveGenre(null);
                          }}
                          onClick={() => toggleGenre(genre)}
                        />
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Genre legend (interactive filter — persists across decades) */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 pt-3 border-t border-border/10 max-w-3xl mx-auto">
              {allGenres.map((genre) => {
                const isActive = activeGenre === genre;
                const isDimmed = activeGenre !== null && !isActive;
                const isInDecade = genres.includes(genre);
                const yearMap = genreData.get(genre);
                const latestYear = years.filter((y) => yearMap?.has(y)).pop();
                const latestRating = latestYear ? yearMap?.get(latestYear)?.rating : null;

                return (
                  <Tooltip
                    key={genre}
                    placement="top"
                    content={
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{genre}</span>
                        {latestRating != null && (
                          <span className="text-muted-foreground">
                            Latest: {latestRating.toFixed(2)} ({latestYear})
                          </span>
                        )}
                        {!isInDecade && (
                          <span className="text-muted-foreground italic">No data in {decade}s</span>
                        )}
                      </div>
                    }
                  >
                    <button
                      onMouseEnter={() => {
                        if (!lockedGenre) setActiveGenre(genre);
                      }}
                      onMouseLeave={() => {
                        if (!lockedGenre) setActiveGenre(null);
                      }}
                      onClick={() => toggleGenre(genre)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] transition-all border border-transparent ${
                        isActive
                          ? 'bg-pearl/40 border-border/30'
                          : isDimmed
                            ? 'opacity-30'
                            : !isInDecade
                              ? 'opacity-40'
                              : 'hover:bg-pearl/20'
                      }`}
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getColor(genre) }}
                      />
                      <span className="text-foreground/80">{genre}</span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
