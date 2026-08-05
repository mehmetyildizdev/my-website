'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Skeleton } from '@/components/shadcn/ui/skeleton';
import { ExternalLink, Star, Globe, Cake, Skull } from 'lucide-react';
import { getZodiac, getZodiacElementColor } from '@/lib/screen/utils/zodiac';
import { formatDate, genderLabel, getRatingToken } from '@/lib/screen/utils/format';
import { VAR } from '@/components/screen/slugs/detail/tokens';
import GenreChips from '@/components/screen/slugs/detail/GenreChips';
import GenreBackground from '@/components/screen/slugs/genre/GenreBackground';
import { PersonStatsGrid } from './PersonStatsGrid';

function getCountryName(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(iso.toUpperCase()) ?? iso;
  } catch {
    return iso;
  }
}

function GenderIcon({ gender }: { gender: number | null }) {
  if (gender === 1) {
    return (
      <svg
        className="w-3.5 h-3.5 text-amethyst shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="9" r="5" />
        <path d="M12 14v7M9 18h6" />
      </svg>
    );
  }
  if (gender === 2) {
    return (
      <svg
        className="w-3.5 h-3.5 text-sapphire shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="10" cy="14" r="5" />
        <path d="M13.5 10.5L20 4M15 4h5v5" />
      </svg>
    );
  }
  return null;
}

interface PersonHeaderProps {
  person: PersonDetail;
  age: number | null;
  moviesCount: number;
  showsCount: number;
}

