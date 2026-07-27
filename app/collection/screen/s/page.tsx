import LogSuppressor from '@/components/LogSuppressor';
import GenreBumpChart from '@/components/screen/shared/GenreBumpChart';
import TopCompaniesNetworks from '@/components/screen/shared/TopCompaniesNetworks';
import ShowSeasonProgress from '@/components/screen/shows/ShowSeasonProgress';
import ShowNetworkTimeline from '@/components/screen/shows/ShowNetworkTimeline';
import BingePatterns from '@/components/screen/shows/BingePatterns';
import ShowRatingDistribution from '@/components/screen/shows/ShowRatingDistribution';
import RatingsComparison from '@/components/screen/shared/RatingsComparison';
import { query, loadQuery } from '@/lib/screen/db';
export const revalidate = 86400; // 24h — refreshed by nightly GitHub Action

export const metadata = {
  title: 'Screen | Show Charts',
  description: 'Visual analytics of TV show watch history — networks, seasons, and genre trends.',
};

export default async function ShowChartsPage() {
  const [
    bumpRes,
    networksRes,
    comparisonRes,
    seasonProgressRes,
    networkTimelineRes,
    bingeRes,
    ratingDistRes,
  ] = await Promise.all([
    query(loadQuery('shows/genre_yearly_ratings.sql')),
    query(loadQuery('shows/top_networks.sql')),
    query(loadQuery('shows/ratings_comparison_shows.sql')),
    query(loadQuery('shows/show_season_progress.sql')),
    query(loadQuery('shows/show_network_timeline.sql')),
    query(loadQuery('shows/binge_patterns.sql')),
    query(loadQuery('shows/show_rating_distribution.sql')),
  ]);

  return (
    <>
      <LogSuppressor />
      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-accent font-poppins">Show Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your TV show journey — season progress, network preferences, and genre rating
            trends over time.
          </p>
        </div>

        <ShowSeasonProgress data={seasonProgressRes.rows} />
        <GenreBumpChart data={bumpRes.rows} />
        <RatingsComparison data={comparisonRes.rows} lockedMedia="show" />
        <ShowRatingDistribution data={ratingDistRes.rows} />
        <ShowNetworkTimeline data={networkTimelineRes.rows} />
        <TopCompaniesNetworks companies={[]} networks={networksRes.rows} />
        <BingePatterns data={bingeRes.rows} />
      </div>
    </>
  );
}
