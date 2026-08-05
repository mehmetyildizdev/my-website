import React from 'react';
import {
  BackLink,
  DetailHero,
  RatingCluster,
  WatchBadges,
  Overview,
  MetaPanel,
  CastSection,
  DepartmentSection,
  SectionShell,
  ProductionStrip,
  ThemeSeparator,
  groupCrewByDepartment,
} from './detail';
import GenreBackground from './genre/GenreBackground';

interface MovieDetailProps {
  movie: MovieDetail & {
    companies?: DetailCompany[];
    countries?: DetailCountry[];
    collection_name?: string | null;
  };
  cast: MovieCastMember[];
  crew: MovieCrewMember[];
  genres: { name: string }[];
}

export default function MovieDetail({ movie, cast, crew, genres }: MovieDetailProps) {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;
  const departments = groupCrewByDepartment(crew);
  const countries = movie.countries ?? [];
  const companies = movie.companies ?? [];

  const facts: Fact[] = [
    {
      label: 'Released',
      value: movie.release_date
        ? new Date(movie.release_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : null,
      glyph: '◷',
      token: 'sapphire',
    },
    { label: 'Runtime', value: runtime, glyph: '⏱', token: 'emerald' },
    {
      label: 'Language',
      value: movie.original_language?.toUpperCase(),
      glyph: '🗣',
      token: 'amethyst',
    },
    {
      label: 'Origin',
      value: countries.map((c) => c.name).join(', ') || null,
      glyph: '🌍',
      token: 'topaz',
    },
    {
      label: 'Franchise',
      value: movie.collection_name ?? null,
      glyph: '❖',
      token: 'gold',
      wide: true,
    },
  ];

  return (
    <article className="relative">
      <BackLink />

      <DetailHero
        title={movie.title}
        originalTitle={movie.original_title}
        posterPath={movie.poster_path}
        backdropPath={movie.backdrop_path}
        genres={genres}
        ratings={<RatingCluster myRating={movie.my_rating} tmdbRating={movie.tmdb_rating} tmdbId={movie.tmdb_id} mediaType="movie" />}
        watchBadges={<WatchBadges primary="Watched" lastWatchedAt={movie.last_watched_at} />}
      />

      <div className="relative z-10 mt-12 flex flex-col gap-10 px-4 md:px-8 pb-24">
        {/* Page-wide ambient repeating genre background starting below hero */}
        <div className="absolute inset-0 -z-10">
          <GenreBackground genres={genres} intensity={0.05} variant="repeat" />
        </div>

        <ThemeSeparator genres={genres} />

        {/* Key facts & Overview Row */}
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-start">
          <div>{movie.overview && <Overview text={movie.overview} />}</div>
          <div>
            <SectionShell title="At a Glance" blurb="The essentials" token="sapphire">
              <MetaPanel facts={facts} genres={genres} />
            </SectionShell>
          </div>
        </div>

        {cast.length > 0 && (
          <React.Fragment>
            <ThemeSeparator genres={genres} />
            <CastSection cast={cast as CastEntry[]} />
          </React.Fragment>
        )}

        {departments.map((group) => (
          <React.Fragment key={group.def.key}>
            <ThemeSeparator genres={genres} />
            <DepartmentSection group={group} />
          </React.Fragment>
        ))}

        {companies.length > 0 && (
          <React.Fragment>
            <ThemeSeparator genres={genres} />
            <SectionShell title="Studios" blurb="Behind the production" token="topaz">
              <ProductionStrip items={companies} />
            </SectionShell>
          </React.Fragment>
        )}
      </div>
    </article>
  );
}
