import { fetchMovieDetail } from '@/lib/screen/slugs';
import { isRecentWatchSource } from '@/lib/screen/slug-source';
import { notFound } from 'next/navigation';
import MovieDetail from '@/components/screen/slugs/MovieDetail';

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
  const movie = await fetchMovieDetail(tmdbId, { allowRecentWatchFallback: isRecentWatchSource(query.source) });
  if (!movie) return { robots: { index: false, follow: false } };

  return createScreenDetailMetadata({
    title: movie.title,
    description: movie.overview?.slice(0, 155) ?? `${movie.title} on my screen dashboard.`,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    type: 'video.movie',
  });
}

export default async function MovieDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  const query = searchParams ? await searchParams : {};
  const movieRow = await fetchMovieDetail(tmdbId, { allowRecentWatchFallback: isRecentWatchSource(query.source) });
  if (!movieRow) notFound();

  return <MovieDetail movie={movieRow} cast={movieRow.cast ?? []} crew={movieRow.crew ?? []} genres={movieRow.genres ?? []} />;
}
