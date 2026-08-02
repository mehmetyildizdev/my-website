'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/shadcn/ui/badge';
import { getCategoryTheme } from '@/lib/post/categoryBasedSelector';
import { formatDate } from '@/lib/post';
import React from 'react';
import { Skeleton } from '@/components/shadcn/ui/skeleton';

export function LatestPostsList({ posts }: { posts: Post[] }) {
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({});

  return (
    <div className="lg:col-span-4 flex flex-col">
      <div className="flex flex-col justify-center gap-4 h-full flex-1">
        {posts.map((post) => {
          const catTitle = post.categories?.[0]?.title;
          const theme = getCategoryTheme(catTitle);
          const isLoaded = loadedImages[post._id];

          return (
            <Link href={`/blog/post/${post.slug.current}`} key={post._id}>
              <article className="group relative flex items-center gap-4 rounded-3xl border border-border/20 bg-card/66 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-muted/33">
                {/* Thumbnail */}
                {post.mainImage?.asset?.url && (
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted/33">
                    {!isLoaded && <Skeleton className="absolute inset-0 z-10 h-full w-full bg-foreground/5" />}
                    <Image
                      src={post.mainImage.asset.url}
                      alt={post.mainImage.alt ?? post.title}
                      fill
                      onLoad={() => setLoadedImages((prev) => ({ ...prev, [post._id]: true }))}
                      className={`object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-xl'}`}
                      sizes="96px"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col justify-center flex-1 pr-2 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {catTitle && (
                      <Badge
                        variant="ghost"
                        className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.text} bg-transparent border-0 px-0`}
                      >
                        {catTitle}
                      </Badge>
                    )}
                  </div>
                  <h4
                    className={`text-sm md:text-base font-bold text-foreground leading-snug drop-shadow-sm transition-colors ${theme.groupHoverText} line-clamp-2`}
                  >
                    {post.title}
                  </h4>
                  <time className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-metadata block truncate">
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
