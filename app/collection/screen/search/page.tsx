'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/shadcn/ui/skeleton';

import PeopleSection, { DBSearchPerson } from '@/components/screen/search/PeopleSection';
import MoviesSection, { DBSearchMovie } from '@/components/screen/search/MoviesSection';
import ShowsSection, { DBSearchShow } from '@/components/screen/search/ShowsSection';
import GlobalSection, { TMDBResult } from '@/components/screen/search/GlobalSection';

interface DBSearchItem {
  type: 'movie' | 'show' | 'person';
  tmdb_id: number;
  name: string;
  extra_name: string | null;
  image_path: string | null;
  rating: number | null;
  release_date: string | null;
}

interface DBSearchResults {
  movies: DBSearchItem[];
  shows: DBSearchItem[];
  people: DBSearchItem[];
}

interface TMDBSearchResults {
  results?: TMDBResult[];
}

function SearchSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [dbQuery, setDbQuery] = useState('');
  const [tmdbQuery, setTmdbQuery] = useState('');

  const [dbResults, setDbResults] = useState<DBSearchResults>({
    movies: [],
    shows: [],
    people: [],
  });
  const [rawTmdbResults, setRawTmdbResults] = useState<TMDBResult[]>([]);

  // Featured Recommendations state
  const [featuredData, setFeaturedData] = useState<{ people: any[]; movies: any[]; shows: any[] }>({
    people: [],
    movies: [],
    shows: [],
  });
  const [featuredLoading, setFeaturedLoading] = useState(false);

  // Fetch featured recommendations when query is empty
  useEffect(() => {
    if (!query.trim()) {
      setFeaturedLoading(true);
      fetch('/api/screen/featured')
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) {
            setFeaturedData(data);
          }
        })
        .catch(console.error)
        .finally(() => setFeaturedLoading(false));
    }
  }, [query]);

  // Compute tmdbResults dynamically (excluding items that match local database ids)
  const tmdbResults = useMemo(() => {
    const dbIds = new Set([
      ...dbResults.movies.map((m) => m.tmdb_id),
      ...dbResults.shows.map((s) => s.tmdb_id),
      ...dbResults.people.map((p) => p.tmdb_id),
    ]);
    return rawTmdbResults.filter((item) => !dbIds.has(item.id));
  }, [rawTmdbResults, dbResults]);

  const [dbLoading, setDbLoading] = useState(false);
  const [tmdbLoading, setTmdbLoading] = useState(false);

  // Double Debouncing setup
  useEffect(() => {
    if (!query.trim()) {
      setDbQuery('');
      setDbResults({ movies: [], shows: [], people: [] });
      return;
    }
    setDbLoading(true);
    const handler = setTimeout(() => {
      setDbQuery(query);
    }, 200); // 200ms delay for fast DB search
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setTmdbQuery('');
      setRawTmdbResults([]);
      return;
    }
    setTmdbLoading(true);
    const handler = setTimeout(() => {
      setTmdbQuery(query);
    }, 2000); // 2 seconds delay for global TMDB search
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch DB results from D1 Edge Worker
  useEffect(() => {
    if (!dbQuery) {
      setDbLoading(false);
      return;
    }

    const workerUrl = process.env.NEXT_PUBLIC_SEARCH_WORKER_URL || 'http://localhost:8787';
    fetch(`${workerUrl}/db?q=${encodeURIComponent(dbQuery)}`)
      .then((r) => r.json())
      .then((data: any) => {
        if (data && !data.error) {
          setDbResults(data);
        }
      })
      .catch(console.error)
      .finally(() => setDbLoading(false));
  }, [dbQuery]);

  // Fetch TMDB results from Edge Worker
  useEffect(() => {
    if (!tmdbQuery) {
      setTmdbLoading(false);
      return;
    }

    const workerUrl = process.env.NEXT_PUBLIC_SEARCH_WORKER_URL || 'http://localhost:8787';
    fetch(`${workerUrl}/tmdb?q=${encodeURIComponent(tmdbQuery)}`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then((data: TMDBSearchResults) => {
        if (data && data.results) {
          setRawTmdbResults(data.results.slice(0, 15)); // Limit to top 15 results
        } else {
          setRawTmdbResults([]);
        }
      })
      .catch((err) => {
        console.error('TMDB fetch error:', err);
        setRawTmdbResults([]); // Reset results to clear stale data on error/429
      })
      .finally(() => setTmdbLoading(false));
  }, [tmdbQuery]);

  const hasDbResults =
    dbResults.movies.length > 0 || dbResults.shows.length > 0 || dbResults.people.length > 0;

  // TMDB is waiting if query exists but tmdbQuery has not caught up yet OR tmdb API is loading
  const isTmdbWaiting = (query.trim() && query !== tmdbQuery) || tmdbLoading;

  // Map database results to their specific component interfaces
  const people: DBSearchPerson[] = dbResults.people.map((p) => ({
    tmdb_id: p.tmdb_id,
    name: p.name,
    image_path: p.image_path,
    release_date: p.release_date, // known_for_department
  }));

  const movies: DBSearchMovie[] = dbResults.movies.map((m) => ({
    tmdb_id: m.tmdb_id,
    name: m.name,
    image_path: m.image_path,
    rating: m.rating,
    release_date: m.release_date,
  }));

  const shows: DBSearchShow[] = dbResults.shows.map((s) => ({
    tmdb_id: s.tmdb_id,
    name: s.name,
    image_path: s.image_path,
    rating: s.rating,
    release_date: s.release_date,
  }));

  return (
    <div className="space-y-10">
      {!query.trim() ? (
        /* ── Featured Recommendations (Empty query) ─────────────── */
        <div className="space-y-10">
          <div className="space-y-1" style={{ fontFamily: 'var(--font-poppins)' }}>
            <h2 className="text-2xl font-bold tracking-tight text-accent">
              Featured Recommendations
            </h2>
            <p className="text-xs sm:text-sm text-quicksilver/90 leading-relaxed">
              Curated selection of random movies, TV shows, and actors from my database.
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Featured People (Actors only, heavily female favored) */}
            <PeopleSection loading={featuredLoading} people={featuredData.people} />

            {/* Section 2: Featured Movies (RNG favored by rating) */}
            <MoviesSection loading={featuredLoading} movies={featuredData.movies} />

            {/* Section 3: Featured Shows (RNG favored by rating) */}
            <ShowsSection loading={featuredLoading} shows={featuredData.shows} />
          </div>
        </div>
      ) : (
        /* ── Active Search Results ──────────────────────────────── */
        <>
          {/* ── Page Header ────────────────────────────────────────── */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-accent font-poppins flex items-center gap-2">
              <span>Search Results for</span>
              <span className="text-gold">"{query}"</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Instant edge searching through D1 local index and delayed global TMDB catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* ── Left Column: Local DB Results ────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section 1: People */}
              <PeopleSection loading={dbLoading} people={people} />

              {/* Section 2: Movies */}
              <MoviesSection loading={dbLoading} movies={movies} />

              {/* Section 3: Shows */}
              <ShowsSection loading={dbLoading} shows={shows} />

              {!dbLoading && !hasDbResults && (
                <div className="flex flex-col items-center justify-center py-16 bg-pearl/10 border border-border/10 rounded-2xl text-center p-4">
                  <span className="text-4xl">🗄️</span>
                  <h3 className="font-semibold text-sm text-foreground mt-2">No Local Matches</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    No movies, shows, or people match "{query}" in my local watch database.
                  </p>
                </div>
              )}
            </div>

            {/* ── Right Column: Global TMDB Catalog ────────────────────── */}
            <GlobalSection
              loading={tmdbLoading}
              waiting={isTmdbWaiting}
              results={tmdbResults}
              query={query}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
