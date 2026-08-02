'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryTheme } from '@/lib/post/categoryBasedSelector';
import { formatDate } from '@/lib/post';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Separator } from '@/components/shadcn/ui/separator';
import { cn } from '@/lib/shadcn/utils';

// ── Config ─────────────────────────────────────────────────────────────────
/** Maximum number of posts shown in the carousel. Change this freely. */
const MAX_CAROUSEL_POSTS = 7;

/**
 * Cards visible at lg+ (≥1024px). Valid values: 1 | 2 | 3 | 4
 * — sm (<768px) always shows 1 card
 * — md (768–1024px) always shows 2 cards
 * — lg+ shows CARDS_PER_VIEW cards
 */
const CARDS_PER_VIEW: 1 | 2 | 3 | 4 = 4;
// ───────────────────────────────────────────────────────────────────────────

/**
 * Width-class lookup keyed by CARDS_PER_VIEW.
 * ALL strings must be written in full so Tailwind's scanner includes them.
 *   - base / sm : 1 card (full width minus a tiny peek gap)
 *   - md        : 2 cards
 *   - lg+       : CARDS_PER_VIEW cards
 */
const CARD_WIDTH_CLASSES: Record<1 | 2 | 3 | 4, string> = {
  1: 'w-[calc(100%-1.5rem)] md:w-[calc(100%-1.5rem)]        lg:w-[calc(100%-1.5rem)]',
  2: 'w-[calc(100%-1.5rem)] md:w-[calc(50%-0.75rem)]         lg:w-[calc(50%-0.75rem)]',
  3: 'w-[calc(100%-1.5rem)] md:w-[calc(50%-0.75rem)]         lg:w-[calc(33.333%-1rem)]',
  4: 'w-[calc(100%-1.5rem)] md:w-[calc(50%-0.75rem)]         lg:w-[calc(25%-1.125rem)]',
};
const cardWidthClass = CARD_WIDTH_CLASSES[CARDS_PER_VIEW];

interface PostCarouselProps {
  posts: Post[];
  currentSlug: string;
}

export function PostCarousel({ posts, currentSlug }: PostCarouselProps) {
  const carouselPosts = posts.filter((p) => p.slug?.current !== currentSlug).slice(0, MAX_CAROUSEL_POSTS);

  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ── drag state ────────────────────────────────────────────────────────────
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  /** Set to true once the pointer has moved >5px — used to suppress link clicks. */
  const hasDragged = useRef(false);
  // ─────────────────────────────────────────────────────────────────────────

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  /** Arrow-button scroll — always one full "page" so snap works cleanly. */
  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === 'left' ? -el.clientWidth : el.clientWidth,
      behavior: 'smooth',
    });
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.clientX;
    startScrollLeft.current = el.scrollLeft;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!isDragging.current || !el) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 5) hasDragged.current = true;
    // Direct assignment — no smooth behavior during drag for instant feel
    el.scrollLeft = startScrollLeft.current - dx;
  };

  const onDragEnd = () => {
    isDragging.current = false;
  };

  /** Prevents the child <Link> from navigating if the user was dragging. */
  const onLinkClick = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      hasDragged.current = false;
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  if (carouselPosts.length === 0) return null;

  return (
    <section aria-label="More articles" className="relative w-full pt-16 pb-8 bg-background">
      <Separator />

      {/* Header row */}
      <div className="flex items-center justify-between mt-16 px-6 lg:px-8 mb-8">
        <h2 className="text-2xl font-black tracking-tight text-foreground">More to Read</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            variant="glass"
            size="icon"
            className="rounded-full cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            variant="glass"
            size="icon"
            className="rounded-full cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scroll track — draggable via mouse, touch-scrollable natively */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        className={cn(
          'flex gap-6 overflow-x-auto px-6 lg:px-8 pb-8 snap-x snap-mandatory',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'cursor-grab active:cursor-grabbing select-none',
          'scroll-pl-6 lg:scroll-pl-8',
          // Dynamic mask to fade edges when scrollable
          canScrollLeft && canScrollRight
            ? 'mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]'
            : canScrollLeft
              ? 'mask-[linear-gradient(to_right,transparent,black_10%)]'
              : canScrollRight
                ? 'mask-[linear-gradient(to_left,transparent,black_10%)]'
                : 'mask-none',
        )}
      >
        {carouselPosts.map((post) => {
          const catTitle = post.categories?.[0]?.title;
          const { bg: catBg, text: catText, groupHoverText: catGroupHoverText } = getCategoryTheme(catTitle);

          return (
            <Link
              key={post._id}
              href={`/blog/post/${post.slug.current}`}
              onClick={onLinkClick}
              draggable={false}
              className={`group snap-start shrink-0 ${cardWidthClass}`}
            >
              <article className="relative flex flex-col h-full rounded-3xl border border-border/20 bg-card/66 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:bg-muted/33">
                {/* Thumbnail */}
                {post.mainImage?.asset?.url && (
                  <div className="relative mb-4 w-full aspect-video overflow-hidden rounded-2xl bg-muted/33">
                    <Image
                      src={post.mainImage.asset.url}
                      alt={post.mainImage.alt ?? post.title}
                      fill
                      draggable={false}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 95vw, (max-width: 1024px) 45vw, 22vw"
                    />
                  </div>
                )}

                <time className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/50">
                  {formatDate(post.publishedAt)}
                </time>

                <h3
                  className={`mt-2 text-base font-bold text-foreground leading-snug drop-shadow-sm transition-colors ${catGroupHoverText} line-clamp-2 flex-1`}
                >
                  {post.title}
                </h3>

                <div className="mt-auto pt-4 flex items-center justify-between">
                  {catTitle ? (
                    <Badge className={`text-[9px] font-bold uppercase tracking-[0.2em] ${catBg} text-background shadow-sm`}>
                      {catTitle}
                    </Badge>
                  ) : (
                    <span />
                  )}
                  <span className={`font-bold text-xs ${catText} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                    Read{' '}
                    <span aria-hidden className="text-base leading-none">
                      →
                    </span>
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* Fade edges */}
      <div
        className="pointer-events-none absolute left-0 top-22 bottom-4 w-10 bg-linear-to-r from-background to-transparent transition-opacity duration-300"
        style={{ opacity: canScrollLeft ? 1 : 0 }}
      />
      <div
        className="pointer-events-none absolute right-0 top-22 bottom-4 w-10 bg-linear-to-l from-background to-transparent transition-opacity duration-300"
        style={{ opacity: canScrollRight ? 1 : 0 }}
      />
    </section>
  );
}
