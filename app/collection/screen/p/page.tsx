import LogSuppressor from '@/components/LogSuppressor';
import TopActors from '@/components/screen/people/TopActors';
import TopCrew from '@/components/screen/people/TopCrew';
import PeopleCollaborationWeb from '@/components/screen/people/PeopleCollaborationWeb';
import DirectorActorCollabs from '@/components/screen/people/DirectorActorCollabs';
import CrewCollabs from '@/components/screen/people/CrewCollabs';
import PeopleGenderDiversity from '@/components/screen/people/PeopleGenderDiversity';
import { cachedQuery, loadQuery } from '@/lib/screen/db';
import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';
export const revalidate = 604800; // 7 days — on-demand refreshed via app sync triggers

export const metadata = createScreenMetadata(SCREEN_SEO_CONFIG.people);

export default async function PeopleChartsPage() {
  const [collabRes, dirActorRes, crewCollabRes, genderRes] = await Promise.all([
    cachedQuery(loadQuery('people/people_collaborations.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('people/director_actor_collabs.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('people/crew_collabs.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('people/people_gender_diversity.sql'), [], ['screen-db']),
  ]);

  return (
    <>
      <LogSuppressor />
      <div className="space-y-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-accent font-poppins">People Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Explore the actors, directors, and crew behind your watched content — top rated, most watched, and collaboration patterns.
          </p>
        </div>

        <TopActors />
        <TopCrew />
        <PeopleCollaborationWeb data={collabRes.rows} />
        <DirectorActorCollabs data={dirActorRes.rows} />
        <CrewCollabs data={crewCollabRes.rows} />
        <PeopleGenderDiversity data={genderRes.rows} />
      </div>
    </>
  );
}
