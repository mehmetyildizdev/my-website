'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/shadcn/ui/badge';
import { SCREEN_CONFIG } from '@/lib/screen/config';

interface InfinitePerformerGridProps {
  initialItems: TopPerson[];
  /**
   * Controls the primary badge (rating vs runtime vs count) and how to format it.
   * Default "top_rated" preserves the original look used by directors / overall view.
   */
  mode?: RankMode;
  /** Set to true when the rating shown is the Bayesian weighted_rating. */
  weighted?: boolean;
}

function formatHours(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function metricsLine(p: TopPerson): string {
  const parts: string[] = [];
  if (p.movie_count) parts.push(`${p.movie_count} ${p.movie_count === 1 ? 'movie' : 'movies'}`);
  if (p.show_count) parts.push(`${p.show_count} ${p.show_count === 1 ? 'shows' : 'shows'}`);
  if (p.episode_count) parts.push(`${p.episode_count} ${p.episode_count === 1 ? 'ep' : 'eps'}`);
  return parts.join(' · ');
}

export default function InfinitePerformerGrid({ initialItems, mode = 'top_rated', weighted = false }: InfinitePerformerGridProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLocal, setIsLocal] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocal(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    }
  }, []);

  // Reset visible window whenever the data set changes (tab/mode switch).
  useEffect(() => {
    setVisibleCount(10);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [initialItems]);

  const maxItems = isLocal ? initialItems.length : Math.min(initialItems.length, SCREEN_CONFIG.limits.performerGridMax);
  const visibleItems = initialItems.slice(0, Math.min(visibleCount, maxItems));
  const hasMore = visibleCount < maxItems;

  useEffect(() => {
    if (!hasMore) return;
    const trigger = observerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 5, maxItems));
        }
      },
      {
        root: containerRef.current,
        threshold: 0.1,
        rootMargin: '50px',
      },
    );

    observer.observe(trigger);
    return () => observer.disconnect();
    // visibleCount is in deps so the observer re-attaches after every load.
    // IntersectionObserver only fires on threshold *crossings*; if the
    // spinner stays inside the rootMargin band as items are added, it never
    // re-fires. observe() always emits one entry with current state on
    // attach, so re-attaching after each load is what kicks it again.
  }, [hasMore, visibleCount, initialItems, maxItems]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto max-h-[500px] pt-2 pr-2 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent"
    >
      {initialItems.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No performers match this view.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 pb-4">
          {visibleItems.map((p) => {
            const badge = primaryBadge(p, mode, weighted);
            return (
              <Link
                key={p.tmdb_id}
                href={`/collection/screen/p/${p.tmdb_id}`}
                className="group flex flex-col items-center bg-obsidian/30 border border-border/10 rounded-3xl p-5 text-center transition-all duration-300 hover:border-accent/40 hover:bg-obsidian/55 shadow-md hover:shadow-accent/5"
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-border/30 shrink-0 group-hover:border-accent transition-colors duration-300 shadow-inner">
                  {p.profile_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
                      alt={p.name}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-pearl text-quicksilver text-sm">?</div>
                  )}
                </div>

                <div className="flex flex-col items-center mt-4 w-full">
                  <span className="font-semibold text-base text-foreground group-hover:text-accent transition-colors truncate w-full">
                    {p.name}
                  </span>

                  <div className="flex flex-col items-center gap-1.5 mt-2">
                    {badge && (
                      <Badge variant="subtle" className="text-xs px-2.5 py-0.5 bg-gold/10 text-accent border-gold/20 shrink-0 font-medium">
                        {badge}
                      </Badge>
                    )}
                    <span className="text-[11px] text-quicksilver line-clamp-1">{metricsLine(p) || '—'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div ref={observerRef} className="h-14 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && initialItems.length > maxItems && (
        <p className="text-center text-xs text-muted-foreground/60 py-4 border-t border-border/5 mt-4">
          Only the top {SCREEN_CONFIG.limits.performerGridMax} people are loaded for performance optimization.
        </p>
      )}
    </div>
  );
}

function primaryBadge(p: TopPerson, mode: RankMode, weighted: boolean): string | null {
  if (mode === 'most_exposed') {
    const min = p.total_runtime_min ?? 0;
    return min > 0 ? `⏱ ${formatHours(min)}` : null;
  }
  if (mode === 'most_watched') {
    const count = p.total_count ?? (p.movie_count ?? 0) + (p.show_count ?? 0);
    return count > 0 ? `# ${count}` : null;
  }
  // top_rated
  const r = weighted && p.my_rating != null ? p.my_rating : weighted ? p.weighted_rating : p.raw_rating;
  if (r == null) return null;
  return `★ ${r}`;
}
