import { query, loadQuery } from '@/lib/screen/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import TopActorsTabs from './TopActorsTabs';

export default async function TopActors() {
  // 9 buckets: 3 scopes × 3 modes. Run in parallel.
  // "Overall × Top Rated" intentionally uses the original Bayesian-weighted
  // view (analytics.top_rated_actors); everything else uses analytics.actor_stats.
  const [
    overallTop,
    overallWatched,
    overallExposed,
    moviesTop,
    moviesWatched,
    moviesExposed,
    showsTop,
    showsWatched,
    showsExposed,
  ] = await Promise.all([
    query(loadQuery('people/top_rated_actors.sql')),
    query(loadQuery('people/actors_overall_most_watched.sql')),
    query(loadQuery('people/actors_overall_most_exposed.sql')),
    query(loadQuery('people/actors_movies_top_rated.sql')),
    query(loadQuery('people/actors_movies_most_watched.sql')),
    query(loadQuery('people/actors_movies_most_exposed.sql')),
    query(loadQuery('people/actors_shows_top_rated.sql')),
    query(loadQuery('people/actors_shows_most_watched.sql')),
    query(loadQuery('people/actors_shows_most_exposed.sql')),
  ]);

  const data: TopActorsBuckets = {
    overall: {
      top_rated: overallTop.rows as TopPerson[],
      most_watched: overallWatched.rows as TopPerson[],
      most_exposed: overallExposed.rows as TopPerson[],
    },
    movies: {
      top_rated: moviesTop.rows as TopPerson[],
      most_watched: moviesWatched.rows as TopPerson[],
      most_exposed: moviesExposed.rows as TopPerson[],
    },
    shows: {
      top_rated: showsTop.rows as TopPerson[],
      most_watched: showsWatched.rows as TopPerson[],
      most_exposed: showsExposed.rows as TopPerson[],
    },
  };

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-accent">
          Top Rated Actors
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Ratings in my website are calculated with my own bayesian formula using role weights,
          exposure indexes and personal rating on the titles for actors.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Ratings basically represents likelihood of me liking the title the actor would appear on.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Show runtime is approximated from my average watched-episode length per show.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Watched count ratings are simple title based counts ranked in order.
        </p>
      </CardHeader>
      <CardContent>
        <TopActorsTabs data={data} />
      </CardContent>
    </Card>
  );
}
