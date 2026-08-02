# Screen Sync & Metadata Pipeline

Overview of data ingestion, TMDB enrichment workflows, database schemas, and maintenance scripts for movies, TV shows, people, and watch history.

---

## 1. Data Ingestion (MemoStream)

**Source:** MemoStream Scrobbler / API  
**Target:** `watch_history` table (`tmdb_id`, `media_type`, `media_key`, `watched_at`, `my_rating`, `episode_tmdb_id`)

Scrobbles from MemoStream arrive containing TMDB media identifiers, timestamps, and personal ratings. When a new scrobble arrives, missing metadata is enriched into PostgreSQL.

---

## 2. Enrichment & Update Pipeline

### Step 2a — Movie Metadata & Credits

**APIs:** `GET /movie/{tmdb_id}?append_to_response=credits,external_ids`

| Extracted Field                                                                                                                                  | Target Database Table                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `title`, `original_title`, `original_language`, `release_date`, `runtime`, `vote_average`, `overview`, `poster_path`, `backdrop_path`, `imdb_id` | `movies`                                              |
| `belongs_to_collection`                                                                                                                          | `collections` + `movies.collection_id` FK             |
| `genres[]`                                                                                                                                       | `genres` + `movie_genres`                             |
| `production_countries[]`                                                                                                                         | `countries` + `movie_countries`                       |
| `production_companies[]`                                                                                                                         | `production_companies` + `movie_production_companies` |
| `credits.crew[]` (filtered by `CREW_JOBS`)                                                                                                       | `people` + `movie_crew`                               |
| `credits.cast[]` (requires `profile_path`)                                                                                                       | `people` + `movie_cast` (`cast_order`, `role`)        |

- **Cast Roles (`constants.ts → castRole()`):** `order 0–3` → **lead** · `order 4–9` → **supporting** · `order 10+` → **minor**

---

### Step 2b — Show, Season & Episode Metadata

**APIs:**

1. `GET /tv/{tmdb_id}?append_to_response=external_ids`
2. `GET /tv/{tmdb_id}/aggregate_credits`
3. `GET /tv/{tmdb_id}/season/{season_number}`

| Extracted Field                                                                                                                                                                  | Target Database Table                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `name`, `original_name`, `original_language`, `first_air_date`, `number_of_episodes`, `number_of_seasons`, `vote_average`, `poster_path`, `backdrop_path`, `overview`, `imdb_id` | `shows`                                                                  |
| `genres[]`                                                                                                                                                                       | `genres` + `show_genres`                                                 |
| `production_countries[]`                                                                                                                                                         | `countries` + `show_countries`                                           |
| `production_companies[]`                                                                                                                                                         | `production_companies` + `show_production_companies`                     |
| `networks[]`                                                                                                                                                                     | `networks` + `show_networks`                                             |
| `seasons[]`                                                                                                                                                                      | `seasons` (`season_number`, `episode_count`, `air_date`, `poster_path`)  |
| `episodes[]`                                                                                                                                                                     | `episodes` (`episode_number`, `name`, `air_date`, `runtime`, `overview`) |
| `aggregate_credits.crew[]` + `created_by[]`                                                                                                                                      | `people` + `show_crew` (`job`, `episode_count`)                          |
| `aggregate_credits.cast[]`                                                                                                                                                       | `people` + `show_cast` (`character`, `episode_count`)                    |

---

### Step 2c — People & Birthplace Parsing

**APIs:** `GET /person/{tmdb_id}?append_to_response=external_ids`

- **Bulk Inserts (`people.ts`):** People rows, cast credits, and crew credits are inserted in bulk `UNNEST` SQL queries sorted by `tmdb_id` to prevent PostgreSQL deadlocks.
- **Birthplace Parser (`lib/screen/utils/birthplace.ts`):** `parseBirthplaceToCountry()` parses `place_of_birth` text into ISO 3166-1 alpha-2 country codes for `person_countries`.
  - Supports diacritics stripping (NFD normalization) and alias matching for historical/colonial names (e.g. _British Nigeria_ → `NG`, _Soviet Union_ → `RU`, _West Germany_ → `DE`, _Ottoman Empire_ → `TR`) and native spellings (e.g. _Türkiye_, _Deutschland_, _España_, _Brasil_, _Magyarország_, _Polska_, _Srbija_, _Éire_).

---

## 3. Tracked Crew Jobs (`CREW_JOBS`)

```text
Director · Director of Photography
Original Story · Novel · Comic Book · Characters · Graphic Novel
Original Music Composer
Executive Producer · Co-Executive Producer
Screenplay · Writer
Production Design
Creator (injected from created_by array)
```

---

## 4. Dedicated Repair Scripts

- **Cast & Crew Repair (`scripts/screen/db/fix_cast_links.ts`)**: High-speed script that re-links missing `movie_cast`, `movie_crew`, `show_cast`, and `show_crew` in parallel batches (~28.5 req/sec) without fetching any season or episode data (~1 min runtime).
- **Person Country Repair (`scripts/screen/db/fix_person_countries.ts`)**: Parses stored `place_of_birth` records instantly (0 API calls) and backfills missing TMDB birthplaces into `person_countries`.
- **Sequence Reset (`scripts/screen/db/fix_sequence.ts`)**: Resets PostgreSQL primary key serial sequences.

---

## 5. Sync Module File Structure

```text
lib/screen/
├── sync/
│   ├── index.ts        # Orchestrator & scrobble ingestion pipeline
│   ├── movies.ts       # Movie metadata & credits sync
│   ├── shows.ts        # TV Show metadata & aggregate credits sync
│   ├── people.ts       # Bulk UNNEST upsert for people, cast & crew
│   ├── history.ts      # Episode metadata & watch_history recording
│   └── constants.ts   # CREW_JOBS whitelist, castRole(), SyncStats
└── utils/
    └── birthplace.ts   # Robust birthplace text → ISO country parser
```
