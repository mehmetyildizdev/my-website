'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/shadcn/ui/tabs';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
import { SCREEN_CONFIG } from '@/lib/screen/config';
type Props = {
  companies: CompanyData[];
  networks: NetworkData[];
};

function ratingColor(rating: number): string {
  if (rating >= 7) return 'text-emerald';
  if (rating >= 6.5) return 'text-sapphire';
  if (rating >= 6) return 'text-topaz';
  if (rating >= 5.5) return 'text-amethyst';
  return 'text-ruby';
}

function ratingBorder(rating: number): string {
  if (rating >= 7) return 'border-emerald/30';
  if (rating >= 6.5) return 'border-sapphire/30';
  if (rating >= 6) return 'border-topaz/30';
  if (rating >= 5.5) return 'border-amethyst/30';
  return 'border-ruby/30';
}

function countryFlag(iso: string | null): string {
  if (!iso) return '';
  const code = iso.toUpperCase();
  return [...code].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('');
}

const PAGE_SIZE = SCREEN_CONFIG.pagination.companiesNetworks;

function RankedGrid({
  items,
  visible,
  onLoadMore,
}: {
  items: RankedGridItem[];
  visible: number;
  onLoadMore: () => void;
}) {
  const visibleItems = items.slice(0, visible);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {visibleItems.map((item, idx) => (
          <Tooltip
            key={item.id}
            placement="mouse"
            content={
              <div className="flex flex-col gap-0.5 min-w-40">
                <span
                  className="font-semibold text-gold"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  {item.name}
                </span>
                <div className="flex justify-between gap-4 text-[11px] mt-1">
                  <span className="text-quicksilver">Avg Rating</span>
                  <span className="text-platinum font-semibold tabular-nums">
                    {item.avg_rating.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-quicksilver">{item.countLabel}</span>
                  <span className="text-sapphire tabular-nums">{item.count}</span>
                </div>
              </div>
            }
          >
            <div
              className={`relative flex flex-col items-center p-3 rounded-xl border ${ratingBorder(item.avg_rating)} bg-pearl/10 hover:bg-pearl/25 transition-colors h-full`}
            >
              {/* Rank badge */}
              <span className="absolute top-1.5 left-2 text-[10px] text-muted-foreground tabular-nums font-medium">
                #{idx + 1}
              </span>

              {/* Fixed-size logo container */}
              <div className="w-16 h-16 p-1 dark:bg-accent flex items-center justify-center shrink-0 mt-1">
                {item.logo_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://image.tmdb.org/t/p/w154${item.logo_path}`}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain rounded"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-border/20 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-medium">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {/* Country — fixed height slot so rating doesn't shift */}
              <span className="text-xs mt-4 text-muted-foreground h-4 flex items-center">
                {item.country_iso ? countryFlag(item.country_iso) : '\u00A0'}
              </span>

              {/* Name — fixed 2-line height */}
              <span className="text-sm text-foreground/90 text-center leading-tight line-clamp-2 w-full min-h-[2lh] mt-2">
                {item.name}
              </span>

              {/* Rating */}
              <span
                className={`text-lg font-mono font-semibold tabular-nums ${ratingColor(item.avg_rating)}`}
              >
                {item.avg_rating.toFixed(1)}
              </span>
            </div>
          </Tooltip>
        ))}
      </div>
      {visible < items.length && (
        <button
          onClick={onLoadMore}
          className="w-full mt-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-pearl/30 rounded-md border border-border/10 transition-colors"
        >
          Show more ({items.length - visible} remaining)
        </button>
      )}
    </>
  );
}

export default function TopCompaniesNetworks({ companies, networks }: Props) {
  const [companiesVisible, setCompaniesVisible] = useState(PAGE_SIZE);
  const [networksVisible, setNetworksVisible] = useState(PAGE_SIZE);

  const companyItems: RankedGridItem[] = companies.map((c) => ({
    id: c.tmdb_id,
    name: c.name,
    logo_path: c.logo_path,
    country_iso: c.country_iso,
    avg_rating: Number(c.avg_rating),
    count: c.movie_count,
    countLabel: 'Movies Rated',
  }));

  const networkItems: RankedGridItem[] = networks.map((n) => ({
    id: n.tmdb_id,
    name: n.name,
    logo_path: n.logo_path,
    country_iso: n.country_iso,
    avg_rating: Number(n.avg_rating),
    count: n.show_count,
    countLabel: 'Shows Rated',
  }));

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">Most Favored</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Production companies and TV networks ranked by my average rating.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        {companies.length > 0 && networks.length > 0 ? (
          <Tabs defaultValue="companies">
            <TabsList>
              <TabsTrigger value="companies">Production Companies</TabsTrigger>
              <TabsTrigger value="networks">TV Networks</TabsTrigger>
            </TabsList>

            <TabsContent value="companies">
              <RankedGrid
                items={companyItems}
                visible={companiesVisible}
                onLoadMore={() => setCompaniesVisible((v) => v + PAGE_SIZE)}
              />
            </TabsContent>

            <TabsContent value="networks">
              <RankedGrid
                items={networkItems}
                visible={networksVisible}
                onLoadMore={() => setNetworksVisible((v) => v + PAGE_SIZE)}
              />
            </TabsContent>
          </Tabs>
        ) : companies.length > 0 ? (
          <RankedGrid
            items={companyItems}
            visible={companiesVisible}
            onLoadMore={() => setCompaniesVisible((v) => v + PAGE_SIZE)}
          />
        ) : (
          <RankedGrid
            items={networkItems}
            visible={networksVisible}
            onLoadMore={() => setNetworksVisible((v) => v + PAGE_SIZE)}
          />
        )}
      </CardContent>
    </Card>
  );
}
