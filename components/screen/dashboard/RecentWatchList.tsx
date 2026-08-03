'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { PosterCard } from '@/components/screen/shared/PosterCard';
import GenreBackground from '@/components/screen/slugs/genre/GenreBackground';

interface RecentWatchItem {
  history_id: number;
  watched_at: string;
  my_rating?: number;
  media_type: string;
  tmdb_id?: number;
  title: string;
  episode_title?: string;
  season_number?: number;
  episode_number?: number;
  poster_path?: string;
  release_date?: string;
  show_tmdb_id?: number;
}

function SkeletonCard() {
  return <div className="aspect-2/3 rounded-lg bg-white/5 animate-pulse" />;
}

interface RecentWatchListProps {
  initialData?: RecentWatchItem[];
}

/**
 * RecentWatchList Component
 * 
 * - Rendered server-side with initialData from page.tsx (cached 7d via Next ISR).
 * - Zero client-side DB calls to Neon on routine page visits.
 * - When external sync app inserts new watch history to Neon (Neon awake), it triggers
 *   GET /api/screen/recent?revalidate=true, which refreshes CDN cache & ISR page.
 */
export default function RecentWatchList({ initialData }: RecentWatchListProps) {
  const [recentWatches, setRecentWatches] = useState<RecentWatchItem[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    fetch('/api/screen/recent')
      .then((r) => r.json())
      .then((data) => {
        setRecentWatches(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initialData]);

  return (
    <Card className="relative overflow-hidden bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <GenreBackground genres={[]} intensity={0.2} variant="container" />
      <CardHeader className="relative z-10 pb-2">
        <CardTitle className="text-xl font-bold tracking-tight text-accent" style={{ fontFamily: 'var(--font-poppins)' }}>
          Recently Watched
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Chronological feed of my most recently watched movies and episodes.</p>
      </CardHeader>
      <CardContent className="relative z-10 pt-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {/* Hide last element on sm breakpoint as it renders trio per row */}
          {loading
            ? Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className={i === 15 ? 'hidden sm:block' : ''}>
                  <SkeletonCard />
                </div>
              ))
            : recentWatches.map((item, index) => {
                const href =
                  item.media_type === 'movie'
                    ? `/collection/screen/m/${item.tmdb_id ?? 0}`
                    : `/collection/screen/s/${item.show_tmdb_id ?? item.tmdb_id ?? 0}`;
                const subtitle =
                  item.media_type === 'episode'
                    ? `S${item.season_number}E${item.episode_number}`
                    : item.release_date
                      ? String(new Date(item.release_date.replace(/^"|"$/g, '')).getFullYear())
                      : undefined;
                return (
                  <div key={item.history_id} className={index === 15 ? 'hidden sm:block' : ''}>
                    <PosterCard
                      tmdb_id={item.tmdb_id ?? 0}
                      href={href}
                      title={item.title}
                      subtitle={subtitle ?? undefined}
                      poster_path={item.poster_path ?? null}
                      rating={item.my_rating ?? null}
                      priority={index < 6}
                      meta={`Watched on ${new Date(item.watched_at.replace(/^"|"$/g, '')).toLocaleDateString('en-GB')}`}
                    />
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
