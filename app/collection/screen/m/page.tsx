import LogSuppressor from '@/components/LogSuppressor';
import GenreTreemap from '@/components/screen/shared/GenreTreemap';
import RatingsComparison from '@/components/screen/shared/RatingsComparison';
import CollectionCompletions from '@/components/screen/movies/CollectionCompletions';
import TopCompaniesNetworks from '@/components/screen/shared/TopCompaniesNetworks';
import MovieDecadeChart from '@/components/screen/movies/MovieDecadeChart';
import MovieLengthVsRating from '@/components/screen/movies/MovieLengthVsRating';
import DirectorRankings from '@/components/screen/movies/DirectorRankings';
import GenreBumpChart from '@/components/screen/shared/GenreBumpChart';
import { cachedQuery, loadQuery } from '@/lib/screen/db';
import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';
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
