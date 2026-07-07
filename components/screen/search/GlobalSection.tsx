'use client';

import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { Skeleton } from '@/components/shadcn/ui/skeleton';
import { Globe, Loader2, ExternalLink } from 'lucide-react';

export interface TMDBResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  known_for_department?: string;
}

interface GlobalSectionProps {
  loading: boolean;
  waiting: boolean;
  results: TMDBResult[];
  query: string;
}

export default function GlobalSection({ loading, waiting, results, query }: GlobalSectionProps) {
  const hasResults = results.length > 0;

  return (
    <Card className="relative overflow-hidden bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-tight text-accent font-poppins flex items-center gap-2">
            {waiting ? (
              <Loader2 className="h-4 w-4 text-gold animate-spin" />
            ) : (
              <Globe className="h-4 w-4 text-gold" />
            )}
            <span>Global TMDB Catalog</span>
          </CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Search results across TMDB's public catalog.
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-accent/40 text-accent font-semibold gap-1 text-[10px]"
        >
          TMDB
        </Badge>
      </CardHeader>
      <CardContent className="pt-2 max-h-[750px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border/25 scrollbar-track-transparent">
        {loading && results.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="w-10 h-15 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : hasResults ? (
          <div className="space-y-3">
            {results.map((item) => {
              const title = item.title || item.name || '';
              const year = item.release_date
                ? String(new Date(item.release_date).getFullYear())
                : item.first_air_date
                  ? String(new Date(item.first_air_date).getFullYear())
                  : null;
              const path = item.poster_path || item.profile_path || null;
              const tmdbLink =
                item.media_type === 'movie'
                  ? `https://www.themoviedb.org/movie/${item.id}`
                  : item.media_type === 'tv'
                    ? `https://www.themoviedb.org/tv/${item.id}`
                    : `https://www.themoviedb.org/person/${item.id}`;

              return (
                <a
                  key={`${item.media_type}-${item.id}`}
                  href={tmdbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-3 p-2 rounded-xl bg-obsidian/20 border border-border/5 hover:border-gold/30 hover:bg-obsidian/40 transition-all duration-300 text-left items-center"
                >
                  <div className="relative w-10 h-15 shrink-0 rounded overflow-hidden bg-pearl/30 border border-border/10 flex items-center justify-center">
                    {path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${path}`}
                        alt={title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-[10px] text-quicksilver">?</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-accent transition-colors truncate w-full font-poppins">
                      {title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] uppercase font-bold text-quicksilver px-1.5 py-0.5 rounded bg-pearl/30 border border-border/10">
                        {item.media_type === 'tv' ? 'show' : item.media_type}
                      </span>
                      {year && <span className="text-[10px] text-quicksilver">{year}</span>}
                    </div>
                  </div>
                  <ExternalLink className="h-3 w-3 text-quicksilver group-hover:text-gold shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Globe className="h-6 w-6 text-quicksilver/40 mb-2" />
            <h4 className="text-xs font-semibold text-foreground">No Global Matches</h4>
            <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
              No external matches found for "{query}" on TMDB.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
