import LogSuppressor from '@/components/LogSuppressor';
import GenreTreemap from '@/components/screen/shared/GenreTreemap';
import GenreRatingsBars from '@/components/screen/shared/GenreRatingsBars';
import GenreRatingsScatter from '@/components/screen/shared/GenreRatingsScatter';
import RatingsComparison from '@/components/screen/shared/RatingsComparison';
import GenreBumpChart from '@/components/screen/shared/GenreBumpChart';
import WorldMapChart from '@/components/screen/shared/WorldMapChart';
import CollectionCompletions from '@/components/screen/movies/CollectionCompletions';
import TopCompaniesNetworks from '@/components/screen/shared/TopCompaniesNetworks';
import { cachedQuery, loadQuery } from '@/lib/screen/db';
import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';
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
