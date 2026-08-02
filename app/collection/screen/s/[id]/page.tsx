import { query, loadQuery } from "@/lib/screen/db";
import { notFound } from "next/navigation";
import ShowDetail from "@/components/screen/slugs/ShowDetail";
export const revalidate = 604800; // 7 days — on-demand only, never pre-built
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

import { createScreenDetailMetadata } from "@/lib/screen/seo";

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) return { robots: { index: false, follow: false } };
  const res = await query(loadQuery("slugs/show_detail.sql"), [tmdbId]);
  if (!res.rows[0]) return { robots: { index: false, follow: false } };
  const show = res.rows[0] as ShowDetail;

  return createScreenDetailMetadata({
    title: show.name,
    description: show.overview?.slice(0, 155) ?? `${show.name} on my screen dashboard.`,
    posterPath: show.poster_path,
    backdropPath: show.backdrop_path,
    type: 'video.tv_show',
  });
}

export default async function ShowDetailPage({ params }: Props) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) notFound();

  const res = await query(loadQuery("slugs/show_detail.sql"), [tmdbId]);
  if (!res.rows[0]) notFound();

  const showRow = res.rows[0] as ShowDetail & {
    genres: { name: string }[];
    cast: ShowCastMember[];
    crew: ShowCrewMember[];
  };

  return <ShowDetail show={showRow} cast={showRow.cast} crew={showRow.crew} genres={showRow.genres} />;
}
