// components/screen/slugs/detail/ProductionStrip.tsx
// Horizontal strip of production companies / networks. Shows the logo when
// available (unoptimized), else a tasteful text chip. Not linked.

'use client';

import Image from 'next/image';

export default function ProductionStrip({ items }: { items: ProductionEntity[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((it) => (
        <div
          key={it.tmdb_id}
          className="flex items-center justify-center gap-2 rounded-xl border border-border/10 bg-card/50 text-foreground dark:bg-platinum dark:text-background px-5 h-12"
          title={it.name}
        >
          {it.logo_path ? (
            <span className="relative block h-7 w-20 shrink-0">
              <Image
                src={`https://image.tmdb.org/t/p/w154${it.logo_path}`}
                alt={it.name}
                fill
                unoptimized
                className="object-contain object-center dark:opacity-90"
              />
            </span>
          ) : (
            <span className="text-xs font-medium text-center">{it.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}
