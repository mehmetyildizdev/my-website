import LogSuppressor from '@/components/LogSuppressor';
import GenreTreemap from '@/components/screen/shared/GenreTreemap';
import GenreRatingsBars from '@/components/screen/shared/GenreRatingsBars';
import GenreRatingsScatter from '@/components/screen/shared/GenreRatingsScatter';
import RatingsComparison from '@/components/screen/shared/RatingsComparison';
import GenreBumpChart from '@/components/screen/shared/GenreBumpChart';
import WorldMapChart from '@/components/screen/shared/WorldMapChart';
import CollectionCompletions from '@/components/screen/movies/CollectionCompletions';
import TopCompaniesNetworks from '@/components/screen/shared/TopCompaniesNetworks';
import WatchHeatmap from '@/components/screen/shared/WatchHeatmap';
import { query, loadQuery } from '@/lib/screen/db';
import Link from 'next/link';
import { SCREEN_CONFIG } from '@/lib/screen/config';

export const revalidate = SCREEN_CONFIG.cacheDurations.mainPages;

export const metadata = {
  title: 'Screen | Charts',
  description: 'Visual analytics of watch history data.',
};

export default async function ChartsPage() {
  const [
    genreRes,
    heatmapRes,
    ratingsRes,
    comparisonRes,
    bumpRes,
    countryRes,
    statsRes,
    collectionsRes,
    companiesRes,
    networksRes,
  ] = await Promise.all([
    query(loadQuery('movies/genre_treemap.sql')),
    query(loadQuery('dashboard/watch_heatmap.sql')),
    query(loadQuery('shared/genre_ratings.sql')),
    query(loadQuery('shared/ratings_comparison.sql')),
    query(loadQuery('shared/genre_yearly_ratings.sql')),
    query(loadQuery('shared/country_ratings.sql')),
    query(loadQuery('dashboard/watch_stats.sql')),
    query(loadQuery('movies/collection_completions.sql')),
    query(loadQuery('movies/top_companies.sql')),
    query(loadQuery('shows/top_networks.sql')),
  ]);

  return (
    <>
      <LogSuppressor />
      <div className="space-y-12">
        <div className="flex items-center gap-4">
          <Link
            href="/collection/screen"
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            ← Back to Screen
          </Link>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-accent">Charts</h2>
        <WorldMapChart data={countryRes.rows} />
        <WatchHeatmap data={heatmapRes.rows} stats={statsRes.rows} />
        <GenreTreemap data={genreRes.rows} />
        <GenreRatingsBars data={ratingsRes.rows} />
        <GenreBumpChart data={bumpRes.rows} />
        <GenreRatingsScatter data={ratingsRes.rows} />
        <RatingsComparison data={comparisonRes.rows} />
        <TopCompaniesNetworks companies={companiesRes.rows} networks={networksRes.rows} />
        <CollectionCompletions data={collectionsRes.rows} />
      </div>
    </>
  );
}
