import { Film, Tv, Sparkles, Clapperboard, TrendingUp, Clock } from 'lucide-react';
import WatchHeatmap from '@/components/screen/shared/WatchHeatmap';
import { query, loadQuery } from '@/lib/screen/db';
import GenreBackground from '@/components/screen/slugs/genre/GenreBackground';
import NowPlayingCard from '@/components/screen/now-playing/NowPlayingCard';

export default async function ScreenHero() {
  // Queries for the hero — heatmap + stats + top genres for background motifs
  const [heatmapRes, statsRes, topGenresRes] = await Promise.all([
    query(loadQuery('dashboard/watch_heatmap.sql')),
    query(loadQuery('dashboard/watch_stats.sql')),
    query(loadQuery('dashboard/top_genres.sql')),
  ]);

  const topGenres = topGenresRes.rows;

  return (
    <header className="relative overflow-hidden rounded-3xl border border-border/10 bg-pearl/5 shadow-2xl backdrop-blur-md group transition-all duration-500 hover:border-gold/20">
      {/* Genre motifs background overlay */}
      <GenreBackground genres={topGenres} intensity={0.15} variant="repeat" />

      {/* Top section: Title + description */}
      <div className="relative z-10 p-8 md:p-12 pb-0">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Title and description */}
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 text-gold bg-gold/5 text-[10px] font-semibold tracking-widest uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
              </span>
              Live Overview
            </div>

            <h1
              className="text-5xl md:text-6xl font-black text-gold tracking-tight leading-none flex items-center gap-3"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Screen
              <Clapperboard className="h-8 w-8 text-gold/80 animate-pulse hidden sm:inline" />
            </h1>

            <div
              className="text-quicksilver text-sm sm:text-base leading-relaxed max-w-4xl space-y-4 border-l-2 border-gold/30 pl-4 py-1"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              <p className="font-medium text-foreground/90">
                A curated archive of cinematic exploration, synced from my personal streaming
                platform, powered by serverless PostgreSQL and Cloudflare Workers with TMDB data.
              </p>
              <p className="text-quicksilver/90 text-[13px] sm:text-[14px]">
                Dive into movies, shows, and people through custom data-driven insights. I believe
                owning and controlling our personal data is increasingly vital in an era of
                automated, black-box algorithms. Instead of relying on volatile, ad-supported
                third-party platforms, this ecosystem is built to be a permanent personal space.
                Live playback events are tracked in real time, while the rest of the dataset is
                refreshed daily via GitHub Actions.
              </p>
              <p className="text-xs text-emerald dark:text-gold/80 italic font-medium pt-1">
                Want to have your own version? Feel free to reach out. I'd be happy to share the
                setup and guide you through it.
              </p>
            </div>
          </div>

          {/* Right: Quick stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 lg:min-w-60">
            <QuickStat icon={Film} label="Movies" value="Tracked" />
            <QuickStat icon={Tv} label="TV Shows" value="Episodes" />
            <QuickStat icon={Sparkles} label="Ratings" value="10-GenreScatterPoint" />
            <QuickStat icon={TrendingUp} label="Trends" value="By Genre" />
            <QuickStat icon={Clock} label="History" value="All Time" />
            <QuickStat icon={Clapperboard} label="People" value="Cast & Crew" />
          </div>
        </div>
      </div>

      {/* Heatmap section — embedded in hero */}
      <div className="relative z-10 px-4 md:px-12 py-4 md:py-6">
        <WatchHeatmap data={heatmapRes.rows} stats={statsRes.rows} embedded={false} />
      </div>

      {/* Now Playing Section — inside overview box below watch history chart */}
      <div className="relative z-10 px-4 md:px-12 pb-8 md:pb-12">
        <NowPlayingCard />
      </div>
    </header>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-pearl/33 border border-border/15 backdrop-blur-xs transition-all duration-300 hover:bg-pearl/66 hover:border-gold/30">
      <Icon className="h-4 w-4 text-gold shrink-0" />
      <div>
        <p className="text-[9px] text-quicksilver font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
