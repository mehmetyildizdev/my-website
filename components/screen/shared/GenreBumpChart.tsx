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

  // Parse string fields from database to numbers
  const parsedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      avg_rating: Number(d.avg_rating),
      count: Number(d.count),
    }));
  }, [data]);

  // Dynamically check each decade to see if it has renderable chart data (genres with >= 2 years of data)
  const decadesWithStatus = useMemo(() => {
    return DECADES.map((d) => {
      const start = parseInt(d.value);
      const end = start + 9;
      const filteredForDecade = parsedData.filter((item) => item.year >= start && item.year <= end);
      const genreYears = new Map<string, number>();
      filteredForDecade.forEach((item) => {
        genreYears.set(item.name, (genreYears.get(item.name) || 0) + 1);
      });
      const hasData = Array.from(genreYears.values()).some((count) => count >= 2);
      return { ...d, hasData };
    });
  }, [parsedData]);

  const availableDecades = useMemo(() => {
    return decadesWithStatus.filter((d) => d.hasData);
  }, [decadesWithStatus]);

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
    parsedData.forEach((d) => set.add(d.name));
    return Array.from(set).sort();
  }, [parsedData]);

  const decadeStart = parseInt(activeDecade);
  const decadeEnd = decadeStart + 9;

  // Filter data to selected decade
  const filtered = useMemo(() => {
    return parsedData.filter((d) => d.year >= decadeStart && d.year <= decadeEnd);
  }, [parsedData, decadeStart, decadeEnd]);

  // Max count of watched items for any genre in a single year within the active decade
  const maxYearlyCount = useMemo(() => {
    const counts = filtered.map((d) => d.count || 0);
    return Math.max(...counts, 1);
  }, [filtered]);

  // Get genres that have data in this decade (at least 3 years of data)
  const genres = useMemo(() => {
    const genreYears = new Map<string, number>();
    filtered.forEach((d) => {
      genreYears.set(d.name, (genreYears.get(d.name) || 0) + 1);
    });
    return Array.from(genreYears.entries())
      .filter(([, count]) => count >= 2)
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

  // Fixed rating scale from 1 to 10
  const minRating = 1;
  const maxRating = 10;
  const ratingRange = 9;

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

  // Active genres for highlighting — multi-select, persists across decade changes
  const [activeGenres, setActiveGenres] = useState<Set<string>>(new Set());
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  // Toggle genre selection on click
  const toggleGenre = (genre: string) => {
    setActiveGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) {
        next.delete(genre);
      } else {
        next.add(genre);
      }
      return next;
    });
  };

  // Effective highlighted set: locked selections + current hover
  const highlightedGenres = useMemo(() => {
    const set = new Set(activeGenres);
    if (hoveredGenre) set.add(hoveredGenre);
    return set;
  }, [activeGenres, hoveredGenre]);

  const hasHighlight = highlightedGenres.size > 0;

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
          <p className="text-xs text-muted-foreground mt-1">
            Line thickness represents volume of watched titles per genre per year leading to next
            year based on total titles count in the decade.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:self-center self-start">
          {decadesWithStatus.map((d) => {
            const isSelected = activeDecade === d.value;
            const isDisabled = !d.hasData;
            return (
              <button
                key={d.value}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && setDecade(d.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isDisabled
                    ? 'border-border/10 bg-card/20 text-muted-foreground/30 opacity-40 cursor-not-allowed'
                    : isSelected
                      ? 'border-accent/60 bg-accent/15 text-accent shadow-sm cursor-pointer'
                      : 'border-border/20 bg-card/40 text-muted-foreground hover:border-border/50 hover:text-foreground cursor-pointer'
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
            <div
              className="w-full relative select-none"
              style={{ height: chartHeight }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
                const mouseY = ((e.clientY - rect.top) / rect.height) * chartHeight;

                // Find the closest year's X percentage
                let closestYear = years[0];
                let minDiff = Infinity;
                years.forEach((year) => {
                  const xPct = yearToX(year);
                  const diff = Math.abs(mouseXPercent - xPct);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closestYear = year;
                  }
                });

                // Only snap if within a reasonable distance (e.g. 8% of width)
                if (minDiff < 8) {
                  setHoveredYear(closestYear);
                } else {
                  setHoveredYear(null);
                }

                // Calculate rating value from Y position
                const rating =
                  minRating + ((chartPadding.top + plotHeight - mouseY) / plotHeight) * ratingRange;
                if (rating >= minRating && rating <= maxRating) {
                  setHoveredRating(rating);
                } else {
                  setHoveredRating(null);
                }
              }}
              onMouseLeave={() => {
                setHoveredYear(null);
                setHoveredRating(null);
              }}
            >
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

              {/* Floating Y-axis ruler label */}
              {hoveredRating !== null && (
                <span
                  className="absolute left-0 text-[10px] font-bold text-gold bg-pearl/95 border border-gold/40 px-1 py-0.5 rounded shadow-lg shadow-gold/5 tabular-nums -translate-y-1/2 z-30 pointer-events-none"
                  style={{
                    top: `${(ratingToY(hoveredRating) / chartHeight) * 100}%`,
                  }}
                >
                  {hoveredRating.toFixed(1)}
                </span>
              )}

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
                {/* Active Year Tracker Line */}
                {hoveredYear !== null && (
                  <line
                    x1={yearToX(hoveredYear)}
                    y1={chartPadding.top}
                    x2={yearToX(hoveredYear)}
                    y2={chartPadding.top + plotHeight}
                    stroke="var(--gold)"
                    strokeOpacity={0.45}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="4 2"
                    className="pointer-events-none transition-all duration-150"
                  />
                )}

                {/* Y-axis Ruler (Horizontal Tracker Line) */}
                {hoveredRating !== null && (
                  <line
                    x1="5"
                    y1={ratingToY(hoveredRating)}
                    x2="95"
                    y2={ratingToY(hoveredRating)}
                    stroke="var(--gold)"
                    strokeOpacity={0.35}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="4 2"
                    className="pointer-events-none transition-all duration-75"
                  />
                )}

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
                      stroke="var(--quicksilver)"
                      strokeOpacity={0.25}
                      strokeWidth={0.5}
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray="2 3"
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
                      stroke="var(--quicksilver)"
                      strokeOpacity={0.1}
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray="2 3"
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

                  const isActive = highlightedGenres.has(genre);
                  const isDimmed = hasHighlight && !isActive;

                  // Denominator = total count across ALL genres in the decade.
                  // This keeps low-volume genres (Documentary) thin even at their peak year,
                  // while letting high-volume genres (Drama, Action) vary meaningfully.
                  const allGenresDecadeTotal = Math.max(
                    Array.from(genreData.values()).reduce((sum, ym) => {
                      ym.forEach((v) => {
                        sum += v.count;
                      });
                      return sum;
                    }, 0),
                    1
                  );

                  return (
                    <g key={genre}>
                      {points.slice(0, -1).map((pStart, idx) => {
                        const pEnd = points[idx + 1];

                        // Each segment's thickness = avg of the two years' counts
                        // normalized against ALL genres' decade total.
                        // → rare genres stay thin; popular genres vary year-to-year.
                        const startRatio = pStart.count / allGenresDecadeTotal;
                        const endRatio = pEnd.count / allGenresDecadeTotal;
                        const avgRatio = (startRatio + endRatio) / 2;

                        const baseWidth = 1.2 + avgRatio * 200; // scale so top genres reach ~4–6px
                        const strokeW = baseWidth; // no extra boost on selection — let ratios speak

                        const segmentD = `M ${pStart.x} ${pStart.y} L ${pEnd.x} ${pEnd.y}`;

                        return (
                          <g key={`${pStart.year}-${pEnd.year}`}>
                            {/* Thick transparent path for easier hover/click targeting */}
                            <path
                              d={segmentD}
                              fill="none"
                              stroke="transparent"
                              strokeWidth={18}
                              vectorEffect="non-scaling-stroke"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="cursor-pointer"
                              onMouseEnter={() => {
                                setHoveredGenre(genre);
                              }}
                              onMouseLeave={() => {
                                setHoveredGenre(null);
                              }}
                              onClick={() => toggleGenre(genre)}
                            />
                            <path
                              d={segmentD}
                              fill="none"
                              stroke={getColor(genre)}
                              strokeWidth={strokeW}
                              vectorEffect="non-scaling-stroke"
                              strokeOpacity={isDimmed ? 0.15 : isActive ? 1 : 0.7}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="cursor-pointer transition-[stroke-opacity,stroke-width] duration-200"
                              onMouseEnter={() => {
                                setHoveredGenre(genre);
                              }}
                              onMouseLeave={() => {
                                setHoveredGenre(null);
                              }}
                              onClick={() => toggleGenre(genre)}
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>

              {/* HTML absolute dot nodes to prevent non-uniform SVG scaling distortion */}
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

                const isActive = highlightedGenres.has(genre);
                const isDimmed = hasHighlight && !isActive;

                // Same denominator as line segments — all genres' decade total
                const allGenresDecadeTotal = Math.max(
                  Array.from(genreData.values()).reduce((sum, ym) => {
                    ym.forEach((v) => {
                      sum += v.count;
                    });
                    return sum;
                  }, 0),
                  1
                );

                return points.map((p) => {
                  const ratio = p.count / allGenresDecadeTotal;
                  // Min 6px so dots always sit visibly on lines. Cap at 18px.
                  const dotSize = Math.min(Math.max(6 + ratio * 400, 6), 18);
                  const isYearHovered = hoveredYear === p.year;

                  return (
                    <div
                      key={`dot-${genre}-${p.year}`}
                      className="absolute rounded-full cursor-pointer transition-all duration-200"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}px`,
                        width: `${isYearHovered ? dotSize + 4 : dotSize}px`,
                        height: `${isYearHovered ? dotSize + 4 : dotSize}px`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: isYearHovered ? getColor(genre) : '#121214',
                        border: `${isActive || isYearHovered ? '2.5px' : '1.5px'} solid ${
                          isYearHovered ? '#121214' : getColor(genre)
                        }`,
                        opacity: isDimmed ? 0.15 : 1,
                        zIndex: isActive || isYearHovered ? 20 : 10,
                        boxShadow: isYearHovered ? `0 0 8px ${getColor(genre)}` : undefined,
                      }}
                      onMouseEnter={() => {
                        setHoveredGenre(genre);
                      }}
                      onMouseLeave={() => {
                        setHoveredGenre(null);
                      }}
                      onClick={() => toggleGenre(genre)}
                    />
                  );
                });
              })}
            </div>

            {/* Genre legend (interactive filter — persists across decades) */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 pt-3 border-t border-border/10 max-w-5xl mx-auto">
              {allGenres.map((genre) => {
                const isActive = highlightedGenres.has(genre);
                const isDimmed = hasHighlight && !isActive;
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
                        setHoveredGenre(genre);
                      }}
                      onMouseLeave={() => {
                        setHoveredGenre(null);
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
