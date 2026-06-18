import { query, loadQuery } from "@/lib/screen/db";
import { notFound } from "next/navigation";
import MovieDetail from "@/components/screen/slugs/MovieDetail";
export const revalidate = 2592000;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) return {};
  const res = await query(loadQuery("slugs/movie_detail.sql"), [tmdbId]);
  if (!res.rows[0]) return {};
  const movie = res.rows[0] as MovieDetail;
  return {
    title: `${movie.title} | Screen`,
    description: movie.overview?.slice(0, 155) ?? `${movie.title} on my screen dashboard.`,
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  const res = await query(loadQuery("slugs/movie_detail.sql"), [tmdbId]);
  if (!res.rows[0]) notFound();

  const movieRow = res.rows[0] as MovieDetail & {
    genres: { name: string }[];
    cast: MovieCastMember[];
    crew: MovieCrewMember[];
  };

  return (
    <MovieDetail 
      movie={movieRow} 
      cast={movieRow.cast} 
      crew={movieRow.crew} 
      genres={movieRow.genres} 
    />
  );
}
