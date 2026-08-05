'use client';

import { PosterCard } from '@/components/screen/shared/PosterCard';
import { useLazyLoad, LazyLoadTrigger } from '@/hooks/useLazyLoad';
import { SCREEN_CONFIG } from '@/lib/screen/config';

interface PersonFilmographyProps {
  movies: PersonMovieCredit[];
  shows: PersonShowCredit[];
}

export function PersonFilmography({ movies, shows }: PersonFilmographyProps) {
  // Lazy loading movies on scroll with manual Continue trigger
  const {
    visibleItems: visibleMovies,
    hasMore: hasMoreMovies,
    isUnlocked: isMoviesUnlocked,
    sentinelRef: moviesSentinelRef,
    handleUnlock: handleMoviesUnlock,
    buttonLabel: moviesButtonLabel,
  } = useLazyLoad(movies, {
    initialLimit: SCREEN_CONFIG.pagination.personCredits,
    increment: SCREEN_CONFIG.pagination.personCredits,
    buttonLabel: 'Continue',
  });

  // Lazy loading TV shows on scroll with manual Continue trigger
  const {
    visibleItems: visibleShows,
    hasMore: hasMoreShows,
    isUnlocked: isShowsUnlocked,
    sentinelRef: showsSentinelRef,
    handleUnlock: handleShowsUnlock,
    buttonLabel: showsButtonLabel,
  } = useLazyLoad(shows, {
    initialLimit: SCREEN_CONFIG.pagination.personCredits,
    increment: SCREEN_CONFIG.pagination.personCredits,
    buttonLabel: 'Continue',
  });

  return (
    <div className="flex flex-col gap-12">
      {/* Filmography Section */}
      {movies.length > 0 && (
        <div className="border-t border-border/10 pt-8">
          <h2 className="text-lg uppercase tracking-widest text-sapphire font-bold mb-5 font-poppins">
            Movies In My Collection ({movies.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
            {visibleMovies.map((m, idx) => (
              <PosterCard
                key={`${m.tmdb_id}-${idx}`}
                tmdb_id={m.tmdb_id}
                href={`/collection/screen/m/${m.tmdb_id}`}
                title={m.title}
                subtitle={m.role ?? undefined}
                poster_path={m.poster_path}
                rating={m.my_rating}
                priority={idx < 6}
                meta={m.watched_at ? `Watched ${new Date(m.watched_at).toLocaleDateString('en-GB')}` : undefined}
              />
            ))}
            <LazyLoadTrigger
              hasMore={hasMoreMovies}
              isUnlocked={isMoviesUnlocked}
              sentinelRef={moviesSentinelRef}
              handleUnlock={handleMoviesUnlock}
              buttonLabel={moviesButtonLabel}
              loadingText="Loading more movies..."
            />
          </div>
        </div>
      )}

      {/* TV Shows Section */}
      {shows.length > 0 && (
        <div className="border-t border-border/10 pt-8">
          <h2 className="text-lg uppercase tracking-widest text-amethyst font-bold mb-5 font-poppins">
            TV Shows In My Collection ({shows.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
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
