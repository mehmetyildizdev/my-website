import LogSuppressor from '@/components/LogSuppressor';
import RecentWatchList from '@/components/screen/dashboard/RecentWatchList';
import ScreenHero from '@/components/screen/dashboard/ScreenHero';
import GenreRatingsBars from '@/components/screen/shared/GenreRatingsBars';
import GenreTreemap from '@/components/screen/shared/GenreTreemap';
import { query, loadQuery } from '@/lib/screen/db';
export const revalidate = 604800; // 7 days — on-demand refreshed via app sync triggers

export default async function ScreenDashboardPage() {
  // Only fetch lightweight data for the dashboard — heavy charts live in sub-routes
  const [ratingsRes, genreRes, recentRes] = await Promise.all([
    query(loadQuery('shared/genre_ratings.sql')),
    query(loadQuery('movies/genre_treemap.sql')),
    query(loadQuery('dashboard/recent_history.sql')),
  ]);

  return (
    <>
      <LogSuppressor />
      <div className="space-y-12">
        {/* ── Cinematic Hero with embedded Heatmap ─────────────────────── */}
        <ScreenHero />

        {/* ── Recently Watched Section ─────────────────────────────────── */}
        <RecentWatchList initialData={recentRes.rows} />

        {/* ── Genre Affinity — lightweight overview chart ──────────────── */}
        <GenreRatingsBars data={ratingsRes.rows} />

        {/* ── Genre distribution — lightweight overview chart ──────────────── */}
        <GenreTreemap data={genreRes.rows} />
      </div>
    </>
  );
}
