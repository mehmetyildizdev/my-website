import LogSuppressor from '@/components/LogSuppressor';
import RecentWatchList from '@/components/screen/dashboard/RecentWatchList';
import ScreenHero from '@/components/screen/dashboard/ScreenHero';
import GenreRatingsBars from '@/components/screen/shared/GenreRatingsBars';
import GenreTreemap from '@/components/screen/shared/GenreTreemap';
import { query, loadQuery } from '@/lib/screen/db';
export const revalidate = 604800;

export const metadata = {
  title: 'Screen | Watch Statistics',
  description: 'My personal movie and TV show watch history, ratings and analytics.',
};

export default async function ScreenDashboardPage() {
  // Only fetch lightweight data for the dashboard — heavy charts live in sub-routes
  const [ratingsRes, genreRes] = await Promise.all([
    query(loadQuery('shared/genre_ratings.sql')),
    query(loadQuery('movies/genre_treemap.sql')),
  ]);

  return (
    <>
      <LogSuppressor />
      <div className="space-y-12">
        {/* ── Cinematic Hero with embedded Heatmap ─────────────────────── */}
        <ScreenHero />

        {/* ── Recently Watched Section ─────────────────────────────────── */}
        <RecentWatchList />

        {/* ── Genre Affinity — lightweight overview chart ──────────────── */}
        <GenreRatingsBars data={ratingsRes.rows} />

        {/* ── Genre distribution — lightweight overview chart ──────────────── */}
        <GenreTreemap data={genreRes.rows} />
      </div>
    </>
  );
}
