"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";

export interface LegacyDesign {
  id: string;
  name: string;
  thumbnail: string; // 16:9 landing page image
  fullHeight: string; // long vertical full-height image
  fullHeightDark?: string; // Optional long vertical full-height image for dark mode
  description?: string;
}

interface LegacyLightboxProps {
  designs: LegacyDesign[];
}

export function LegacyLightbox({ designs }: LegacyLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const open = (i: number) => setActiveIndex(i);
  const close = () => setActiveIndex(null);

  const prev = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + designs.length) % designs.length);
  }, [activeIndex, designs.length]);

  const next = useCallback(() => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % designs.length);
  }, [activeIndex, designs.length]);

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [activeIndex, prev, next]);

  const activeDesign = activeIndex !== null ? designs[activeIndex] : null;

  return (
    <>
      {/* Thumbnail grid — single responsive row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {designs.map((d, i) => (
          <button
            key={d.id}
            onClick={() => open(i)}
            aria-label={`View full design for ${d.name}`}
            className="group relative overflow-hidden rounded-2xl border border-border/20 bg-card/66 drop-shadow-theme backdrop-blur-sm aspect-video cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gold/33 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <Image
              src={d.thumbnail}
              alt={d.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-muted/0 group-hover:bg-muted/80 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                {d.name}
              </p>
              <p className="text-[10px] text-silver mt-0.5">Click to expand</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox modal */}
      {activeDesign && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-obsidian/90 backdrop-blur-md"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing: ${activeDesign.name}`}
        >
          {/* Stop propagation so clicking the content doesn't close */}
          <div
            className="relative flex flex-col w-full h-full max-w-5xl mx-auto px-4 pt-28 pb-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Buttons - On the edges of the content area */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none flex justify-between z-30 px-2 lg:-mx-10">
              <Button
                onClick={prev}
                aria-label="Previous design"
                variant="glass"
                size="icon-lg"
                className="pointer-events-auto rounded-full hover:text-gold hover:border-gold/33 hover:scale-110 shadow-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={next}
                aria-label="Next design"
                variant="glass"
                size="icon-lg"
                className="pointer-events-auto rounded-full hover:text-gold hover:border-gold/33 hover:scale-110 shadow-xl"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            {/* Header bar */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-secondary">
                  Legacy Design
                </p>
                <h3 className="text-xl font-bold text-titanium leading-tight">
                  {activeDesign.name}
                </h3>
                {activeDesign.description && (
                  <p className="text-sm text-iridium mt-0.5">{activeDesign.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Counter */}
                <span className="text-xs text-iridium font-semibold">
                  {(activeIndex ?? 0) + 1} / {designs.length}
                </span>
                <Button
                  onClick={close}
                  aria-label="Close lightbox"
                  variant="glass"
                  size="icon"
                  className="rounded-full hover:text-gold hover:border-gold/33"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable image container */}
            <div className="relative flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-border/20 bg-obsidian/60">
              <div className="relative w-full ">
                {activeDesign.fullHeightDark ? (
                  <>
                    <Image
                      src={activeDesign.fullHeight}
                      alt={activeDesign.name}
                      width={1200}
                      height={3000}
                      className="w-full h-auto object-contain block dark:hidden"
                      sizes="(max-width: 1024px) 100vw, 896px"
                      priority
                    />
                    <Image
                      src={activeDesign.fullHeightDark}
                      alt={activeDesign.name}
                      width={1200}
                      height={3000}
                      className="w-full h-auto object-contain hidden dark:block"
                      sizes="(max-width: 1024px) 100vw, 896px"
                      priority
                    />
                  </>
                ) : (
                  <Image
                    src={activeDesign.fullHeight}
                    alt={activeDesign.name}
                    width={1200}
                    height={3000}
                    className="w-full h-auto object-contain block"
                    sizes="(max-width: 1024px) 100vw, 896px"
                    priority
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

