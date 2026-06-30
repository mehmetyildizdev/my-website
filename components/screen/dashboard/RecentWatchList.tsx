import { query, loadQuery } from '@/lib/screen/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { PosterCard } from '@/components/screen/shared/PosterCard';
import GenreBackground from '@/components/screen/slugs/genre/GenreBackground';

export default async function RecentWatchList() {
  const [recentWatchesRes, topGenresRes] = await Promise.all([
    query(loadQuery('dashboard/recent_history.sql')),
    query(loadQuery('dashboard/top_genres.sql')),
  ]);

  const recentWatches = recentWatchesRes.rows as RecentWatchItem[];
  const topGenres = topGenresRes.rows;

  return (
    <Card className="relative overflow-hidden bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <GenreBackground genres={topGenres} intensity={0.2} variant="container" />
      <CardHeader className="relative z-10 pb-2">
        <CardTitle
          className="text-xl font-bold tracking-tight text-accent"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Recently Watched
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Chronological feed of my most recently watched movies and episodes.
        </p>
      </CardHeader>
      <CardContent className="relative z-10 pt-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {recentWatches.map((item) => {
            const href =
              item.media_type === 'movie'
                ? `/collection/screen/m/${item.tmdb_id ?? 0}`
                : `/collection/screen/s/${item.show_tmdb_id ?? item.tmdb_id ?? 0}`;
            const subtitle =
              item.media_type === 'episode'
                ? `S${item.season_number}E${item.episode_number}`
                : item.release_date
                  ? String(new Date(item.release_date).getFullYear())
                  : undefined;
            return (
              <PosterCard
                key={item.history_id}
                tmdb_id={item.tmdb_id ?? 0}
                href={href}
                title={item.title}
                subtitle={subtitle}
                poster_path={item.poster_path}
                rating={item.my_rating}
                meta={`Watched ${new Date(item.watched_at).toLocaleDateString('en-GB')}`}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
