# Screen Sync Pipeline

Documents the order of operations, API calls, and data fetched at each step.

---

## Entry Point

**`index.ts`** — triggered by `GET /api/sync/trakt[?full=true][?limit=N]`

---

## Step 1 — Trakt History Pages

**File:** `index.ts`  
**API:** `GET https://api.trakt.tv/users/me/history?limit=N&page=P`  
**Auth:** Trakt OAuth access token (stored in `api_auth` table)

Fetched per page until either:
- an already-known `trakt_id` appears in `watch_history` *(Quick Sync fast-forward)*, or
- all pages are exhausted *(Full Sync)*

**Data extracted per item:**
- `type` — `movie` or `episode`
- `watched_at` — scrobble timestamp
- `id` — Trakt scrobble ID (used as `trakt_id` to deduplicate)
- `movie.ids.tmdb` / `show.ids.tmdb` / `episode.ids.tmdb`
- `episode.season`, `episode.number`, `episode.title`

---

## Step 2a — Movie Metadata

**File:** `movies.ts`  
**API:** `GET https://api.themoviedb.org/3/movie/{tmdb_id}?append_to_response=credits,external_ids`

Only called once per unique movie per sync run (deduped by `syncedMovies` Set).  
Skipped entirely if the `movies` row already exists in DB.

**Data extracted:**
| Field | Target |
|---|---|
| `imdb_id` | `movies.imdb_id` |
| `original_title`, `original_language` | `movies` |
| `release_date`, `runtime`, `vote_average` | `movies` |
| `poster_path`, `backdrop_path`, `overview` | `movies` |
| `belongs_to_collection` | `collections` table + `movies.collection_id` FK |
| `genres[]` | `genres` + `movie_genres` |
| `production_countries[]` | `countries` + `movie_countries` |
| `production_companies[]` | `production_companies` + `movie_production_companies` |
| `credits.crew[]` (filtered by `CREW_JOBS`) | `movie_crew` |
| `credits.cast[]` (profile_path required) | `movie_cast` with `cast_order` + `role` |

**Cast role classification** (`constants.ts → castRole()`):  
`order 0–3` → **lead** · `order 4–9` → **supporting** · `order 10+` → **minor**

---

## Step 2b — Show Metadata

**File:** `shows.ts`  
**APIs (parallel):**
1. `GET https://api.themoviedb.org/3/tv/{tmdb_id}?append_to_response=external_ids`
2. `GET https://api.themoviedb.org/3/tv/{tmdb_id}/aggregate_credits`

Only called once per unique show per sync run. Skipped if show row already exists.

**From `/tv/{id}`:**
| Field | Target |
|---|---|
| `imdb_id` (via `external_ids`) | `shows.imdb_id` |
| `original_name`, `original_language` | `shows` |
| `first_air_date`, `vote_average` | `shows` |
| `number_of_episodes`, `number_of_seasons` | `shows` |
| `poster_path`, `backdrop_path`, `overview` | `shows` |
| `genres[]` | `genres` + `show_genres` |
| `production_countries[]` | `countries` + `show_countries` |
| `production_companies[]` | `production_companies` + `show_production_companies` |
| `networks[]` | `networks` + `show_networks` |
| `seasons[]` | `seasons` (season_number, episode_count, air_date, poster) |
| `created_by[]` | injected as `Creator` job into `show_crew` |

**From `/tv/{id}/aggregate_credits`:**
| Field | Target |
|---|---|
| `crew[].jobs[].job` (filtered by `CREW_JOBS`) | `show_crew.job` |
| `crew[].jobs[].episode_count` | `show_crew.episode_count` |
| `cast[].roles[0].character` (profile_path required) | `show_cast.character` |
| `cast[].total_episode_count` | `show_cast.episode_count` |

> Aggregate credits give accurate per-episode counts across the full run of the show.  
> Season count is **not** stored — it is not available from TMDB without per-season API calls.

---

## Step 2c — People & Credits

**File:** `people.ts`  
**API:** `GET https://api.themoviedb.org/3/person/{tmdb_id}?append_to_response=external_ids`

Called in **parallel** only for people not yet in DB (identified by missing `imdb_id`).  
Inserts are done **sequentially, sorted by `tmdb_id`** to prevent deadlocks under parallel transactions.

**Data extracted:**
| Field | Target |
|---|---|
| `external_ids.imdb_id` | `people.imdb_id` |
| `popularity` | `people.popularity` |
| `birthday` | `people.birth_date` |
| `gender` | `people.gender` |
| `place_of_birth` | `person_countries` (parsed to ISO code) |

**Filtering rules:**
- **Cast** — must have `profile_path` (both movies and shows)
- **Crew** — no `profile_path` requirement; filtered only by job title (`CREW_JOBS` set)

---

## Step 2d — Episode Metadata

**File:** `history.ts`  
**API:** `GET https://api.themoviedb.org/3/tv/{show_id}/season/{n}/episode/{n}`

Called only for newly inserted episode rows.

**Data extracted:**
- `runtime` → `episodes.runtime`
- `air_date` → `episodes.air_date`

---

## Step 3 — Watch History

**File:** `history.ts`  
No external API call — inserts the `watch_history` row using data already in hand from Step 1.

---

## Step 4 — Trakt Ratings Bulk Sync

**File:** `ratings.ts`  
**APIs:**
1. `GET https://api.trakt.tv/users/me/ratings/movies`
2. `GET https://api.trakt.tv/users/me/ratings/shows`

Bulk-updates `movies.trakt_rating`, `shows.trakt_rating`, and `watch_history.rating` using PostgreSQL `UNNEST`.

---

## Crew Jobs Tracked (`CREW_JOBS` — `constants.ts`)

```
Director · Director of Photography
Original Story · Novel · Comic Book · Characters · Graphic Novel
Original Music Composer
Executive Producer · Co-Executive Producer
Screenplay · Writer
Production Design
Creator  (injected from created_by, not from crew array)
```

---

## File Map

```
lib/screen/sync/
  index.ts      Orchestrator — page loop, dedup, delegates to sub-modules
  movies.ts     Movie TMDB enrichment + credits
  shows.ts      Show TMDB enrichment (seasons, networks, aggregate credits)
  people.ts     People upsert + cast/crew credit row insertion
  history.ts    Episode metadata + watch_history recording
  ratings.ts    Trakt ratings bulk sync
  constants.ts  CREW_JOBS set, castRole(), COUNTRY_MAP, SyncStats type
```
