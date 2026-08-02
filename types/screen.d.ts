// types/screen.d.ts

// ============================================================================
// ─── PART 1: Backend Sync, Database, & Fetching Types (lib/screen/ & app/api/)
// ============================================================================

// --- TMDB API payloads & schemas (lib/screen/tmdb.ts & app/api/enrich/)
interface TMDBGenre {
  id: number;
  name: string;
}
interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}
interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
}
interface TMDBCastCredit {
  id: number;
  character: string;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
}
interface TMDBCrewCredit {
  id: number;
  department: string;
  job: string;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
}
interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}
interface TMDBCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}
interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}
interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  season_number: number;
  episode_count: number;
}
interface TMDBCreator {
  id: number;
  name: string;
  profile_path: string | null;
}

interface TMDBMovieDetail {
  id: number;
  imdb_id: string;
  title: string;
  original_title: string;
  release_date: string;
  original_language: string;
  runtime: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  genres: TMDBGenre[];
  production_countries: TMDBProductionCountry[];
  production_companies: TMDBProductionCompany[];
  belongs_to_collection: TMDBCollection | null;
  external_ids?: { imdb_id: string | null };
  credits: { cast: (TMDBCastCredit & { order: number })[]; crew: TMDBCrewCredit[] };
}

interface TMDBShowDetail {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  original_language: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  number_of_episodes: number;
  number_of_seasons: number;
  genres: TMDBGenre[];
  production_countries: TMDBProductionCountry[];
  production_companies: TMDBProductionCompany[];
  networks: TMDBNetwork[];
  seasons: TMDBSeason[];
  created_by: TMDBCreator[];
  external_ids: { imdb_id: string | null };
  credits: { cast: TMDBCastCredit[]; crew: TMDBCrewCredit[] };
}

interface TMDBEpisodeDetail {
  id: number;
  name: string;
  air_date: string;
  runtime: number;
  season_number: number;
  episode_number: number;
}

// ============================================================================
// ─── PART 2: Main Dashboard Components & Lists (components/screen/ & app/collection/screen/)
// ============================================================================

// --- Recently Watched List (components/screen/RecentWatchList.tsx)
interface RecentWatchItem {
  history_id: number;
  watched_at: string;
  my_rating: number | null;
  media_type: 'movie' | 'episode';
  title: string;
  episode_title: string | null;
  season_number: number | null;
  episode_number: number | null;
  poster_path: string | null;
  release_date: string | null;
  tmdb_id?: number;
  show_tmdb_id?: number;
}

// --- Top Rated Performers Grid (components/screen/top_rated_people/)
interface TopPerson {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  count: number;
  movie_count?: number;
  show_count?: number;
  episode_count?: number;
  unique_shows_count?: number;
  weighted_rating?: number | string;
  raw_rating?: number | string | null;
  // Set by analytics.actor_stats — used for "Most Exposed" mode.
  movie_runtime_min?: number;
  show_runtime_min?: number;
  total_runtime_min?: number;
  total_count?: number;
  // Role-aware breakdown from analytics.actor_stats (movies only).
  meaningful_movie_count?: number;
  lead_count?: number;
  supporting_count?: number;
  // From actor__ratings — overall personal rating for the actor
  my_rating?: number | string | null;
}

// ============================================================================
// ─── PART 3: Slugs Detail Components & Routes (components/screen/slugs/ & app/collection/screen/m/ s/ p/)
// ============================================================================

// --- Shared lightweight metadata shapes used by detail pages
interface DetailCountry {
  iso: string;
  name: string;
}
interface DetailCompany {
  tmdb_id: number;
  name: string;
  logo_path: string | null;
}
interface DetailNetwork {
  tmdb_id: number;
  name: string;
  logo_path: string | null;
}

// --- Movie Detail Slug (components/screen/slugs/MovieDetail.tsx)
interface MovieDetail {
  tmdb_id: number;
  imdb_id: string | null;
  title: string;
  original_title: string;
  original_language: string;
  release_date: string | null;
  runtime: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  tmdb_rating: number | null;
  my_rating: number | null;
  collection_id: number | null;
  collection_name: string | null;
  watch_count: number;
  last_watched_at: string | null;
  countries: DetailCountry[];
  companies: DetailCompany[];
}

interface MovieCastMember {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  character: string | null;
  cast_order: number;
}

interface MovieCrewMember {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  job: string;
}

// --- TV Show Detail Slug (components/screen/slugs/ShowDetail.tsx)
interface ShowDetail {
  tmdb_id: number;
  imdb_id: string | null;
  name: string;
  original_name: string;
  original_language: string;
  first_air_date: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  number_of_episodes: number | null;
  number_of_seasons: number | null;
  tmdb_rating: number | null;
  my_rating: number | null;
  episodes_watched: number;
  last_watched_at: string | null;
  countries: DetailCountry[];
  companies: DetailCompany[];
  networks: DetailNetwork[];
}

interface ShowCastMember {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  character: string | null;
  episode_count: number | null;
}

// Show crew shares the movie crew shape (tmdb_id, name, profile_path, job).
interface ShowCrewMember {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  job: string;
}

// --- Performer Detail Slug (components/screen/slugs/PersonDetail.tsx)
interface PersonDetail {
  tmdb_id: number;
  imdb_id: string | null;
  name: string;
  profile_path: string | null;
  known_for_department: string | null;
  popularity: number | null;
  birth_date: string | null;
  gender: number | null;
  deathday: string | null;
  movies_watched: number;
  avg_movie_rating: number | null;
  my_rating?: number | string | null;
}

