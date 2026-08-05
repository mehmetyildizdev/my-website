import { fetchPersonDetail } from '@/lib/screen/slugs';
import { notFound } from 'next/navigation';
import PersonDetail from '@/components/screen/slugs/PersonDetail';

export const revalidate = 604800; // 7 days — on-demand only, never pre-built
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

import { createScreenDetailMetadata } from '@/lib/screen/seo';

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) return { robots: { index: false, follow: false } };
  const person = await fetchPersonDetail(tmdbId);
  if (!person) return { robots: { index: false, follow: false } };

  return createScreenDetailMetadata({
    title: person.name,
    description: `${person.name} — ${person.known_for_department ?? 'Actor'} · ${person.movies_watched ?? 0} films watched on my screen dashboard.`,
    profilePath: person.profile_path,
    type: 'profile',
  });
}

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  const personRow = await fetchPersonDetail(tmdbId);
  if (!personRow) notFound();

  const endDate = personRow.deathday ? new Date(personRow.deathday) : new Date();
  const age = personRow.birth_date
    ? Math.floor((endDate.getTime() - new Date(personRow.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return <PersonDetail person={personRow} movies={personRow.movies ?? []} shows={personRow.shows ?? []} age={age} />;
}
