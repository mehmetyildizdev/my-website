import { cachedQuery, loadQuery } from '@/lib/screen/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import TopCrewTabs from './TopCrewTabs';

// Row shape coming from analytics.top_rated_crew (lib/screen/queries/top_rated_crew.sql).

export default async function TopCrew() {
  const res = await cachedQuery(loadQuery('people/top_rated_crew.sql'), [], ['screen-db']);
  const rows = res.rows as CrewRow[];

  // Group once on the server so the client receives ready-to-render buckets.
  const buckets: CrewBuckets = {
    directing: [],
    production: [],
    screenwriting: [],
    cinematography: [],
    composition: [],
    design: [],
    source_material: [],
  };

  for (const r of rows) {
    if (r.category in buckets) {
      buckets[r.category as keyof CrewBuckets].push(r);
    }
  }

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-accent">Top Rated Crew</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Ratings basically represents likelihood of me liking the title the crew member would be involved in.
        </p>
      </CardHeader>
      <CardContent>
        <TopCrewTabs data={buckets} />
      </CardContent>
    </Card>
  );
}
