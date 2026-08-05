'use client';

import { groupUniqueMovies, groupUniqueShows } from '@/lib/screen/utils/unique';
import BackLink from '@/components/screen/slugs/detail/BackLink';
import GenreBackground from '@/components/screen/slugs/genre/GenreBackground';
import { PersonHeader } from './person/PersonHeader';
import { PersonFilmography } from './person/PersonFilmography';

interface PersonDetailProps {
  person: PersonDetail;
  movies: PersonMovieCredit[];
  shows: PersonShowCredit[];
  age: number | null;
}

export default function PersonDetail({ person, movies, shows, age }: PersonDetailProps) {
  // Group movies and shows using the reusable utility functions, and sort by rating first and date second
  const uniqueMovies = groupUniqueMovies(movies).sort((a, b) => {
    const ratingA = a.my_rating ?? -1;
    const ratingB = b.my_rating ?? -1;
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
    const relA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const relB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return relB - relA;
  });

  const topGenres = (person.top_genres ?? []).map((g) => ({ name: g }));

  return (
    <article id="person-detail" className="relative">
      <BackLink />

      <div className="flex flex-col gap-10 md:gap-14 pb-20">
        {/* Performer Header Info & Integrated Stats */}
        <div className="relative z-10">
          <PersonHeader
            person={person}
            age={age}
            moviesCount={uniqueMovies.length}
            showsCount={uniqueShows.length}
          />
        </div>

        {/* Page-wide ambient repeating genre background below header */}
        {topGenres.length > 0 && (
          <div className="absolute inset-0 top-96 z-0 pointer-events-none opacity-40">
            <GenreBackground genres={topGenres} intensity={0.2} variant="repeat" />
          </div>
        )}

        {/* Movies & TV Shows Filmography */}
        <div className="relative z-10">
          <PersonFilmography movies={uniqueMovies} shows={uniqueShows} />
        </div>
      </div>
    </article>
  );
}
