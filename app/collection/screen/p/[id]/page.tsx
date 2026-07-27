import { query, loadQuery } from '@/lib/screen/db';
import { notFound } from 'next/navigation';
import PersonDetail from '@/components/screen/slugs/PersonDetail';
export const revalidate = 604800; // 7 days — on-demand only, never pre-built
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) return {};
  const res = await query(loadQuery('slugs/person_detail.sql'), [tmdbId]);
  if (!res.rows[0]) return {};
  const person = res.rows[0] as PersonDetail;
  return {
    title: `${person.name} | Screen`,
    description: `${person.name} — ${person.known_for_department ?? 'Actor'} · ${person.movies_watched} films watched on my screen dashboard.`,
  };
}

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  const res = await query(loadQuery('slugs/person_detail.sql'), [tmdbId]);
  if (!res.rows[0]) notFound();

  const personRow = res.rows[0] as PersonDetail & {
    movies: PersonMovieCredit[];
    shows: PersonShowCredit[];
  };

  const age = personRow.birth_date
    ? Math.floor(
        (new Date(personRow.deathday ?? Date.now()).getTime() -
          new Date(personRow.birth_date).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <PersonDetail person={personRow} movies={personRow.movies} shows={personRow.shows} age={age} />
  );
}
