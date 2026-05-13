"use client";

import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/shadcn/ui/skeleton";
import { cn } from "@/lib/shadcn/utils";

interface HeroImageContentProps {
  kind: "image" | "htmlVisual";
  url?: string;
  htmlCode?: string;
  alt: string;
  themeBg: string;
  priority?: boolean;
}

export function HeroImageContent({ kind, url, htmlCode, alt, themeBg, priority = false }: HeroImageContentProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {isLoading && (
        <Skeleton className={cn("absolute inset-0 z-10 h-full w-full rounded-none opacity-40", themeBg)} />
      )}

      {kind === "image" && url ? (
        <Image
          src={url}
          alt={alt}
          fill
          className={cn(
            "object-cover object-center transition-opacity duration-500",
            themeBg,
            "mix-blend-plus-darker",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          sizes="(min-width: 1024px) 1440px, 100vw"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoading(false)}
        />
      ) : kind === "htmlVisual" && htmlCode ? (
        <iframe
          srcDoc={htmlCode}
          title={alt}
          sandbox="allow-scripts"
          scrolling="no"
          onLoad={() => setIsLoading(false)}
          className={cn(
            "h-full w-full border-none block transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      ) : null}
    </div>
  );
}

