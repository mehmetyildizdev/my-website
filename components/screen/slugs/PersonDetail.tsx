'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PosterCard } from '@/components/screen/shared/PosterCard';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardTitle } from '@/components/shadcn/ui/card';
import { Skeleton } from '@/components/shadcn/ui/skeleton';
import { ExternalLink } from 'lucide-react';
import { getZodiac, getZodiacElementColor } from '@/lib/screen/utils/zodiac';
import { formatDate, genderLabel, getPopularityColor } from '@/lib/screen/utils/format';
import { groupUniqueMovies, groupUniqueShows } from '@/lib/screen/utils/unique';
import { useLazyLoad, LazyLoadTrigger } from '@/hooks/useLazyLoad';
import { SCREEN_CONFIG } from '@/lib/screen/config';
import BackLink from '@/components/screen/slugs/detail/BackLink';

interface PersonDetailProps {
  person: PersonDetail;
  movies: PersonMovieCredit[];
  shows: PersonShowCredit[];
  age: number | null;
}

export default function PersonDetail({ person, movies, shows, age }: PersonDetailProps) {
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const zodiac = getZodiac(person.birth_date);
  const formattedBorn = formatDate(person.birth_date);
  const formattedDied = formatDate(person.deathday);

  const zodiacColorClass = zodiac ? getZodiacElementColor(zodiac.element) : 'text-foreground';

  // Group movies and shows using the reusable utility functions, and sort by rating first and date second
  const uniqueMovies = groupUniqueMovies(movies).sort((a, b) => {
    const ratingA = a.user_rating ?? -1;
    const ratingB = b.user_rating ?? -1;
    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }
    const dateA = a.watched_at ? new Date(a.watched_at).getTime() : 0;
    const dateB = b.watched_at ? new Date(b.watched_at).getTime() : 0;
    if (dateA !== dateB) {
      return dateB - dateA;
    }
    const relA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const relB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return relB - relA;
  });

  const uniqueShows = groupUniqueShows(shows).sort((a, b) => {
    const ratingA = a.my_rating ?? -1;
    const ratingB = b.my_rating ?? -1;
    if (ratingA !== ratingB) {
      return ratingB - ratingA;
    }
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateB - dateA;
  });

  // Lazy loading movies on scroll with manual Continue trigger
  const {
    visibleItems: visibleMovies,
    hasMore,
    isUnlocked,
    sentinelRef,
    handleUnlock,
    buttonLabel,
  } = useLazyLoad(uniqueMovies, {
    initialLimit: SCREEN_CONFIG.pagination.personCredits,
    increment: SCREEN_CONFIG.pagination.personCredits,
    buttonLabel: 'Load More',
  });

  // Lazy loading TV shows on scroll with manual Continue trigger
  const {
    visibleItems: visibleShows,
    hasMore: hasMoreShows,
    isUnlocked: isShowsUnlocked,
    sentinelRef: showsSentinelRef,
    handleUnlock: handleShowsUnlock,
    buttonLabel: showsButtonLabel,
  } = useLazyLoad(uniqueShows, {
    initialLimit: SCREEN_CONFIG.pagination.personCredits,
    increment: SCREEN_CONFIG.pagination.personCredits,
    buttonLabel: 'Continue',
  });

  const BIO_ITEMS = [
    person.gender != null &&
      genderLabel(person.gender) !== 'unspecified' && {
        label: 'Gender',
        value: genderLabel(person.gender),
      },
    formattedBorn && {
      label: 'Born',
      value: formattedBorn,
    },
    zodiac && {
      label: 'Zodiac',
      value: zodiac.name,
      isZodiac: true,
    },
    age != null && {
      label: 'Age',
      value: person.deathday ? `${age} (deceased)` : `${age}`,
    },
    formattedDied && {
      label: 'Died',
      value: formattedDied,
      isDied: true,
    },
  ].filter(Boolean) as { label: string; value: string; isZodiac?: boolean; isDied?: boolean }[];

  const popularityScore = person.popularity ? Number(person.popularity) : 0;
  const popColor = getPopularityColor(popularityScore);

  return (
    <div id="person-detail" className="pb-20 relative">
      <div className="mb-6 md:hidden animate-in fade-in duration-300">
        <BackLink />
      </div>
      {/* Responsive Grid Header Panel */}
      <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] md:grid-cols-[auto_1fr] md:grid-rows-[auto_auto] gap-x-6 gap-y-6 md:gap-x-12 md:gap-y-8 mb-16 pt-0">
        {/* Photo Container */}
        <div className="col-start-1 col-end-2 row-start-1 row-end-2 md:row-end-3 self-start">
          <div className="relative w-40 sm:w-56 md:w-72 xl:w-80 shrink-0 aspect-2/3 rounded-xl overflow-hidden shadow-2xl border border-border-glint/50 group transition-all duration-300 hover:border-accent/40 hover:shadow-accent/33 bg-pearl">
            {person.profile_path ? (
              <>
                {!isProfileLoaded && (
                  <Skeleton className="absolute inset-0 rounded-xl bg-accent/10 z-0" />
                )}
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
              <div className="w-full h-full flex items-center justify-center text-quicksilver text-sm">
                No Photo
              </div>
            )}
          </div>
        </div>

        {/* Details Card */}
        <div className="col-start-2 col-end-3 row-start-1 row-end-2 md:col-start-2 md:row-start-1 self-stretch md:self-center">
          <Card className="bg-transparent border-none shadow-none p-0 flex flex-col justify-between h-full md:h-auto md:justify-start md:gap-3 py-1 md:py-0">
            <div className="flex flex-col gap-1.5 md:gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {person.known_for_department && (
                  <Badge
                    variant="ghost"
                    className="uppercase tracking-widest text-[9px] lg:text-sm font-bold border-accent/20 text-accent bg-accent/5 px-3 py-1"
                  >
                    {person.known_for_department}
                  </Badge>
                )}
                {/* External Profile Links */}
                <div className="hidden lg:flex items-center gap-2">
                  {person.imdb_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-auto uppercase tracking-widest text-[9px] lg:text-sm font-bold px-3 py-1 gap-1 rounded-full border border-border/10 bg-pearl/5 text-quicksilver hover:text-accent hover:border-accent/30 transition-all duration-300 cursor-pointer"
                    >
                      <a
                        href={`https://www.imdb.com/name/${person.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        IMDb <ExternalLink className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      </a>
                    </Button>
                  )}
                  {person.tmdb_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-auto uppercase tracking-widest text-[9px] lg:text-sm font-bold px-3 py-1 gap-1 rounded-full border border-border/10 bg-pearl/5 text-quicksilver hover:text-accent hover:border-accent/30 transition-all duration-300 cursor-pointer"
                    >
                      <a
                        href={`https://www.themoviedb.org/person/${person.tmdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        TMDB <ExternalLink className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <CardTitle className="m-0">
                <h1
                  className="mt-2 md:mt-4 text-3xl sm:text-4xl md:text-5xl xl:text-7xl font-black text-accent tracking-tight leading-tight"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  {person.name}
                </h1>
              </CardTitle>
            </div>

            {/* Bio items in unified flex badge grid */}
            {BIO_ITEMS.length > 0 && (
              <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-1.5 md:gap-2.5 mt-2">
                {BIO_ITEMS.map(({ label, value, isZodiac, isDied }) => (
                  <Badge
                    key={label}
                    variant="subtle"
                    className="px-2 py-0.5 sm:px-3.5 sm:py-1 text-[9px] sm:text-xs font-semibold rounded-full border border-border/10 transition-all duration-300 hover:bg-border/5"
                  >
                    <span className="text-quicksilver mr-1 font-normal">{label}:</span>
                    <span
                      className={
                        isZodiac
                          ? zodiacColorClass
                          : isDied
                            ? 'text-ruby font-semibold'
                            : 'text-foreground'
                      }
                    >
                      {value}
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Metas and Ratings */}
        <div className="col-start-1 col-end-3 row-start-2 row-end-3 md:col-start-2 md:row-start-2 self-start md:self-end flex flex-row flex-nowrap gap-1.5 sm:gap-3 w-full md:w-auto md:flex-wrap md:gap-3">
          <div className="flex-1 md:flex-initial px-0.5 py-1.5 sm:px-3 sm:py-2.5 md:px-4 md:py-2 bg-pearl/30 border border-border/10 rounded-xl sm:rounded-2xl text-center min-w-0 md:min-w-[95px] backdrop-blur-xs transition-all duration-300 hover:bg-pearl/50 flex flex-col justify-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-accent truncate">
              {uniqueMovies.length}
            </p>
            <p className="text-[10px] text-quicksilver uppercase tracking-wider font-bold mt-1 leading-tight">
              Movies<span className="block lg:inline lg:ml-1">Watched</span>
            </p>
          </div>
          {uniqueShows.length > 0 && (
            <div className="flex-1 md:flex-initial px-0.5 py-1.5 sm:px-3 sm:py-2.5 md:px-4 md:py-2 bg-pearl/30 border border-border/10 rounded-xl sm:rounded-2xl text-center min-w-0 md:min-w-[95px] backdrop-blur-xs transition-all duration-300 hover:bg-pearl/50 flex flex-col justify-center">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-accent truncate">
                {uniqueShows.length}
              </p>
              <p className="text-[10px] text-quicksilver uppercase tracking-wider font-bold mt-1 leading-tight">
                Shows<span className="block lg:inline lg:ml-1">Watched</span>
              </p>
            </div>
          )}
          {person.my_rating != null && (
            <div className="flex-1 md:flex-initial px-0.5 py-1.5 sm:px-3 sm:py-2.5 md:px-4 md:py-2 bg-pearl/30 border border-border/10 rounded-xl sm:rounded-2xl text-center min-w-0 md:min-w-[95px] backdrop-blur-xs transition-all duration-300 hover:bg-pearl/50 flex flex-col justify-center">
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gold truncate">
                ★ {Number(person.my_rating).toFixed(2)}
              </p>
              <p className="text-[10px] text-quicksilver uppercase tracking-wider font-bold mt-1 leading-tight font-poppins">
                My<span className="block lg:inline lg:ml-1">Rating</span>
              </p>
            </div>
          )}
          {person.popularity != null && (
            <div className="flex-1 md:flex-initial px-0.5 py-1.5 sm:px-3 sm:py-2.5 md:px-4 md:py-2 bg-pearl/30 border border-border/10 rounded-xl sm:rounded-2xl text-center min-w-0 md:min-w-[95px] backdrop-blur-xs transition-all duration-300 hover:bg-pearl/50 flex flex-col justify-center">
              <p className={`text-lg sm:text-xl md:text-2xl font-bold ${popColor} truncate`}>
                {Number(person.popularity).toFixed(0)}
              </p>
              <p className="text-[10px] text-quicksilver uppercase tracking-wider font-bold mt-1 leading-tight">
                Popularity
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filmography Section */}
      {uniqueMovies.length > 0 && (
        <div className="mb-12 border-t border-border/10 pt-8">
          <h2 className="text-lg uppercase tracking-widest text-sapphire font-bold mb-5 font-poppins">
            Movies In My Collection ({uniqueMovies.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
            {visibleMovies.map((m, idx) => (
              <PosterCard
                key={`${m.tmdb_id}-${idx}`}
                tmdb_id={m.tmdb_id}
                href={`/collection/screen/m/${m.tmdb_id}`}
                title={m.title}
                subtitle={m.role ?? undefined}
                poster_path={m.poster_path}
                rating={m.user_rating}
                priority={idx < 6}
                meta={
                  m.watched_at
                    ? `Watched ${new Date(m.watched_at).toLocaleDateString('en-GB')}`
                    : undefined
                }
              />
            ))}
            <LazyLoadTrigger
              hasMore={hasMore}
              isUnlocked={isUnlocked}
              sentinelRef={sentinelRef}
              handleUnlock={handleUnlock}
              buttonLabel={buttonLabel}
              loadingText="Loading more movies..."
            />
          </div>
        </div>
      )}

      {/* TV Shows Section */}
      {uniqueShows.length > 0 && (
        <div className="border-t border-border/10 pt-8">
          <h2 className="text-lg uppercase tracking-widest text-amethyst font-bold mb-5 font-poppins">
            TV Shows In My Collection ({uniqueShows.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
            {visibleShows.map((s, idx) => (
              <PosterCard
                key={`${s.tmdb_id}-${idx}`}
                tmdb_id={s.tmdb_id}
                href={`/collection/screen/s/${s.tmdb_id}`}
                title={s.title}
                subtitle={s.role ?? undefined}
                poster_path={s.poster_path}
                rating={s.my_rating}
                priority={idx < 6}
                meta={s.watched_eps ? `${s.watched_eps} eps watched` : undefined}
              />
            ))}
            <LazyLoadTrigger
              hasMore={hasMoreShows}
              isUnlocked={isShowsUnlocked}
              sentinelRef={showsSentinelRef}
              handleUnlock={handleShowsUnlock}
              buttonLabel={showsButtonLabel}
              loadingText="Loading more shows..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
