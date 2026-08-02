'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Select } from '@/components/shadcn/ui/select';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
import { getRatingToken, getAvgRatingToken, getShowAvgRatingToken } from '@/lib/screen/utils/format';
// Split combined genres for filtering
function expandGenres(genres: string[]): string[] {
  return genres ? genres.filter(Boolean) : [];
}

export default function RatingsComparison({ data, lockedMedia }: { data: RatingItem[]; lockedMedia?: 'movie' | 'show' }) {
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [decadeFilter, setDecadeFilter] = useState<string>('all');
  const [mediaFilter, setMediaFilter] = useState<string>(lockedMedia ?? 'all');

  // Available genres (sorted)
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => expandGenres(d.genres).forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [data]);

  // Available decades
  const decades = useMemo(() => {
    const set = new Set<number>();
    data.forEach((d) => {
      if (d.release_year) set.add(Math.floor(d.release_year / 10) * 10);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [data]);

  // Filtered data
  const filtered = useMemo(() => {
    return data.filter((d) => {
      if (mediaFilter !== 'all' && d.media_type !== mediaFilter) return false;
      if (genreFilter !== 'all') {
        const expanded = expandGenres(d.genres);
        if (!expanded.includes(genreFilter)) return false;
      }
      if (decadeFilter !== 'all') {
        const decade = parseInt(decadeFilter);
        if (!d.release_year || d.release_year < decade || d.release_year >= decade + 10) return false;
      }
      return true;
    });
  }, [data, genreFilter, decadeFilter, mediaFilter]);

  // Stats
  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const myAvg = filtered.reduce((s, d) => s + d.my_rating, 0) / filtered.length;
    const tmdbAvg = filtered.reduce((s, d) => s + Number(d.tmdb_rating), 0) / filtered.length;
    const higherCount = filtered.filter((d) => d.my_rating > Number(d.tmdb_rating)).length;
    const lowerCount = filtered.filter((d) => d.my_rating < Number(d.tmdb_rating)).length;
    const sameCount = filtered.filter((d) => d.my_rating === Math.round(Number(d.tmdb_rating))).length;
    return {
      myAvg,
      tmdbAvg,
      higherCount,
      lowerCount,
      sameCount,
      total: filtered.length,
    };
  }, [filtered]);

  // Distribution: for each my_rating (1-10), avg tmdb_rating
  const distribution = useMemo(() => {
    const buckets: { myRating: number; avgTmdb: number; count: number }[] = [];
    for (let r = 1; r <= 10; r++) {
      const items = filtered.filter((d) => d.my_rating === r);
      if (items.length > 0) {
        const avg = items.reduce((s, d) => s + Number(d.tmdb_rating), 0) / items.length;
        buckets.push({ myRating: r, avgTmdb: avg, count: items.length });
      }
    }
    return buckets;
  }, [filtered]);

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">My Ratings vs TMDB</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">How my personal ratings compare to TMDB community scores.</p>
        <p className="text-xs text-muted-foreground mt-1">
          My rating colors are thematic as you can see in 1-10 scale. For averages I used scaled coloring in 5.5-7.0 range of same pattern.
        </p>
        {(lockedMedia === 'show' || mediaFilter === 'show') && (
          <p className="text-xs text-muted-foreground mt-1">
            Shows are generally rated higher in average and breaks the pattern. So, I added separate pattern for shows alone that is 7.0-8.0
            range.
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-2 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {!lockedMedia && (
            <Select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)}>
              <option value="all">All Media</option>
              <option value="movie">Movies</option>
              <option value="show">Shows</option>
            </Select>
          )}
          <Select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
            <option value="all">All Genres</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
          <Select value={decadeFilter} onChange={(e) => setDecadeFilter(e.target.value)}>
            <option value="all">All Decades</option>
            {decades.map((d) => (
              <option key={d} value={String(d)}>
                {d}s
              </option>
            ))}
          </Select>
        </div>

        {/* Summary stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-lg border border-border/15 bg-pearl/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">My Avg</p>
              <p
                className={`text-lg font-bold tabular-nums text-${
                  lockedMedia === 'show' || mediaFilter === 'show' ? getShowAvgRatingToken(stats.myAvg) : getAvgRatingToken(stats.myAvg)
                }`}
              >
                {stats.myAvg.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border border-border/15 bg-pearl/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TMDB Avg</p>
              <p className="text-lg font-bold text-gold tabular-nums">{stats.tmdbAvg.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-border/15 bg-pearl/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">I Rate Higher</p>
              <p className="text-lg font-bold text-topaz tabular-nums">{stats.higherCount}</p>
            </div>
            <div className="rounded-lg border border-border/15 bg-pearl/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">I Rate Lower</p>
              <p className="text-lg font-bold text-amethyst tabular-nums">{stats.lowerCount}</p>
            </div>
            <div className="rounded-lg border border-border/15 bg-pearl/10 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Items</p>
              <p className="text-lg font-bold text-platinum tabular-nums">{stats.total}</p>
            </div>
          </div>
        )}

        {/* Distribution chart: for each of my ratings, show avg TMDB */}
        {distribution.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">When I rate X, TMDB averages...</h4>
            <div className="flex items-end gap-1.5 h-48">
              {distribution.map((bucket) => {
                const barHeight = (bucket.avgTmdb / 10) * 100;
                const myBarHeight = (bucket.myRating / 10) * 100;
                return (
                  <Tooltip
                    key={bucket.myRating}
                    placement="top"
                    content={
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">My rating: {bucket.myRating}</span>
                        <span className="text-muted-foreground">TMDB avg: {bucket.avgTmdb.toFixed(2)}</span>
                        <span className="text-muted-foreground">{bucket.count} items</span>
                      </div>
                    }
                  >
                    <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div className="flex gap-1 items-end h-full justify-center">
                        {/* My rating bar */}
                        <div
                          className={`w-2 sm:w-4 lg:w-8 rounded-t-sm bg-${getRatingToken(bucket.myRating)} transition-all`}
                          style={{ height: `${myBarHeight}%`, opacity: 0.7 }}
                        />
                        {/* TMDB avg bar */}
                        <div
                          className="w-2 sm:w-4 lg:w-8 rounded-t-sm bg-gold transition-all"
                          style={{ height: `${barHeight}%`, opacity: 0.7 }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{bucket.myRating}</span>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-platinum opacity-70" />
                My Rating (Theme Colored)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-gold opacity-70" />
                TMDB Average
              </span>
            </div>
          </div>
        )}

        {/* Scatter-like dot plot: each item as a row */}
        {filtered.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Individual Ratings ({filtered.length} items)</h4>
            <div className="space-y-px max-h-100 overflow-y-auto pr-1">
              {filtered.slice(0, 100).map((item) => {
                const tmdb = Number(item.tmdb_rating);
                const diff = item.my_rating - tmdb;
                const diffColor = diff > 0 ? 'text-emerald' : diff < 0 ? 'text-ruby' : 'text-quicksilver';
                return (
                  <Tooltip
                    key={`${item.media_type}-${item.tmdb_id}`}
                    placement="mouse"
                    content={
                      <div className="flex flex-col gap-0.5 min-w-45">
                        <span className="font-semibold text-gold" style={{ fontFamily: 'var(--font-poppins)' }}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {item.media_type === 'movie' ? 'Movie' : 'Show'}
                          {item.release_year && ` · ${item.release_year}`}
                        </span>
                        <div className="flex justify-between gap-4 text-[11px] mt-1">
                          <span className="text-quicksilver">My Rating</span>
                          <span className={`font-semibold tabular-nums text-${getRatingToken(item.my_rating)}`}>{item.my_rating}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-[11px]">
                          <span className="text-quicksilver">TMDB</span>
                          <span className="text-gold tabular-nums">{tmdb.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-[11px] pt-1 mt-1 border-t border-border/20">
                          <span className="text-quicksilver">Difference</span>
                          <span className={`font-semibold tabular-nums ${diffColor}`}>
                            {diff > 0 ? '+' : ''}
                            {diff.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    }
                  >
                    <div className="grid grid-cols-[1fr_60px_60px_50px] items-center gap-2 py-1 px-2 hover:bg-pearl/30 rounded transition-colors text-xs">
                      <span className="truncate text-foreground/80">{item.title}</span>
                      <span className={`text-right tabular-nums font-medium text-${getRatingToken(item.my_rating)}`}>{item.my_rating}</span>
                      <span className="text-right tabular-nums text-gold">{tmdb.toFixed(1)}</span>
                      <span className={`text-right tabular-nums font-medium ${diffColor}`}>
                        {diff > 0 ? '+' : ''}
                        {diff.toFixed(1)}
                      </span>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
            {filtered.length > 100 && (
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Showing first 100 of {filtered.length} items</p>
            )}
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_60px_60px_50px] gap-2 pl-2 pr-6 mt-2 pt-2 border-t border-border/10 text-[10px] text-muted-foreground">
              <span>Title</span>
              <span className="text-right">Mine</span>
              <span className="text-right">TMDB</span>
              <span className="text-right">Diff</span>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground italic text-center py-8">No items match the selected filters.</p>
        )}
      </CardContent>
    </Card>
  );
}