interface PersonMovieCredit {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  my_rating: number | null;
  role: string | null;
  watched_at: string | null;
  user_rating: number | null;
}

interface PersonShowCredit {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  release_date: string | null;
  my_rating: number | null;
  role: string | null;
  watched_eps: number;
}

// ============================================================================
// ─── PART 4: Shared Component Data Types
// ============================================================================

type RankMode = 'top_rated' | 'most_watched' | 'most_exposed';
type Scope = 'overall' | 'movies' | 'shows';

interface TopActorsBuckets {
  overall: { top_rated: TopPerson[]; most_watched: TopPerson[]; most_exposed: TopPerson[] };
  movies: { top_rated: TopPerson[]; most_watched: TopPerson[]; most_exposed: TopPerson[] };
  shows: { top_rated: TopPerson[]; most_watched: TopPerson[]; most_exposed: TopPerson[] };
}

type CrewCategory = 'directing' | 'production' | 'screenwriting' | 'cinematography' | 'composition' | 'design' | 'source_material';
type CrewBuckets = Record<CrewCategory, TopPerson[]>;

// ============================================================================
// ─── PART 5: Global Analytics & Visual Data Models
// ============================================================================

type DirectorData = {
  name: string;
  tmdb_id: number;
  movie_count: number;
  avg_rating: string | number;
  best_movie: string;
  best_rating: string | number;
};

type DecadeData = {
  decade: number;
  count: number;
  avg_rating: string | number;
  total_runtime_hours: number;
};

type WorkEntry = {
  title: string;
  collection: string | null;
};

type CollabPair = {
  person_a_name: string;
  person_b_name: string;
  shared_titles: number;
  collection_movie_count: number;
  standalone_movie_count: number;
  avg_rating: string | number;
  works: WorkEntry[];
  category_a?: string;
  category_b?: string;
};

type GenderData = {
  gender: string;
  department: string;
  count: number;
  avg_rating: string | number;
};

type CrewRow = TopPerson & { category: string };

type YearlyGenreData = {
  name: string;
  year: number;
  avg_rating: string | number;
  count: number;
};

type GenreRating = {
  name: string;
  total_count: number;
  avg_rating: string | number;
  avg_movie_rating: string | number | null;
  avg_show_rating: string | number | null;
  movie_count: number;
  show_count: number;
};

type GenreScatterPoint = {
  name: string;
  total_count: number;
  avg_rating: number;
  avg_movie_rating: number | null;
  avg_show_rating: number | null;
  movie_count: number;
  show_count: number;
};

type GenreData = {
  name: string;
  movie_count: number;
  show_count: number;
  total_count: number;
};

type RatingItem = {
  media_type: 'movie' | 'show';
  title: string;
  tmdb_id: number;
  my_rating: number;
  tmdb_rating: string | number;
  release_year: number | null;
  genres: string[];
};

type CompanyData = {
  tmdb_id: number;
  name: string;
  logo_path: string | null;
  country_iso: string | null;
  avg_rating: string | number;
  movie_count: number;
};

type NetworkData = {
  tmdb_id: number;
  name: string;
  logo_path: string | null;
  country_iso: string | null;
  avg_rating: string | number;
  show_count: number;
};

type RankedGridItem = {
  id: number;
  name: string;
  logo_path: string | null;
  country_iso: string | null;
  avg_rating: number;
  count: number;
  countLabel: string;
};

type CountryData = {
  country_code: string;
  country_name: string;
  avg_rating: string | number;
  movie_count: number;
  show_count: number;
};

type GeoFeature = {
  type: 'Feature';
  id: string;
  properties: { name: string };
  geometry: any;
};

interface CastEntry {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  character: string | null;
  cast_order?: number | null;
  episode_count?: number | null;
}

type DepartmentKey = 'directing' | 'screenwriting' | 'cinematography' | 'composition' | 'design' | 'production' | 'source';

interface DepartmentDef {
  key: DepartmentKey;
  title: string;
  blurb: string;
  token: 'sapphire' | 'emerald' | 'amethyst' | 'topaz' | 'gold' | 'ruby' | 'quicksilver';
  jobs: string[];
}

interface CrewLike {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  job: string;
}

interface GroupedPerson {
  tmdb_id: number;
  name: string;
  profile_path: string | null;
  jobs: string[];
}

interface DepartmentGroup {
  def: DepartmentDef;
  people: GroupedPerson[];
}

interface Fact {
  label: string;
  value: import('react').ReactNode;
  glyph?: string;
  token?: Token;
  wide?: boolean;
}

interface ProductionEntity {
  tmdb_id: number;
  name: string;
  logo_path: string | null;
}

type Token = 'sapphire' | 'emerald' | 'amethyst' | 'topaz' | 'gold' | 'ruby' | 'quicksilver' | 'silver';

type Anchor = 'tl' | 'tr' | 'bl' | 'br' | 'c';

interface GenreTheme {
  token: 'ruby' | 'sapphire' | 'emerald' | 'amethyst' | 'topaz';
  Motif: import('react').ComponentType<any>;
  anchor: Anchor;
  label: string;
  glowPos: string;
  glowSpread: string;
}
