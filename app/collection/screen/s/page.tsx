import LogSuppressor from '@/components/LogSuppressor';
import GenreBumpChart from '@/components/screen/shared/GenreBumpChart';
import TopCompaniesNetworks from '@/components/screen/shared/TopCompaniesNetworks';
import ShowSeasonProgress from '@/components/screen/shows/ShowSeasonProgress';
import ShowNetworkTimeline from '@/components/screen/shows/ShowNetworkTimeline';
import BingePatterns from '@/components/screen/shows/BingePatterns';
import ShowRatingDistribution from '@/components/screen/shows/ShowRatingDistribution';
import RatingsComparison from '@/components/screen/shared/RatingsComparison';
import { cachedQuery, loadQuery } from '@/lib/screen/db';
import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';
export const revalidate = 604800; // 7 days — on-demand refreshed via app sync triggers

export const metadata = createScreenMetadata(SCREEN_SEO_CONFIG.shows);

export default async function ShowChartsPage() {
  const [bumpRes, networksRes, comparisonRes, seasonProgressRes, networkTimelineRes, bingeRes, ratingDistRes] = await Promise.all([
    cachedQuery(loadQuery('shows/genre_yearly_ratings.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('shows/top_networks.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('shows/ratings_comparison_shows.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('shows/show_season_progress.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('shows/show_network_timeline.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('shows/binge_patterns.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('shows/show_rating_distribution.sql'), [], ['screen-db']),
  ]);

  return (
    <>
      <LogSuppressor />
      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-accent font-poppins">Show Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your TV show journey — season progress, network preferences, and genre rating trends over time.
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
