'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { Skeleton } from '@/components/shadcn/ui/skeleton';
import { Users, Database } from 'lucide-react';

export interface DBSearchPerson {
  tmdb_id: number;
  name: string;
  image_path: string | null;
  release_date: string | null;
}

interface PeopleSectionProps {
  loading: boolean;
  people: DBSearchPerson[];
  isFeatured?: boolean;
}

export default function PeopleSection({ loading, people, isFeatured }: PeopleSectionProps) {
  const [expanded, setExpanded] = useState(false);
  if (!loading && people.length === 0) return null;

  const ceiling = isFeatured ? 999 : 16;
  const hasMore = people.length > ceiling;
  const visiblePeople = expanded ? people : people.slice(0, ceiling);

  return (
    <Card className="relative overflow-hidden bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-accent font-poppins flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-gold" />
            <span>People in Database</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Actors, directors, and crew members.</p>
        </div>
        <Badge variant="subtle" className="bg-gold/10 text-accent border-gold/20 font-semibold gap-1 text-[10px]">
          <Database className="h-3 w-3" /> LOCAL
        </Badge>
      </CardHeader>
      <CardContent className="pt-2">
        {loading && people.length === 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-36 rounded-2xl shrink-0" />
            ))}
          </div>
        ) : (
          <div className="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border/20 scrollbar-track-transparent">
            {visiblePeople.map((p) => {
              const hasImage = !!p.image_path;
              const CardWrapper = hasImage ? Link : 'div';
              const linkProps = hasImage ? { href: `/collection/screen/p/${p.tmdb_id}` } : {};

              return (
                // @ts-ignore
                <CardWrapper
                  key={p.tmdb_id}
                  {...linkProps}
                  className={`group flex flex-col items-center bg-obsidian/30 border border-border/10 rounded-2xl p-3 text-center transition-all duration-300 shadow-md w-36 sm:w-40 shrink-0 ${
                    hasImage ? 'cursor-pointer hover:border-accent/40 hover:bg-obsidian/55' : 'opacity-70 border-dashed cursor-not-allowed'
                  }`}
                >
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border/30 shrink-0 group-hover:border-accent transition-colors duration-300">
                    {p.image_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${p.image_path}`}
                        alt={p.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-pearl text-quicksilver text-xs">?</div>
                    )}
                  </div>
                  <div className="flex flex-col items-center mt-2.5 w-full">
                    <span
                      className={`font-semibold text-xs text-foreground transition-colors truncate w-full ${
                        hasImage ? 'group-hover:text-gold' : ''
                      }`}
                    >
                      {p.name}
                    </span>
                    <span className="text-[10px] text-quicksilver truncate w-full mt-0.5">{p.release_date || 'Crew'}</span>
                  </div>
                </CardWrapper>
              );
            })}
            {!expanded && hasMore && (
              <button
                onClick={() => setExpanded(true)}
                className="flex flex-col items-center justify-center bg-pearl/10 border border-dashed border-border/20 rounded-2xl p-3 text-center transition-all duration-300 hover:border-gold/40 hover:bg-pearl/20 w-36 sm:w-40 shrink-0 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">➕</span>
                <span className="font-semibold text-xs text-foreground mt-2">Load More</span>
                <span className="text-[10px] text-quicksilver mt-0.5">+{people.length - ceiling} people</span>
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
