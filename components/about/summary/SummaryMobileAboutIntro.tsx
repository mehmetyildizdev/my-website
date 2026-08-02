'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/shadcn/utils';

const AVATAR_RING =
  'conic-gradient(var(--color-ruby), var(--color-amethyst), var(--color-sapphire), var(--color-emerald), var(--color-topaz), var(--color-ruby))';

export function SummaryMobileAboutIntro() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-border/10 shrink-0">
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-full" style={{ background: AVATAR_RING }} aria-hidden />
        <div className="relative w-16 h-16 rounded-full bg-pearl p-0.5">
          {!imageLoaded && <div className="absolute inset-0 rounded-full animate-pulse bg-muted/50" />}
          <Image
            src="/images/pp.webp"
            className={cn('rounded-full transition-opacity duration-500', imageLoaded ? 'opacity-100' : 'opacity-0')}
            alt="Mehmet Yildiz"
            width={64}
            height={64}
            priority
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>
      <div className="min-w-0 flex-1 pl-2">
        <h2 className="text-lg font-bold text-foreground tracking-tight leading-tight">Mehmet Yıldız</h2>
        <p className="text-[11px] text-platinum tracking-[0.2em] uppercase mt-0.5">Digital Product Architect</p>
      </div>
    </div>
  );
}
