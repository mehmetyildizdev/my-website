import LogSuppressor from '@/components/LogSuppressor';
import dynamic from 'next/dynamic';
import CollectionCompletions from '@/components/screen/movies/CollectionCompletions';
import TopCompaniesNetworks from '@/components/screen/shared/TopCompaniesNetworks';
import DirectorRankings from '@/components/screen/movies/DirectorRankings';
import { cachedQuery, loadQuery } from '@/lib/screen/db';
import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';

const ChartSkeleton = () => <div className="h-72 rounded-2xl bg-pearl/10 animate-pulse border border-border/10" />;

const GenreTreemap = dynamic(() => import('@/components/screen/shared/GenreTreemap'), { loading: ChartSkeleton });
const RatingsComparison = dynamic(() => import('@/components/screen/shared/RatingsComparison'), { loading: ChartSkeleton });
const MovieDecadeChart = dynamic(() => import('@/components/screen/movies/MovieDecadeChart'), { loading: ChartSkeleton });
const MovieLengthVsRating = dynamic(() => import('@/components/screen/movies/MovieLengthVsRating'), { loading: ChartSkeleton });
const GenreBumpChart = dynamic(() => import('@/components/screen/shared/GenreBumpChart'), { loading: ChartSkeleton });

export const revalidate = 604800; // 7 days — on-demand refreshed via app sync triggers
export const metadata = createScreenMetadata(SCREEN_SEO_CONFIG.movies);

export default async function MovieChartsPage() {
  const [genreRes, comparisonRes, collectionsRes, companiesRes, decadesRes, scatterRes, directorsRes, bumpRes] = await Promise.all([
    cachedQuery(loadQuery('movies/genre_treemap_movies.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('movies/ratings_comparison_movies.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('movies/collection_completions.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('movies/top_companies.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('movies/movie_decades.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('movies/movie_length_vs_rating.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('movies/director_rankings.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('movies/genre_yearly_ratings.sql'), [], ['screen-db']),
  ]);

  return (
    <>
      <LogSuppressor />
      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-accent font-poppins">Movie Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Deep dive into my watching patterns, genres, ratings, runtimes, collections, and more on movies.
          </p>
        </div>
        <GenreBumpChart data={bumpRes.rows} />
        <GenreTreemap data={genreRes.rows} />
        <RatingsComparison data={comparisonRes.rows} lockedMedia="movie" />
        <MovieLengthVsRating data={scatterRes.rows} />
        <MovieDecadeChart data={decadesRes.rows} />
        <DirectorRankings data={directorsRes.rows} />
        <TopCompaniesNetworks companies={companiesRes.rows} networks={[]} />
        <CollectionCompletions data={collectionsRes.rows} />
      </div>
    </>
  );
}
