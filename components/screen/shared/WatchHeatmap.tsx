'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Select } from '@/components/shadcn/ui/select';
import { Tooltip } from '@/components/shadcn/ui/tooltip';

type DayData = {
  watch_date: string;
  watch_count: number;
};

type StatsEntry = {
  media_type: 'movie' | 'episode';
  watched_at: string;
  runtime_minutes: number | null;
  show_or_movie_id: number | null;
  countries: string[] | null;
};

type Props = {
  data: DayData[];
  stats?: StatsEntry[];
  embedded?: boolean;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const INTENSITY_CLASSES = [
  'bg-border/10', // 0: empty
  'bg-emerald/25', // 1: low (1 watch)
  'bg-emerald/40', // 2: medium
  'bg-emerald/66', // 3: high
  'bg-emerald/100', // 4: max
];

function getIntensity(count: number, max: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  const ratio = count / max;
  if (ratio > 0.66) return 4;
  if (ratio > 0.33) return 3;
  return 2;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, n: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h.toLocaleString()}h ${m}m` : `${h.toLocaleString()}h`;
}

export default function WatchHeatmap({ data, stats, embedded = false }: Props) {
  const currentYear = new Date().getFullYear();

  // Parse watch_count from string to number, filtering out dates before 2001
  const parsedData = useMemo(() => {
    return data
      .filter((d) => {
        if (!d.watch_date) return false;
        const y = parseInt(d.watch_date.slice(0, 4));
        return !isNaN(y) && y >= 2001;
      })
      .map((d) => ({
        ...d,
        watch_count: Number(d.watch_count),
      }));
  }, [data]);

  // Build lookup map
  const dateMap = useMemo(() => {
    const map = new Map<string, number>();
    parsedData.forEach((d) => map.set(d.watch_date, d.watch_count));
    return map;
  }, [parsedData]);

  // Build cumulative map for "all" mode
  const cumulativeMap = useMemo(() => {
    const map = new Map<string, number>();
    parsedData.forEach((d) => {
      if (d.watch_date) {
        const mmdd = d.watch_date.slice(5);
        map.set(mmdd, (map.get(mmdd) || 0) + d.watch_count);
      }
    });
    return map;
  }, [parsedData]);

  const [selectedYear, setSelectedYear] = useState<string>('recent');

  // Generate year options dynamically from actual data
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    parsedData.forEach((d) => {
      if (d.watch_date) {
        const y = parseInt(d.watch_date.slice(0, 4));
        if (!isNaN(y)) years.add(y);
      }
    });

    // Ensure current year is an option
    years.add(currentYear);

    const sortedYears = Array.from(years).sort((a, b) => b - a);

    const options: { value: string; label: string }[] = [
      { value: 'all', label: 'All (cumulative)' },
      { value: 'recent', label: 'Last 12 months' },
    ];
    sortedYears.forEach((y) => {
      options.push({ value: String(y), label: String(y) });
    });
    return options;
  }, [parsedData, currentYear]);

  // Build the grid
  const { grid, monthPositions, maxCount, totalWatches } = useMemo(() => {
    let rangeStart: Date;
    let rangeEnd: Date;

    if (selectedYear === 'recent') {
      const today = new Date();
      rangeEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      rangeStart = new Date(rangeEnd.getFullYear() - 1, rangeEnd.getMonth(), rangeEnd.getDate() + 1);
    } else {
      const year = selectedYear === 'all' ? currentYear : parseInt(selectedYear);
      rangeStart = new Date(year, 0, 1);
      rangeEnd = new Date(year, 11, 31);
    }

    const gridStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    if (selectedYear === 'recent') {
      const startDow = gridStart.getDay();
      if (startDow !== 0) gridStart.setDate(gridStart.getDate() - startDow);
    }

    const gridEnd = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    if (selectedYear === 'recent') {
      const endDow = gridEnd.getDay();
      if (endDow !== 6) gridEnd.setDate(gridEnd.getDate() + (6 - endDow));
    }

    const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000) + 1;
    const numWeeks = Math.ceil(totalDays / 7);

    let max = 0;
    let total = 0;

    const weeks: { date: string; count: number; tooltipLabel: string }[][] = [];
    const rawMonths: { month: number; year: number; col: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < numWeeks; w++) {
      const week: { date: string; count: number; tooltipLabel: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = addDays(gridStart, w * 7 + d);
        const dateStr = formatDate(cellDate);

        let count: number;
        if (selectedYear === 'all') {
          const mmdd = dateStr.slice(5);
          count = cumulativeMap.get(mmdd) || 0;
        } else {
          count = dateMap.get(dateStr) || 0;
        }

        if (cellDate >= rangeStart && cellDate <= rangeEnd) {
          if (count > max) max = count;
          total += count;
        }

        const tooltipLabel = selectedYear === 'all' ? `${MONTH_LABELS[cellDate.getMonth()]} ${cellDate.getDate()}` : dateStr;

        week.push({ date: dateStr, count, tooltipLabel });

        if (d === 0) {
          const month = cellDate.getMonth();
          if (month !== lastMonth) {
            if (rawMonths.length === 0 || w - rawMonths[rawMonths.length - 1].col >= 3) {
              rawMonths.push({
                month,
                year: cellDate.getFullYear(),
                col: w,
              });
            }
            lastMonth = month;
          }
        }
      }
      weeks.push(week);
    }

    const monthPositions = rawMonths.map((m, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === rawMonths.length - 1;
      const isYearChange = idx > 0 && m.year !== rawMonths[idx - 1].year;

      const includeYear = selectedYear !== 'all' && (isFirst || isLast || isYearChange);
      const yearSuffix = includeYear ? `(${String(m.year).slice(2)})` : '';

      return {
        label: `${MONTH_LABELS[m.month]}${yearSuffix}`,
        col: m.col,
      };
    });

    return {
      grid: weeks,
      monthPositions,
      maxCount: max || 1,
      totalWatches: total,
    };
  }, [selectedYear, dateMap, cumulativeMap, currentYear]);

  // Compute stats filtered by selected period
  const computedStats = useMemo(() => {
    if (!stats || stats.length === 0) return null;

    let filtered: StatsEntry[];

    if (selectedYear === 'all') {
      filtered = stats; // all time
    } else if (selectedYear === 'recent') {
      const today = new Date();
      const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate() + 1);
      const cutoff = formatDate(yearAgo);
      filtered = stats.filter((s) => s.watched_at >= cutoff);
    } else {
      const yearStart = `${selectedYear}-01-01`;
      const yearEnd = `${selectedYear}-12-31`;
      filtered = stats.filter((s) => s.watched_at >= yearStart && s.watched_at <= yearEnd);
    }

    const movies = filtered.filter((s) => s.media_type === 'movie');
    const episodes = filtered.filter((s) => s.media_type === 'episode');

    const movieCount = movies.length;
    const episodeCount = episodes.length;
    const movieMinutes = movies.reduce((sum, s) => sum + (s.runtime_minutes || 0), 0);
    const episodeMinutes = episodes.reduce((sum, s) => sum + (s.runtime_minutes || 0), 0);

    // Unique shows from episodes
    const showIds = new Set(episodes.map((s) => s.show_or_movie_id).filter(Boolean));
    const showCount = showIds.size;

    // Unique countries
    const countrySet = new Set<string>();
    filtered.forEach((s) => {
      if (s.countries) s.countries.forEach((c) => countrySet.add(c));
    });

    // Longest daily streak (consecutive days with at least 1 watch)
    const watchDates = new Set<string>();
    filtered.forEach((s) => {
      if (s.watched_at) watchDates.add(s.watched_at.slice(0, 10));
    });
    const sortedDates = Array.from(watchDates).sort();
    let longestDailyStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr.getTime() - prev.getTime()) / 86400000;
        currentStreak = diff === 1 ? currentStreak + 1 : 1;
      }
      if (currentStreak > longestDailyStreak) longestDailyStreak = currentStreak;
    }

    // Longest weekly streak (consecutive weeks with at least 1 watch)
    const watchWeeks = new Set<string>();
    sortedDates.forEach((d) => {
      const date = new Date(d);
      // ISO week: get Monday of that week as identifier
      const day = date.getDay() || 7; // Sunday = 7
      const monday = new Date(date);
      monday.setDate(date.getDate() - day + 1);
      watchWeeks.add(formatDate(monday));
    });
    const sortedWeeks = Array.from(watchWeeks).sort();
    let longestWeeklyStreak = 0;
    let currentWeekStreak = 0;
    for (let i = 0; i < sortedWeeks.length; i++) {
      if (i === 0) {
        currentWeekStreak = 1;
      } else {
        const prev = new Date(sortedWeeks[i - 1]);
        const curr = new Date(sortedWeeks[i]);
        const diff = (curr.getTime() - prev.getTime()) / (7 * 86400000);
        currentWeekStreak = Math.abs(diff - 1) < 0.01 ? currentWeekStreak + 1 : 1;
      }
      if (currentWeekStreak > longestWeeklyStreak) longestWeeklyStreak = currentWeekStreak;
    }

    return {
      movieCount,
      movieMinutes,
      episodeCount,
      episodeMinutes,
      showCount,
      totalCount: movieCount + showCount,
      totalMinutes: movieMinutes + episodeMinutes,
      countryCount: countrySet.size,
      longestDailyStreak,
      longestWeeklyStreak,
    };
  }, [stats, selectedYear]);

  return (
    <Card
      className={
        embedded
          ? 'bg-transparent border-none shadow-none backdrop-blur-none p-0 rounded-none lg:px-0 heatmap-container'
          : 'lg:px-6 bg-pearl/60 border-border/15 shadow-2xl backdrop-blur-md heatmap-container'
      }
    >
      <style>{`
        .heatmap-container {
          container-type: inline-size;
        }
        .heatmap-grid-wrapper {
          --cell-size: 15px;
          --cell-gap: 3px;
        }
        @container (max-width: 1280px) {
          .heatmap-grid-wrapper {
            --cell-size: 11px;
            --cell-gap: 2.2px;
          }
        }
        @container (max-width: 640px) {
          .heatmap-grid-wrapper {
            --cell-size: 8px;
            --cell-gap: 1.5px;
          }
        }
        .heatmap-grid-wrapper {
          --cell-step: calc(var(--cell-size) + var(--cell-gap));
        }
      `}</style>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">Watch History</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-3 flex flex-col gap-4 pr-4">
            {/* Header row for chart: Subtitle & Dropdown */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {totalWatches.toLocaleString()} items watched
                {selectedYear === 'all' && ' (all years cumulative)'}
                {selectedYear === 'recent' && ' (last 12 months)'}
                {selectedYear !== 'all' && selectedYear !== 'recent' && ` in ${selectedYear}`}
              </p>
              <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-40">
                {yearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="overflow-x-auto heatmap-grid-wrapper">
              <div
                style={{
                  width: `calc(${grid.length} * var(--cell-step) + 40px)`,
                  minWidth: '100%',
                }}
              >
                {/* Month labels */}
                <div className="relative h-5" style={{ marginLeft: 'calc(28px + 0.375rem)' }}>
                  {monthPositions.map((m, i) => (
                    <span
                      key={i}
                      className="absolute text-[10px] text-muted-foreground whitespace-nowrap"
                      style={{ left: `calc(${m.col} * var(--cell-step))` }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>

                <div className="flex">
                  {/* Day labels */}
                  <div className="flex flex-col shrink-0 mr-1.5" style={{ gap: 'var(--cell-gap)' }}>
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
                      <div key={i} style={{ height: 'var(--cell-size)' }} className="flex items-center">
                        <span className="text-[10px] text-muted-foreground w-7 text-right">{selectedYear === 'recent' ? label : ''}</span>
                      </div>
                    ))}
                  </div>

                  {/* Heatmap grid */}
                  <div className="flex" style={{ gap: 'var(--cell-gap)' }}>
                    {grid.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col" style={{ gap: 'var(--cell-gap)' }}>
                        {week.map((cell, dayIdx) => {
                          const intensity = getIntensity(cell.count, maxCount);
                          return (
                            <Tooltip
                              key={dayIdx}
                              placement="mouse"
                              content={
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium">{cell.tooltipLabel}</span>
                                  <span className="text-muted-foreground">{cell.count} watched</span>
                                </div>
                              }
                            >
                              <div
                                className={`rounded-[3px] ${INTENSITY_CLASSES[intensity]}`}
                                style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }}
                              />
                            </Tooltip>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1.5 mt-4" style={{ marginLeft: 'calc(28px + 0.375rem)' }}>
                  <span className="text-[10px] text-muted-foreground mr-1">Less</span>
                  {INTENSITY_CLASSES.map((cls, i) => (
                    <div key={i} className={`rounded-[3px] ${cls}`} style={{ width: 'var(--cell-size)', height: 'var(--cell-size)' }} />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right/Stats Area */}
          {computedStats && (
            <div className="flex flex-col lg:col-span-1 justify-center border-t lg:border-t-0 lg:border-l border-border/10 pt-5 lg:pt-0 lg:pl-6 gap-3">
              {/* Row 1: Movies, Shows, Total */}
              <div className="grid grid-cols-3 gap-2.5">
                <StatBox
                  label="Movies"
                  value={computedStats.movieCount.toLocaleString()}
                  sub={formatHours(computedStats.movieMinutes)}
                  tooltip="Total movies watched and their total watch duration"
                />
                <StatBox
                  label="Shows"
                  value={`${computedStats.showCount}`}
                  sub={`${computedStats.episodeCount} eps`}
                  tooltip="Total unique shows followed, count of episodes watched, and total watch duration"
                />
                <StatBox
                  label="Total"
                  value={computedStats.totalCount.toLocaleString()}
                  sub={formatHours(computedStats.totalMinutes)}
                  tooltip="Total watched productions count, and total combined watch duration"
                />
              </div>
              {/* Row 2: Countries, Daily Streak, Weekly Streak */}
              <div className="grid grid-cols-3 gap-2.5">
                <StatBox
                  label="Origin Countries"
                  value={computedStats.countryCount.toLocaleString()}
                  tooltip="Number of unique countries of origin for the watched movies and shows"
                />
                <StatBox
                  label="Daily Streak"
                  value={`${computedStats.longestDailyStreak}d`}
                  tooltip="Longest consecutive days with at least one movie or episode watched"
                />
                <StatBox
                  label="Weekly Streak"
                  value={`${computedStats.longestWeeklyStreak}w`}
                  tooltip="Longest consecutive weeks with at least one movie or episode watched"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value, sub, tooltip }: { label: string; value: string; sub?: string; tooltip?: string }) {
  const box = (
    <div className="rounded-lg border border-border/15 bg-pearl/10 p-3 text-center shrink-0 min-w-0 transition-colors hover:bg-pearl/15 cursor-help h-full flex flex-col justify-between">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold leading-tight min-h-6 flex items-center justify-center">
        {label}
      </p>
      <div className="mt-1">
        <p className="text-base font-extrabold text-platinum tabular-nums truncate">{value}</p>
        {sub && <p className="text-[10px] text-quicksilver tabular-nums mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip placement="top" content={tooltip}>
        <div className="h-full">{box}</div>
      </Tooltip>
    );
  }
  return box;
}
