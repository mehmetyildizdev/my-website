'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

export interface UseLazyLoadOptions {
  initialLimit: number;
  increment: number;
  buttonLabel?: string;
  rootMargin?: string;
}

/**
 * A reusable hook to lazy load lists.
 * Shows a "Continue" button at the initialLimit, and once clicked,
 * switches to automated scroll-based loading via an Intersection Observer.
 */
export function useLazyLoad<T>(items: T[], options: UseLazyLoadOptions) {
  const { initialLimit, increment, buttonLabel = 'Show More', rootMargin = '200px' } = options;

  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate infinite scroll observer once the user has clicked to unlock it
    if (!isUnlocked || items.length <= visibleCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + increment, items.length));
        }
      },
      { rootMargin }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [items.length, visibleCount, isUnlocked, increment, rootMargin]);

  // When clicking the manual trigger button, unlock infinite scrolling and show next chunk
  const handleUnlock = () => {
    setIsUnlocked(true);
    setVisibleCount((prev) => Math.min(prev + increment, items.length));
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return {
    visibleItems,
    hasMore,
    isUnlocked,
    sentinelRef,
    handleUnlock,
    buttonLabel,
  };
}

interface LazyLoadTriggerProps {
  hasMore: boolean;
  isUnlocked: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  handleUnlock: () => void;
  buttonLabel?: string;
  loadingText?: string;
}

/**
 * A unified trigger component to display the Continue button
 * or the intersection scroll spinner sentinel.
 */
export function LazyLoadTrigger({
  hasMore,
  isUnlocked,
  sentinelRef,
  handleUnlock,
  buttonLabel = 'Continue',
  loadingText = 'Loading more...',
}: LazyLoadTriggerProps) {
  if (!hasMore) return null;

  return (
    <div className="col-span-full flex justify-center py-6">
      {!isUnlocked ? (
        <Button
          variant="outline"
          onClick={handleUnlock}
          className="px-6 py-2 text-xs font-semibold rounded-full border border-border/10 transition-all hover:bg-pearl/50 hover:text-emerald cursor-pointer shadow-sm hover:border-accent/30"
        >
          {buttonLabel}
        </Button>
      ) : (
        <div
          ref={sentinelRef}
          className="flex items-center gap-2 text-quicksilver text-xs animate-pulse"
        >
          <Loader2 className="w-4 h-4 animate-spin text-emerald" />
          <span>{loadingText}</span>
        </div>
      )}
    </div>
  );
}
