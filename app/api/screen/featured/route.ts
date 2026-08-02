import { NextResponse } from 'next/server';
import { query } from '@/lib/screen/db';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    // 1. Fetch 24 actors (Acting department only, heavily female gender=1 favored, weighted by popularity)
    const actorsQuery = `
      SELECT 
        'person' AS type,
        tmdb_id,
        name,
        profile_path AS image_path,
        popularity::float AS rating,
        known_for_department AS release_date
      FROM public.people
      WHERE known_for_department = 'Acting' AND profile_path IS NOT NULL
      ORDER BY (CASE WHEN gender = 1 THEN 4.0 ELSE 1.0 END) * COALESCE(popularity, 1.0) * RANDOM() DESC
      LIMIT 24;
    `;

    // 2. Fetch 20 movies (RNG heavily favoring high user ratings)
    const moviesQuery = `
      SELECT 
        'movie' AS type,
        tmdb_id,
        title AS name,
        poster_path AS image_path,
        my_rating::float AS rating,
        release_date::text AS release_date
      FROM public.movies
      WHERE poster_path IS NOT NULL
      ORDER BY COALESCE(my_rating, 1.0) * COALESCE(my_rating, 1.0) * RANDOM() DESC
      LIMIT 20;
    `;

    // 3. Fetch 20 TV shows (RNG heavily favoring high user ratings)
    const showsQuery = `
      SELECT 
        'show' AS type,
        tmdb_id,
        name,
        poster_path AS image_path,
        my_rating::float AS rating,
        first_air_date::text AS release_date
      FROM public.shows
      WHERE poster_path IS NOT NULL
      ORDER BY COALESCE(my_rating, 1.0) * COALESCE(my_rating, 1.0) * RANDOM() DESC
      LIMIT 20;
    `;

    const [actorsRes, moviesRes, showsRes] = await Promise.all([query(actorsQuery), query(moviesQuery), query(showsQuery)]);

    return NextResponse.json({
      people: actorsRes.rows,
      movies: moviesRes.rows,
      shows: showsRes.rows,
    });
  } catch (error: any) {
    console.error('Featured API failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
