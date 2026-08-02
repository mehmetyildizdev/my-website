'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
import Image from 'next/image';

type CollectionData = {
  tmdb_id: number;
  name: string;
  poster_path: string | null;
  total_movies: number;
  watched_movies: number;
  completion_pct: number;
  avg_rating: string | number | null;
  total_watched_movies: number;
  movies_in_collections: number;
  total_collections: number;
  complete_collections: number;
};

type FilterMode = 'all' | 'complete' | 'incomplete';

function completionColor(pct: number): string {
  if (pct === 100) return 'bg-emerald';
  if (pct >= 75) return 'bg-sapphire';
  if (pct >= 50) return 'bg-topaz';
  if (pct >= 25) return 'bg-amethyst';
  return 'bg-ruby';
}

export default function CollectionCompletions({ data }: { data: CollectionData[] }) {
  const [filter, setFilter] = useState<FilterMode>('complete');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'complete') return data.filter((c) => c.completion_pct === 100);
    if (filter === 'incomplete') return data.filter((c) => c.completion_pct < 100);
    return data;
  }, [data, filter]);

  const displayed = showAll ? filtered : filtered.slice(0, 20);

  // Overall stats from first row (all rows carry the same overall values)
  const overall =
    data.length > 0
      ? {
          totalWatchedMovies: data[0].total_watched_movies,
          moviesInCollections: data[0].movies_in_collections,
          totalCollections: data[0].total_collections,
          completeCollections: data[0].complete_collections,
          incompleteCollections: data[0].total_collections - data[0].complete_collections,
          collectionRate:
            data[0].total_watched_movies > 0 ? Math.round((data[0].movies_in_collections / data[0].total_watched_movies) * 100) : 0,
          completionRate: data[0].total_collections > 0 ? Math.round((data[0].complete_collections / data[0].total_collections) * 100) : 0,
        }
      : null;

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-accent">Collection Completions</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Ordered by average rating of movies in collection. Showing {filtered.length} collections.
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-pearl/20 border border-border/10 w-fit shrink-0">
          <button
            onClick={() => {
              setFilter('all');
              setShowAll(false);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-accent text-background shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-pearl/30'
            }`}
          >
            All ({data.length})
          </button>
          <button
            onClick={() => {
              setFilter('complete');
              setShowAll(false);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filter === 'complete'
                ? 'bg-emerald text-background shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-pearl/30'
            }`}
          >
            Complete ({overall?.completeCollections ?? 0})
          </button>
          <button
            onClick={() => {
              setFilter('incomplete');
              setShowAll(false);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filter === 'incomplete'
                ? 'bg-sapphire text-background shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-pearl/30'
            }`}
          >
            In Progress ({overall?.incompleteCollections ?? 0})
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Stats banner */}
        {overall && (
          <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
            <StatBanner label="Collections" value={overall.totalCollections.toString()} />
            <StatBanner label="Complete" value={`${overall.completeCollections}`} sub={`${overall.completionRate}%`} />
            <StatBanner label="In Progress" value={`${overall.incompleteCollections}`} />
            <StatBanner label="Movies in Collections" value={`${overall.moviesInCollections}`} sub={`${overall.collectionRate}% of all`} />
            <StatBanner label="Total Movies Watched" value={overall.totalWatchedMovies.toString()} />
          </div>
        )}

        {/* Collection grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayed.map((collection) => {
            const rating = collection.avg_rating != null ? Number(collection.avg_rating) : null;
            const barColor = completionColor(collection.completion_pct);

            return (
              <Tooltip
                key={collection.tmdb_id}
                placement="mouse"
                content={
                  <div className="flex flex-col gap-0.5 min-w-40">
                    <span className="font-semibold text-gold" style={{ fontFamily: 'var(--font-poppins)' }}>
                      {collection.name}
                    </span>
                    <div className="flex justify-between gap-4 text-[11px] mt-1">
                      <span className="text-quicksilver">Progress</span>
                      <span className="text-platinum font-semibold tabular-nums">
                        {collection.watched_movies}/{collection.total_movies} ({collection.completion_pct}%)
                      </span>
                    </div>
                    {rating != null && (
                      <div className="flex justify-between gap-4 text-[11px]">
                        <span className="text-quicksilver">Avg Rating</span>
                        <span className="text-emerald tabular-nums">{rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                }
              >
                <div className="rounded-lg border border-border/10 bg-pearl/10 overflow-hidden hover:border-border/30 transition-all group">
                  {/* Poster */}
                  <div className="relative aspect-2/3 bg-obsidian/30 overflow-hidden">
                    {collection.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${collection.poster_path}`}
                        alt={collection.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-xs">No poster</div>
                    )}
                    {/* Rating badge */}
                    {rating != null && (
                      <span className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-platinum">
                        {rating.toFixed(1)}
                      </span>
                    )}
                    {/* Completion badge */}
                    {collection.completion_pct === 100 && (
                      <span className="absolute top-1.5 left-1.5 bg-emerald/90 rounded px-1.5 py-0.5 text-[9px] font-bold text-background">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2 space-y-1.5">
                    <p className="text-[11px] text-foreground/80 truncate leading-tight">{collection.name}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-border/15 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${collection.completion_pct}%`, opacity: 0.85 }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground tabular-nums shrink-0">
                        {collection.watched_movies}/{collection.total_movies}
                      </span>
                    </div>
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>

        {/* Load more */}
        {!showAll && filtered.length > 20 && (
          <div className="flex justify-center mt-4">
            <Button variant="glass" size="sm" onClick={() => setShowAll(true)} className="text-quicksilver hover:text-foreground">
              Show all {filtered.length} collections
            </Button>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/10 text-[10px] text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-emerald opacity-85" /> 100%
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-sapphire opacity-85" /> 75%+
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-topaz opacity-85" /> 50%+
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-amethyst opacity-85" /> 25%+
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-ruby opacity-85" /> &lt;25%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatBanner({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/15 bg-pearl/10 px-3 py-2 text-center shrink-0 min-w-25">
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-base font-bold text-platinum tabular-nums mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-quicksilver tabular-nums">{sub}</p>}
    </div>
  );
}
