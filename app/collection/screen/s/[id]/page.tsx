import { fetchShowDetail } from '@/lib/screen/slugs';
import { isRecentWatchSource } from '@/lib/screen/slug-source';
import { notFound } from 'next/navigation';
import ShowDetail from '@/components/screen/slugs/ShowDetail';

export const revalidate = 604800; // 7 days — on-demand only, never pre-built
export const dynamicParams = true;

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ source?: string | string[] }>;
};

import { createScreenDetailMetadata } from '@/lib/screen/seo';

export async function generateMetadata({ params, searchParams }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) return { robots: { index: false, follow: false } };
  const query = searchParams ? await searchParams : {};
  const show = await fetchShowDetail(tmdbId, { allowRecentWatchFallback: isRecentWatchSource(query.source) });
  if (!show) return { robots: { index: false, follow: false } };

  return createScreenDetailMetadata({
    title: show.name,
    description: show.overview?.slice(0, 155) ?? `${show.name} on my screen dashboard.`,
    posterPath: show.poster_path,
    backdropPath: show.backdrop_path,
    type: 'video.tv_show',
  });
}

export default async function ShowDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  const query = searchParams ? await searchParams : {};
  const showRow = await fetchShowDetail(tmdbId, { allowRecentWatchFallback: isRecentWatchSource(query.source) });
  if (!showRow) notFound();

  return <ShowDetail show={showRow} cast={showRow.cast ?? []} crew={showRow.crew ?? []} genres={showRow.genres ?? []} />;
}
