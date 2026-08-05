/**
 * Groups movie credits by tmdb_id to ensure exactly 1 entry per unique movie, combining their roles.
 */
export function groupUniqueMovies(movies: PersonMovieCredit[]): PersonMovieCredit[] {
  return Array.from(
    movies
      .reduce((acc, current) => {
        const existing = acc.get(current.tmdb_id);
        if (existing) {
          if (current.role && existing.role && !existing.role.includes(current.role)) {
            existing.role = `${existing.role} / ${current.role}`;
          } else if (current.role && !existing.role) {
            existing.role = current.role;
          }
          if (!existing.watched_at && current.watched_at) {
            existing.watched_at = current.watched_at;
          }
          if (!existing.my_rating && current.my_rating) {
            existing.my_rating = current.my_rating;
          }
        } else {
          acc.set(current.tmdb_id, { ...current });
        }
        return acc;
      }, new Map<number, PersonMovieCredit>())
      .values(),
  );
}

/**
 * Groups show credits by tmdb_id to ensure exactly 1 entry per unique show, combining their roles.
 */
export function groupUniqueShows(shows: PersonShowCredit[]): PersonShowCredit[] {
  return Array.from(
    shows
      .reduce((acc, current) => {
        const existing = acc.get(current.tmdb_id);
        if (existing) {
          if (current.role && existing.role && !existing.role.includes(current.role)) {
            existing.role = `${existing.role} / ${current.role}`;
          } else if (current.role && !existing.role) {
            existing.role = current.role;
          }
        } else {
          acc.set(current.tmdb_id, { ...current });
        }
        return acc;
      }, new Map<number, PersonShowCredit>())
      .values(),
  );
}
