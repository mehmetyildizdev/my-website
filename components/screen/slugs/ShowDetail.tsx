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

interface ShowDetailProps {
  show: ShowDetail & {
    companies?: DetailCompany[];
    countries?: DetailCountry[];
    networks?: DetailNetwork[];
  };
  cast: ShowCastMember[];
  crew?: ShowCrewMember[];
  genres: { name: string }[];
}

export default function ShowDetail({ show, cast, crew = [], genres }: ShowDetailProps) {
  const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : null;
  const watchPct =
    show.number_of_episodes && show.episodes_watched ? Math.round((show.episodes_watched / show.number_of_episodes) * 100) : null;
  const departments = groupCrewByDepartment(crew);
  const countries = show.countries ?? [];
  const companies = show.companies ?? [];
  const networks = show.networks ?? [];

  const facts: Fact[] = [
    {
      label: 'First Aired',
      value: show.first_air_date
        ? new Date(show.first_air_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : null,
      glyph: '◷',
      token: 'sapphire',
    },
    {
      label: 'Seasons',
      value: show.number_of_seasons ?? null,
      glyph: '▦',
      token: 'emerald',
    },
    {
      label: 'Episodes',
      value: show.number_of_episodes ?? null,
      glyph: '▤',
      token: 'amethyst',
    },
    {
      label: 'Language',
      value: show.original_language?.toUpperCase(),
      glyph: '🗣',
      token: 'topaz',
    },
    {
      label: 'Origin',
      value: countries.map((c) => c.name).join(', ') || null,
      glyph: '🌍',
      token: 'ruby',
    },
    {
      label: 'Network',
      value: networks.map((n) => n.name).join(', ') || null,
      glyph: '📡',
      token: 'gold',
      wide: true,
    },
  ];

  return (
    <article className="relative">
      <div className="mb-6 md:hidden">
        <BackLink />
      </div>

      <DetailHero
        title={show.name}
        originalTitle={show.original_name}
        posterPath={show.poster_path}
        backdropPath={show.backdrop_path}
        genres={genres}
        ratings={<RatingCluster myRating={show.my_rating} tmdbRating={show.tmdb_rating} tmdbId={show.tmdb_id} mediaType="tv" />}
        watchBadges={
          <WatchBadges primary={`${show.episodes_watched} of ${show.number_of_episodes ?? '?'} episodes`} progressPct={watchPct} />
        }
      />

      <div className="relative z-10 mt-12 flex flex-col gap-10 px-4 md:px-8 pb-24">
        {/* Page-wide ambient repeating genre background starting below hero */}
        <div className="absolute inset-0 -z-10">
          <GenreBackground genres={genres} intensity={0.05} variant="repeat" />
        </div>

        <ThemeSeparator genres={genres} />

        {/* Key facts & Overview Row */}
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-2 items-start">
          <div>{show.overview && <Overview text={show.overview} />}</div>
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

        {networks.length > 0 && (
          <React.Fragment>
            <ThemeSeparator genres={genres} />
            <SectionShell title="Networks" blurb="Where it aired" token="sapphire">
              <ProductionStrip items={networks} />
            </SectionShell>
          </React.Fragment>
        )}

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
