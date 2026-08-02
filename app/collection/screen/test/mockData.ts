// app/collection/screen/test/mockData.ts
// Static mock fixtures so the detail layouts + genre backgrounds can be previewed
// without a database connection. Profile paths intentionally include some `null`
// entries to exercise the "no photo → not linked" rule.

export const MOCK_GENRES_MULTI = [{ name: 'Science Fiction' }, { name: 'Action' }, { name: 'Thriller' }, { name: 'Drama' }];

function person(id: number, name: string, hasPhoto: boolean, character: string | null, job: string, order?: number, eps?: number) {
  return {
    tmdb_id: id,
    name,
    profile_path: hasPhoto ? `/mock${id}.jpg` : null,
    character,
    job,
    cast_order: order,
    episode_count: eps,
  };
}

export const MOCK_CAST = [
  person(101, 'Ava Castillo', true, 'Dr. Mara Vance', '', 0),
  person(102, 'Idris Whitlock', true, 'Commander Reyes', '', 1),
  person(103, 'Lena Hofmann', true, 'Kira', '', 2),
  person(104, 'Tomas Akello', false, 'The Architect', '', 3), // no photo → not linked
  person(105, 'Priya Nair', true, 'Engineer Sol', '', 4),
  person(106, 'Marcus Bell', true, 'Pilot', '', 5),
  person(107, 'Yuki Tanaka', false, 'Analyst', '', 6), // no photo
  person(108, 'Sofia Marchetti', true, 'Captain Oduya', '', 7),
  person(109, 'Daniel Pierce', true, 'Lieutenant', '', 8),
  person(110, 'Grace Okonkwo', true, 'Medic', '', 9),
  person(111, 'Hassan Reza', true, 'Technician', '', 10),
  person(112, 'Elena Volkov', true, 'Navigator', '', 11),
];

export const MOCK_CREW = [
  person(201, 'Denise Caron', true, null, 'Director'),
  person(202, 'Robert Yang', true, null, 'Screenplay'),
  person(203, 'Robert Yang', true, null, 'Writer'),
  person(204, 'Amelia Frost', false, null, 'Director of Photography'), // no photo
  person(205, 'Hiro Watanabe', true, null, 'Original Music Composer'),
  person(206, 'Clara Bennett', true, null, 'Production Design'),
  person(207, 'George Hale', true, null, 'Executive Producer'),
  person(208, 'Naomi Stein', true, null, 'Co-Executive Producer'),
  person(209, 'Philip K. Marlowe', false, null, 'Novel'), // no photo → not linked
  person(210, 'Susan Reed', true, null, 'Original Story'),
];

export const MOCK_COMPANIES = [
  { tmdb_id: 1, name: 'Orbital Pictures', logo_path: null },
  { tmdb_id: 2, name: 'Meridian Studios', logo_path: null },
  { tmdb_id: 3, name: 'Nightfall Films', logo_path: null },
];

export const MOCK_NETWORKS = [
  { tmdb_id: 10, name: 'Helix+', logo_path: null },
  { tmdb_id: 11, name: 'Nova Network', logo_path: null },
];

export const MOCK_COUNTRIES = [
  { iso: 'US', name: 'United States' },
  { iso: 'GB', name: 'United Kingdom' },
];

export const MOCK_MOVIE = {
  tmdb_id: 99999,
  imdb_id: 'tt0000000',
  title: 'Echoes of the Void',
  original_title: 'Echoes of the Void',
  original_language: 'en',
  release_date: '2024-10-18',
  runtime: 142,
  poster_path: null,
  backdrop_path: null,
  overview:
    'When a deep-space relay station picks up a signal that predates the universe itself, a fractured crew must decide whether to answer it. As paranoia spreads and time begins to fold, the line between memory and machine dissolves into something far stranger.',
  tmdb_rating: 7.8,
  my_rating: 9,
  collection_id: 4242,
  collection_name: 'The Void Saga',
  watch_count: 3,
  last_watched_at: '2025-12-02',
  countries: MOCK_COUNTRIES,
  companies: MOCK_COMPANIES,
};

export const MOCK_SHOW = {
  tmdb_id: 88888,
  imdb_id: 'tt1111111',
  name: 'Tidewatch',
  original_name: 'Tidewatch',
  original_language: 'en',
  first_air_date: '2021-03-05',
  poster_path: null,
  backdrop_path: null,
  overview:
    'In a coastal town where the sea keeps its secrets, a returning detective unravels decades of buried truths. Each tide brings something new ashore — and not all of it is dead.',
  number_of_episodes: 24,
  number_of_seasons: 3,
  tmdb_rating: 8.2,
  my_rating: 8,
  episodes_watched: 18,
  last_watched_at: '2026-01-14',
  countries: MOCK_COUNTRIES,
  companies: MOCK_COMPANIES,
  networks: MOCK_NETWORKS,
};

/** Curated genre combinations for the background explorer. */
export const GENRE_COMBOS: { label: string; genres: { name: string }[] }[] = [
  { label: 'Sci-Fi', genres: [{ name: 'Science Fiction' }] },
  { label: 'Horror', genres: [{ name: 'Horror' }] },
  { label: 'Romance', genres: [{ name: 'Romance' }] },
  { label: 'Western', genres: [{ name: 'Western' }] },
  { label: 'Sci-Fi + Action', genres: [{ name: 'Science Fiction' }, { name: 'Action' }] },
  { label: 'Horror + Mystery + Thriller', genres: [{ name: 'Horror' }, { name: 'Mystery' }, { name: 'Thriller' }] },
  { label: 'Fantasy + Adventure + Family', genres: [{ name: 'Fantasy' }, { name: 'Adventure' }, { name: 'Family' }] },
  { label: 'Drama + Romance + Music', genres: [{ name: 'Drama' }, { name: 'Romance' }, { name: 'Music' }] },
  { label: 'Crime + Thriller + Drama', genres: [{ name: 'Crime' }, { name: 'Thriller' }, { name: 'Drama' }] },
  { label: 'War + History + Documentary', genres: [{ name: 'War' }, { name: 'History' }, { name: 'Documentary' }] },
  { label: 'Comedy + Family + Animation', genres: [{ name: 'Comedy' }, { name: 'Family' }, { name: 'Animation' }] },
  { label: 'Quad: SciFi+Action+Thriller+Drama', genres: MOCK_GENRES_MULTI },
];
