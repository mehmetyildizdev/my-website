import { pgQuery, loadQuery } from '@/lib/screen/db';

type UnratedItem = {
  media_type: 'movie' | 'show';
  title: string;
  release_date: string | null;
  tmdb_id: number | null;
  watched_at: string;
};

function getTmdbUrl(item: UnratedItem): string | null {
  if (!item.tmdb_id) return null;
  if (item.media_type === 'movie') {
    return `https://www.themoviedb.org/movie/${item.tmdb_id}`;
  }
  return `https://www.themoviedb.org/tv/${item.tmdb_id}`;
}

export default async function UnratedWatches() {
  const res = await pgQuery(loadQuery('stats/unrated_watches.sql'));
  const items = res.rows as UnratedItem[];

  const movies = items.filter((i) => i.media_type === 'movie');
  const shows = items.filter((i) => i.media_type === 'show');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Unrated Movies or Shows</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {movies.length} movies and {shows.length} shows to rate. Click to open on TMDB.
        </p>
      </div>

      {/* Movies */}
      {movies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Movies ({movies.length})</h4>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {movies.map((item) => {
              const url = getTmdbUrl(item);
              const year = item.release_date ? new Date(item.release_date).getFullYear() : null;
              return (
                <div
                  key={`movie-${item.tmdb_id || item.title}`}
                  className="flex items-center gap-2 rounded border border-border/15 bg-pearl/10 px-2.5 py-1.5 text-xs hover:bg-pearl/30 transition-colors"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-accent transition-colors flex-1"
                    >
                      {item.title}
                      {year && <span className="text-muted-foreground ml-1">({year})</span>}
                    </a>
                  ) : (
                    <span className="truncate flex-1">
                      {item.title}
                      {year && <span className="text-muted-foreground ml-1">({year})</span>}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shows */}
      {shows.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Shows ({shows.length})</h4>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {shows.map((item) => {
              const url = getTmdbUrl(item);
              const year = item.release_date ? new Date(item.release_date).getFullYear() : null;
              return (
                <div
                  key={`show-${item.tmdb_id || item.title}`}
                  className="flex items-center gap-2 rounded border border-border/15 bg-pearl/10 px-2.5 py-1.5 text-xs hover:bg-pearl/30 transition-colors"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-accent transition-colors flex-1"
                    >
                      {item.title}
                      {year && <span className="text-muted-foreground ml-1">({year})</span>}
                    </a>
                  ) : (
                    <span className="truncate flex-1">
                      {item.title}
                      {year && <span className="text-muted-foreground ml-1">({year})</span>}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground italic">All watched items have been rated!</p>
      )}
    </div>
  );
}
