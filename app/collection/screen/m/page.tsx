import LogSuppressor from '@/components/LogSuppressor';
import GenreTreemap from '@/components/screen/shared/GenreTreemap';
import RatingsComparison from '@/components/screen/shared/RatingsComparison';
import CollectionCompletions from '@/components/screen/movies/CollectionCompletions';
import TopCompaniesNetworks from '@/components/screen/shared/TopCompaniesNetworks';
import MovieDecadeChart from '@/components/screen/movies/MovieDecadeChart';
import MovieLengthVsRating from '@/components/screen/movies/MovieLengthVsRating';
import DirectorRankings from '@/components/screen/movies/DirectorRankings';
import GenreBumpChart from '@/components/screen/shared/GenreBumpChart';
import { query, loadQuery } from '@/lib/screen/db';
export const revalidate = 86400; // 24h — refreshed by nightly GitHub Action

export const metadata = {
  title: 'Screen | Movie Charts',
  description: 'Visual analytics of movie watch history — genres, decades, ratings, and more.',
};

export default async function MovieChartsPage() {
  const [
    genreRes,
    comparisonRes,
    collectionsRes,
    companiesRes,
    decadesRes,
    scatterRes,
    directorsRes,
    bumpRes,
  ] = await Promise.all([
    query(loadQuery('movies/genre_treemap_movies.sql')),
    query(loadQuery('movies/ratings_comparison_movies.sql')),
    query(loadQuery('movies/collection_completions.sql')),
    query(loadQuery('movies/top_companies.sql')),
    query(loadQuery('movies/movie_decades.sql')),
    query(loadQuery('movies/movie_length_vs_rating.sql')),
    query(loadQuery('movies/director_rankings.sql')),
    query(loadQuery('movies/genre_yearly_ratings.sql')),
  ]);

  return (
    <>
      <LogSuppressor />
      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-accent">Movie Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Deep dive into my watching patterns, genres, ratings, runtimes, collections, and more on
            movies.
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
