'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { Skeleton } from '@/components/shadcn/ui/skeleton';
import { PosterCard } from '@/components/screen/shared/PosterCard';
import GenreBackground from '@/components/screen/slugs/genre/GenreBackground';
import { Tv, Database } from 'lucide-react';

export interface DBSearchShow {
  tmdb_id: number;
  name: string;
  image_path: string | null;
  rating: number | null;
  release_date: string | null;
}

interface ShowsSectionProps {
  loading: boolean;
  shows: DBSearchShow[];
  isFeatured?: boolean;
}

export default function ShowsSection({ loading, shows, isFeatured }: ShowsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  if (!loading && shows.length === 0) return null;

  const ceiling = isFeatured ? 999 : 8;
  const hasMore = shows.length > ceiling;
  const visibleShows = expanded ? shows : shows.slice(0, ceiling);

  return (
    <Card className="relative overflow-hidden bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <GenreBackground genres={[]} intensity={0.15} variant="container" />
      <CardHeader className="relative z-10 pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-accent font-poppins flex items-center gap-2">
            <Tv className="h-4.5 w-4.5 text-gold" />
            <span>TV Shows in Database</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Matching shows from my watch history.</p>
        </div>
        <Badge variant="subtle" className="bg-gold/10 text-accent border-gold/20 font-semibold gap-1 text-[10px]">
          <Database className="h-3 w-3" /> LOCAL
        </Badge>
      </CardHeader>
      <CardContent className="relative z-10 pt-2">
        {loading && shows.length === 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-2/3 w-32 sm:w-36 rounded-xl shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
            {visibleShows.map((item, idx) => (
              <div key={item.tmdb_id} className="w-32 sm:w-36 shrink-0">
                <PosterCard
                  tmdb_id={item.tmdb_id}
                  href={`/collection/screen/s/${item.tmdb_id}`}
                  title={item.name}
                  priority={idx < 4}
                  subtitle={item.release_date ? String(new Date(item.release_date).getFullYear()) : undefined}
                  poster_path={item.image_path}
                  rating={item.rating}
                />
              </div>
            ))}
            {!expanded && hasMore && (
              <button
                onClick={() => setExpanded(true)}
                className="flex flex-col items-center justify-center bg-pearl/10 border border-dashed border-border/20 rounded-xl p-4 text-center transition-all duration-300 hover:border-gold/40 hover:bg-pearl/20 w-32 sm:w-36 shrink-0 aspect-2/3 group self-stretch h-auto min-h-[180px] sm:min-h-[210px]"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
                <span className="font-semibold text-xs text-foreground mt-2">Load More</span>
                <span className="text-[10px] text-quicksilver mt-0.5">+{shows.length - ceiling} shows</span>
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
