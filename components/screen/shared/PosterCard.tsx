'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/shadcn/ui/skeleton';

interface PosterCardProps {
  tmdb_id: number;
  href: string;
  title: string;
  subtitle?: string;
  poster_path: string | null;
  rating?: number | null;
  meta?: string;
  priority?: boolean;
}

export function PosterCard({
  tmdb_id,
  href,
  title,
  subtitle,
  poster_path,
  rating,
  meta,
  priority = false,
}: PosterCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Link href={href} className="group relative flex flex-col gap-2.5 focus:outline-none">
      {/* Poster Container */}
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl bg-obsidian border border-border/10 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-gold/5 group-hover:border-gold/30">
        {poster_path ? (
          <>
            {!isLoaded && <Skeleton className="absolute inset-0 rounded-xl bg-gold/10 z-0" />}
            <Image
              src={`https://image.tmdb.org/t/p/w342${poster_path}`}
              alt={`${title} poster`}
              fill
              unoptimized
              priority={priority}
              onLoad={() => setIsLoaded(true)}
              className={`object-cover transition-all duration-500 group-hover:scale-105 z-10 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-quicksilver text-xs text-center px-2">
            No Poster
          </div>
        )}

        {/* Hover overlay (Muted dark tint + backdrop-blur + rating & details) */}
        <div className="absolute inset-0 bg-pearl/66 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-between p-3.5 z-20">
          {/* Large Centered Rating Display (Score inside a sleek circle) */}
          {rating != null ? (
            <div className="flex flex-col items-center justify-center flex-1 animate-in zoom-in-95 duration-300">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-[3px] border-gold bg-pearl/66 backdrop-blur-md shadow-[0_0_15px_rgba(250,204,21,0.25)] dark:shadow-[0_0_20px_rgba(250,204,21,0.15)] select-none">
                <span className="text-5xl font-black text-gold tracking-tight leading-none">
                  {Number(rating).toFixed(0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Bottom details/watched date metadata */}
          {meta &&
            (() => {
              const match = meta.match(/^Watched\s+(?:on\s+)?(.+)$/i);
              if (match) {
                const dateStr = match[1];
                return (
                  <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 mt-auto flex flex-col items-center bg-pearl/80 border border-border/10 py-1 px-2 rounded-md backdrop-blur-xs text-center w-full">
                    <span className="text-[9px] text-quicksilver uppercase tracking-wider font-bold">
                      Watched on
                    </span>
                    <span className="text-[11px] text-gold font-semibold leading-relaxed mt-0.5">
                      {dateStr}
                    </span>
                  </div>
                );
              }
              return (
                <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 mt-auto">
                  <span className="text-[11px] text-titanium font-medium leading-relaxed bg-pearl/10 border border-border/10 px-2 py-1 rounded-md backdrop-blur-xs block text-center">
                    {meta}
                  </span>
                </div>
              );
            })()}
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="px-0.5">
        <h3 className="font-semibold text-sm sm:text-base text-titanium line-clamp-1 group-hover:text-gold transition-colors font-poppins">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm text-platinum/66 mt-0.5 line-clamp-1 leading-normal">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
