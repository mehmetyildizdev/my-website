"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getCategoryTheme } from "@/lib/post/categoryBasedSelector";
import Image from "next/image";
import { formatDate, resolveExcerpt } from "@/lib/post";



const POSTS_PER_PAGE = 8;

export default function ArchiveClient({ allPosts }: { allPosts: Post[] }) {
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>(
    allPosts.slice(0, POSTS_PER_PAGE)
  );
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  const hasMore = displayedPosts.length < allPosts.length;

  const loadMore = useCallback(() => {
    const nextLimit = (page + 1) * POSTS_PER_PAGE;
    setDisplayedPosts(allPosts.slice(0, nextLimit));
    setPage((prev) => prev + 1);
  }, [allPosts, page]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [hasMore, loadMore]);

  if (allPosts.length === 0) {
    return (
      <div className="mt-12 rounded-4xl border border-dashed border-border/40 bg-card/40 p-16 text-center backdrop-blur-sm">
        <h2 className="text-3xl font-black text-foreground drop-shadow-md">No posts found</h2>
        <p className="mt-4 text-lg font-medium text-foreground/60">
          This archive is currently empty.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 flex flex-col gap-8 w-full">
      <ul className="grid gap-8 md:grid-cols-2">
        {displayedPosts.map((post) => {
          const catTitle = post.categories?.[0]?.title;
          const { bg: catBg, text: catText } = getCategoryTheme(catTitle);

          return (
            <li key={post._id} className="h-full">
              <Link
                href={`/blog/post/${post.slug.current}`}
                className="group relative flex h-full flex-col sm:flex-row gap-5 rounded-3xl border border-border/20 bg-pearl p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-card/90"
              >
                {post.mainImage?.asset?.url && (
                  <div className="relative w-full sm:w-1/3 h-48 sm:h-auto shrink-0 overflow-hidden rounded-2xl bg-muted/20">
                    <Image
                      src={post.mainImage.asset.url}
                      alt={post.mainImage.alt ?? post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}

                <div className="flex flex-col justify-center flex-1 py-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <time className="text-[10px] font-bold uppercase tracking-[0.25em] text-metadata">
                      {formatDate(post.publishedAt)}
                    </time>

                    {catTitle && (
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${catBg} text-background shadow-sm`}>
                        {catTitle}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-1 text-lg font-bold text-foreground leading-snug drop-shadow-sm transition-colors group-hover:text-sapphire line-clamp-2">
                    {post.title}
                  </h4>

                  <p className="mt-2 text-sm text-metadata line-clamp-3">
                    {resolveExcerpt(post)}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-end">
                    <span className={`font-bold text-xs ${catText} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                      Read <span aria-hidden="true" className="text-base leading-none">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Infinite Scroll target div */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-10 w-full">
          <div className="animate-pulse flex items-center gap-2 text-foreground/50 font-bold uppercase tracking-widest text-xs">
            <span className="h-2 w-2 rounded-full bg-sapphire"></span>
            <span className="h-2 w-2 rounded-full bg-sapphire/80 block delay-75"></span>
            <span className="h-2 w-2 rounded-full bg-sapphire/60 block delay-150"></span>
            Loading more
          </div>
        </div>
      )}

      {!hasMore && displayedPosts.length > 0 && (
        <div className="py-12 mt-6 text-center text-foreground/40 font-bold text-sm tracking-widest uppercase border-t border-border/30">
          You&apos;ve reached the end
        </div>
      )}
    </div>
  );
}
