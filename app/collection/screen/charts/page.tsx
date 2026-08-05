import LogSuppressor from '@/components/LogSuppressor';
import dynamic from 'next/dynamic';
import CollectionCompletions from '@/components/screen/movies/CollectionCompletions';
import TopCompaniesNetworks from '@/components/screen/shared/TopCompaniesNetworks';
import { cachedQuery, loadQuery } from '@/lib/screen/db';
import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';

const ChartSkeleton = () => <div className="h-72 rounded-2xl bg-pearl/10 animate-pulse border border-border/10" />;

const GenreTreemap = dynamic(() => import('@/components/screen/shared/GenreTreemap'), { loading: ChartSkeleton });
const GenreRatingsBars = dynamic(() => import('@/components/screen/shared/GenreRatingsBars'), { loading: ChartSkeleton });
const GenreRatingsScatter = dynamic(() => import('@/components/screen/shared/GenreRatingsScatter'), { loading: ChartSkeleton });
const RatingsComparison = dynamic(() => import('@/components/screen/shared/RatingsComparison'), { loading: ChartSkeleton });
const GenreBumpChart = dynamic(() => import('@/components/screen/shared/GenreBumpChart'), { loading: ChartSkeleton });
const WorldMapChart = dynamic(() => import('@/components/screen/shared/WorldMapChart'), { loading: ChartSkeleton });

export const revalidate = 604800; // 7 days — on-demand refreshed via app sync triggers
export const metadata = createScreenMetadata(SCREEN_SEO_CONFIG.charts);

export default async function ChartsPage() {
  const [genreRes, ratingsRes, comparisonRes, bumpRes, countryRes, statsRes, collectionsRes, companiesRes, networksRes] = await Promise.all(
    [
      cachedQuery(loadQuery('movies/genre_treemap.sql'), [], ['screen-db']),
      cachedQuery(loadQuery('shared/genre_ratings.sql'), [], ['screen-db']),
      cachedQuery(loadQuery('shared/ratings_comparison.sql'), [], ['screen-db']),
      cachedQuery(loadQuery('shared/genre_yearly_ratings.sql'), [], ['screen-db']),
      cachedQuery(loadQuery('shared/country_ratings.sql'), [], ['screen-db']),
      cachedQuery(loadQuery('dashboard/watch_stats.sql'), [], ['recent-watches', 'screen-db']),
      cachedQuery(loadQuery('movies/collection_completions.sql'), [], ['screen-db']),
      cachedQuery(loadQuery('movies/top_companies.sql'), [], ['screen-db']),
      cachedQuery(loadQuery('shows/top_networks.sql'), [], ['screen-db']),
    ],
  );

  return (
    <>
      <LogSuppressor />
      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-accent font-poppins">Charts</h2>
          <p className="text-sm text-muted-foreground mt-1">Visual analytics of watch history data, ratings, and genre distributions.</p>
        </div>
        <WorldMapChart data={countryRes.rows} />
        <GenreRatingsScatter data={ratingsRes.rows} />
        <GenreBumpChart data={bumpRes.rows} />
        <GenreTreemap data={genreRes.rows} />
        <GenreRatingsBars data={ratingsRes.rows} />
        <RatingsComparison data={comparisonRes.rows} />
        <TopCompaniesNetworks companies={companiesRes.rows} networks={networksRes.rows} />
        <CollectionCompletions data={collectionsRes.rows} />
      </div>
    </>
  );
}