export function PersonHeader({ person, age, moviesCount, showsCount }: PersonHeaderProps) {
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const zodiac = getZodiac(person.birth_date);
  const formattedDied = formatDate(person.deathday);

  const zodiacColorClass = zodiac ? getZodiacElementColor(zodiac.element) : 'text-foreground';

  const ratingToken = person.my_rating != null ? getRatingToken(Number(person.my_rating)) : null;
  const ratingColor = ratingToken ? VAR[ratingToken] : 'var(--accent)';

  const BIO_ITEMS = [
    person.country_iso && {
      id: 'country',
      icon: <Globe className="w-3.5 h-3.5 text-sapphire shrink-0" />,
      value: getCountryName(person.country_iso),
    },
    person.gender != null &&
      genderLabel(person.gender) !== 'unspecified' && {
        id: 'gender',
        icon: <GenderIcon gender={person.gender} />,
        value: genderLabel(person.gender),
      },
    zodiac && {
      id: 'zodiac',
      icon: <span className={`text-xs ${zodiacColorClass}`}>{zodiac.symbol}</span>,
      value: zodiac.name,
      isZodiac: true,
    },
    age != null && {
      id: 'age',
      icon: <Cake className="w-3.5 h-3.5 text-topaz shrink-0" />,
      value: `${age} yrs`,
    },
    formattedDied && {
      id: 'died',
      icon: <Skull className="w-3.5 h-3.5 text-ruby shrink-0" />,
      value: `Died ${formattedDied}`,
      isDied: true,
    },
  ].filter(Boolean) as { id: string; icon?: React.ReactNode; value: string; isZodiac?: boolean; isDied?: boolean }[];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/10 bg-card/30 p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl">
      {/* Genre-based motif & radial background layer */}
      {person.top_genres && person.top_genres.length > 0 && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
          <GenreBackground
            genres={person.top_genres.map((g) => ({ name: g }))}
            intensity={1}
            variant="container"
          />
        </div>
      )}

      {/* Main Header Content */}
      <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-stretch">
        {/* Profile Photo Container with embedded rating border badge */}
        <div className="relative mb-4 md:mb-0 mx-auto md:mx-0 shrink-0 self-start">
          <div
            className="relative w-36 sm:w-48 md:w-64 xl:w-72 aspect-2/3 rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-500 group bg-pearl"
            style={{
              borderColor: ratingColor,
              boxShadow: ratingToken ? `0 10px 30px -10px ${ratingColor}55` : undefined,
            }}
          >
            {person.profile_path ? (
              <>
                {!isProfileLoaded && <Skeleton className="absolute inset-0 rounded-2xl bg-accent/10 z-0" />}
                <Image
                  src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                  alt={person.name}
                  fill
                  unoptimized
                  priority
                  onLoad={() => setIsProfileLoaded(true)}
                  className={`object-cover transition-all duration-500 group-hover:scale-105 z-10 ${
                    isProfileLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-quicksilver text-sm">No Photo</div>
            )}
          </div>

          {/* Embedded Rating Badge on Border */}
          {person.my_rating != null && (
            <div
              className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1 rounded-full border shadow-xl backdrop-blur-md flex items-center justify-center gap-1.5 transition-transform duration-300 hover:scale-105"
              style={{
                borderColor: ratingColor,
                backgroundColor: 'rgba(20, 20, 20, 0.90)',
                boxShadow: `0 4px 15px ${ratingColor}44`,
              }}
            >
              <Star className="w-3.5 h-3.5 fill-current shrink-0" style={{ color: ratingColor }} />
              <span className="text-sm sm:text-base font-black tracking-tight leading-none" style={{ color: ratingColor }}>
                {Number(person.my_rating).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Profile Header Details & Stats Column */}
        <div className="flex-1 flex flex-col justify-between gap-4 w-full text-center md:text-left min-h-0">
          <div className="flex flex-col gap-3">
            {/* Department & External Links */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              {person.known_for_department && (
                <Badge
                  variant="ghost"
                  className="uppercase tracking-widest text-[10px] sm:text-xs font-bold border-accent/20 text-accent bg-accent/5 px-3 py-1 rounded-full"
                >
                  {person.known_for_department}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                {person.imdb_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-auto uppercase tracking-widest text-[10px] font-bold px-2.5 py-1 gap-1 rounded-full border border-border/10 bg-pearl/5 text-quicksilver hover:text-accent hover:border-accent/30 transition-all duration-300 cursor-pointer"
                  >
                    <a href={`https://www.imdb.com/name/${person.imdb_id}`} target="_blank" rel="noopener noreferrer">
                      IMDb <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
                {person.tmdb_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-auto uppercase tracking-widest text-[10px] font-bold px-2.5 py-1 gap-1 rounded-full border border-border/10 bg-pearl/5 text-quicksilver hover:text-accent hover:border-accent/30 transition-all duration-300 cursor-pointer"
                  >
                    <a href={`https://www.themoviedb.org/person/${person.tmdb_id}`} target="_blank" rel="noopener noreferrer">
                      TMDB <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="m-0">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-accent tracking-tight leading-tight"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {person.name}
              </h1>
            </div>

            {/* Bio Metadata Badges (Personal Info) */}
            {BIO_ITEMS.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                {BIO_ITEMS.map(({ id, icon, value, isZodiac, isDied }) => (
                  <Badge
                    key={id}
                    variant="subtle"
                    className="px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full border border-border/15 bg-pearl/80 dark:bg-pearl/20 backdrop-blur-md transition-all duration-300 shadow-xs flex items-center gap-1.5"
                  >
                    {icon}
                    <span className={isZodiac ? zodiacColorClass : isDied ? 'text-ruby font-semibold' : 'text-foreground'}>{value}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Collection & Metric Stats Group (Genres + Stats Grid aligned flush to bottom) */}
          <div className="mt-auto pt-2 flex flex-col gap-2.5 justify-center md:justify-start w-full">
            {/* Top Genres Chips (placed directly above stats section) */}
            {person.top_genres && person.top_genres.length > 0 && (
              <div className="flex items-center justify-center md:justify-start">
                <GenreChips genres={person.top_genres.map((g) => ({ name: g }))} />
              </div>
            )}

            {/* Metric Stats Grid */}
            <PersonStatsGrid person={person} moviesCount={moviesCount} showsCount={showsCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
