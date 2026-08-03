import { cachedQuery, loadQuery } from '@/lib/screen/db';
import { getGenreColor } from '@/components/screen/slugs/genre/genreThemes';
import { Database, Search } from 'lucide-react';
import MaintenanceActions from './MaintenanceActions';

type CoreTableRow = {
  table_name: string;
  total_rows: number;
  has_my_rating: number;
  has_tmdb_rating: number;
  has_poster: number;
  has_backdrop: number;
  has_overview: number;
  has_collection: number;
  has_imdb_id: number;
  has_release_date: number;
  has_runtime: number;
  has_seasons: number;
  has_episodes: number;
  has_popularity: number;
  has_gender: number;
  has_deathday: number;
};

type RelationRow = {
  relation: string;
  total_rows: number;
  movie_entries: number;
  episode_entries: number;
  has_rating: number;
  extra_stat_1: number;
  extra_stat_2: number;
};

type SampleRow = {
  entity_type: string;
  data: Record<string, unknown>;
};

type GenreCoverageRow = {
  id: number;
  name: string;
  movie_count: number;
  show_count: number;
};

// Schema relationship map for visual reference
const SCHEMA_RELATIONS = [
  { from: 'movies', to: 'watch_history', label: 'tmdb_id → tmdb_id (movie)' },
  { from: 'episodes', to: 'watch_history', label: 'tmdb_id → tmdb_id (episode)' },
  { from: 'shows', to: 'episodes', label: 'tmdb_id → show_tmdb_id' },
  { from: 'shows', to: 'seasons', label: 'tmdb_id → show_tmdb_id' },
  { from: 'movies', to: 'movie_cast', label: 'tmdb_id → movie_tmdb_id' },
  { from: 'movies', to: 'movie_crew', label: 'tmdb_id → movie_tmdb_id' },
  { from: 'shows', to: 'show_cast', label: 'tmdb_id → show_tmdb_id' },
  { from: 'shows', to: 'show_crew', label: 'tmdb_id → show_tmdb_id' },
  { from: 'people', to: 'movie_cast', label: 'tmdb_id → person_tmdb_id' },
  { from: 'people', to: 'movie_crew', label: 'tmdb_id → person_tmdb_id' },
  { from: 'people', to: 'show_cast', label: 'tmdb_id → person_tmdb_id' },
  { from: 'people', to: 'show_crew', label: 'tmdb_id → person_tmdb_id' },
  { from: 'movies', to: 'movie_genres', label: 'tmdb_id → movie_tmdb_id' },
  { from: 'shows', to: 'show_genres', label: 'tmdb_id → show_tmdb_id' },
  { from: 'genres', to: 'movie_genres', label: 'id → genre_id' },
  { from: 'genres', to: 'show_genres', label: 'id → genre_id' },
  { from: 'movies', to: 'movie_countries', label: 'tmdb_id → movie_tmdb_id' },
  { from: 'shows', to: 'show_countries', label: 'tmdb_id → show_tmdb_id' },
  { from: 'countries', to: 'movie_countries', label: 'iso → country_iso' },
  { from: 'countries', to: 'show_countries', label: 'iso → country_iso' },
  { from: 'countries', to: 'person_countries', label: 'iso → country_iso' },
  { from: 'people', to: 'person_countries', label: 'tmdb_id → person_tmdb_id' },
  { from: 'collections', to: 'movies', label: 'tmdb_id → collection_id' },
  { from: 'collections', to: 'collection_movies', label: 'tmdb_id → collection_tmdb_id' },
  { from: 'networks', to: 'show_networks', label: 'tmdb_id → network_tmdb_id' },
  { from: 'shows', to: 'show_networks', label: 'tmdb_id → show_tmdb_id' },
  {
    from: 'production_companies',
    to: 'movie_production_companies',
    label: 'tmdb_id → company_tmdb_id',
  },
  {
    from: 'production_companies',
    to: 'show_production_companies',
    label: 'tmdb_id → company_tmdb_id',
  },
  { from: 'movies', to: 'movie_production_companies', label: 'tmdb_id → movie_tmdb_id' },
  { from: 'shows', to: 'show_production_companies', label: 'tmdb_id → show_tmdb_id' },
];

function CoverageBar({ filled, total, label }: { filled: number; total: number; label: string }) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-border/30 overflow-hidden">
        <div className="h-full rounded-full bg-accent/70 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-20 shrink-0 text-right tabular-nums text-muted-foreground">
        {filled.toLocaleString()}/{total.toLocaleString()}
      </span>
      <span className="w-12 shrink-0 text-right tabular-nums font-medium">{pct}%</span>
    </div>
  );
}

function RelationLabel({ name }: { name: string }) {
  const colors: Record<string, string> = {
    movies: 'bg-sapphire/20 text-sapphire border-sapphire/30',
    shows: 'bg-amethyst/20 text-amethyst border-amethyst/30',
    episodes: 'bg-topaz/20 text-topaz border-topaz/30',
    people: 'bg-gold/20 text-gold border-gold/30',
    genres: 'bg-emerald/20 text-emerald border-emerald/30',
    countries: 'bg-quicksilver/20 text-quicksilver border-quicksilver/30',
    collections: 'bg-ruby/20 text-ruby border-ruby/30',
    networks: 'bg-sapphire/20 text-sapphire border-sapphire/30',
    production_companies: 'bg-topaz/20 text-topaz border-topaz/30',
  };
  const color = colors[name] || 'bg-muted text-muted-foreground border-border/30';
  return <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-mono ${color}`}>{name}</span>;
}

function SampleTable({ entityType, data }: { entityType: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  const typeColors: Record<string, string> = {
    movie: 'border-sapphire/30',
    show: 'border-amethyst/30',
    person: 'border-gold/30',
  };
  const borderColor = typeColors[entityType] || 'border-border/20';
  const displayName = (data.title || data.name || '') as string;

  return (
    <div className={`rounded-lg border ${borderColor} bg-pearl/20 p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm capitalize">{entityType} Sample</h4>
        {displayName && (
          <span
            className="text-[10px] bg-accent/15 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium max-w-37.5 truncate"
            title={displayName}
          >
            {displayName}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/20 text-left text-muted-foreground">
              <th className="py-1.5 pr-3 font-medium w-40">Column</th>
              <th className="py-1.5 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key} className="border-b border-border/5 hover:bg-pearl/30">
                <td className="py-1.5 pr-3 font-mono text-muted-foreground">{key}</td>
                <td className="py-1.5 font-mono break-all">
                  {value === null ? (
                    <span className="text-muted-foreground/50 italic">null</span>
                  ) : typeof value === 'object' ? (
                    <span className="text-accent/80">{JSON.stringify(value)}</span>
                  ) : (
                    <span>{String(value)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function DbOverview() {
  const [coreRes, relRes, sampleRes, genreCoverageRes] = await Promise.all([
    cachedQuery(loadQuery('stats/db_overview.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('stats/db_relations.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('stats/db_sample_rows.sql'), [], ['screen-db']),
    cachedQuery(loadQuery('stats/genre_coverage.sql'), [], ['screen-db']),
  ]);

  const coreTables = coreRes.rows as CoreTableRow[];
  const relations = relRes.rows as RelationRow[];
  const samples = sampleRes.rows as SampleRow[];
  const genreCoverage = genreCoverageRes.rows as GenreCoverageRow[];

  return (
    <div className="space-y-8">
      <div className="border-b border-border/10 pb-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-accent">Database Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Live snapshot of all tables, data coverage, and relationships. This is made to identify gaps and plan charts.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-16 text-quicksilver text-sm sm:text-base leading-relaxed border-l-2 border-gold/30 pl-4 py-1"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground/90 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-gold" />
              <span>Neon PostgreSQL Database</span>
            </h4>
            <ul className="text-quicksilver/90 text-[13px] sm:text-[14px] leading-relaxed space-y-2 list-disc pl-4">
              <li>
                <strong>Primary Datastore:</strong> Primary source of truth for up-to-date watch history, title ratings, and metadata
                records for website caching.
              </li>
              <li>
                <strong>Serverless PostgreSQL:</strong> High-performance relational backend hosting custom materialized views and stats
                tables to feed the website's frontend and api.
              </li>
              <li>
                <strong>Nightly Sync Pipeline:</strong> Aggregated view data and stats tables recompiled automatically via GitHub Actions.
              </li>
              <li>
                <strong>Granular Metrics:</strong> Calculated by personal ratings of titles throughout the years to determine affinity based
                stats to use in rankings and charts.
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground/90 flex items-center gap-1.5">
              <Search className="h-4 w-4 text-gold" />
              <span>Cloudflare D1 & Edge Workers</span>
            </h4>
            <ul className="text-quicksilver/90 text-[13px] sm:text-[14px] leading-relaxed space-y-2 list-disc pl-4">
              <li>
                <strong>Instant Search Index:</strong> SQLite database pre-compiled offline for edge distribution, executing ultra-fast
                queries, completely bypassing cold starts that would normally happen in Neon.
              </li>
              <li>
                <strong>Secure Edge Proxy:</strong> Serves search endpoints and proxies TMDB requests, protecting private API credentials on
                the server side.
              </li>
              <li>
                <strong>Abuse Protection:</strong> Implemented edge rate limiting restricts client searches to a maximum of 3 requests per
                10 seconds.
              </li>
              <li>
                <strong>Live Scrobbling API:</strong> Receives real-time playback payloads at minute-based intervals or event triggers from
                my streaming platform <i>MemoStream</i> to power the live Now-Playing state.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Database Maintenance</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Control buttons to use after synchronisation between my streaming application and the database, they work locally as the
              hosting provider Vercel does not let runtime of functions more than 10 seconds.
            </p>
            <p className="px-4 text-xs text-muted-foreground mt-1">
              Update buttons make a full scan of all attributed tables to update data to the latest state from TMDB.
            </p>
            <p className="px-4 text-xs text-muted-foreground mt-1">
              Update from history button is used for finding the records that are added to history table but failed on updating canonical
              tables when MemoStream sends scrobble loads. It runs targeted update for those missing movie and show titles.
            </p>
            <p className="px-4 text-xs text-muted-foreground mt-1">
              Enrich buttons fill the empty fields of the tables using the data from TMDB one by one as the appended endpoints for updating
              from TMDB does not provide some data that I use in this website.
            </p>
          </div>
          <MaintenanceActions isAuthenticated={true} syncSecret={process.env.MY_API_PHRASE || ''} />
        </div>
      </div>

      {/* ── Sample Rows ────────────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sample Rows</h3>
        <p className="text-xs text-muted-foreground mb-3">One row from each core table showing all column names.</p>
        <div className="grid gap-4 lg:grid-cols-3">
          {samples.map((s) => (
            <SampleTable key={s.entity_type} entityType={s.entity_type} data={s.data} />
          ))}
        </div>
      </div>

      {/* ── Core ProductionEntity Tables ─────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Coverage</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {coreTables.map((t) => (
            <div key={t.table_name} className="rounded-lg border border-border/20 bg-pearl/20 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-base capitalize">{t.table_name}</h4>
                  {(t.table_name === 'movies' || t.table_name === 'shows') &&
                    (t.total_rows - t.has_my_rating > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold border border-gold/20">
                        ⚠️ {t.total_rows - t.has_my_rating} Unrated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald border border-emerald/20">
                        ✓ All Rated
                      </span>
                    ))}
                </div>
                <span className="text-sm tabular-nums font-mono text-muted-foreground">{t.total_rows.toLocaleString()} rows</span>
              </div>
              <div className="space-y-1.5">
                {(t.table_name === 'movies' || t.table_name === 'shows') && (
                  <CoverageBar filled={t.has_my_rating} total={t.total_rows} label="My Rating" />
                )}
                {t.has_tmdb_rating > 0 && <CoverageBar filled={t.has_tmdb_rating} total={t.total_rows} label="TMDB Rating" />}
                {t.has_poster > 0 && <CoverageBar filled={t.has_poster} total={t.total_rows} label="Poster" />}
                {t.has_backdrop > 0 && <CoverageBar filled={t.has_backdrop} total={t.total_rows} label="Backdrop" />}
                {t.has_overview > 0 && <CoverageBar filled={t.has_overview} total={t.total_rows} label="Overview" />}
                {t.has_imdb_id > 0 && <CoverageBar filled={t.has_imdb_id} total={t.total_rows} label="IMDB ID" />}
                {t.has_release_date > 0 && (
                  <CoverageBar filled={t.has_release_date} total={t.total_rows} label={t.table_name === 'people' ? 'Birth Date' : 'Date'} />
                )}
                {t.has_runtime > 0 && <CoverageBar filled={t.has_runtime} total={t.total_rows} label="Runtime" />}
                {t.has_collection > 0 && <CoverageBar filled={t.has_collection} total={t.total_rows} label="Collection" />}
                {t.has_seasons > 0 && <CoverageBar filled={t.has_seasons} total={t.total_rows} label="Seasons" />}
                {t.has_episodes > 0 && <CoverageBar filled={t.has_episodes} total={t.total_rows} label="Episodes" />}
                {t.has_popularity > 0 && <CoverageBar filled={t.has_popularity} total={t.total_rows} label="Popularity" />}
                {t.has_gender > 0 && <CoverageBar filled={t.has_gender} total={t.total_rows} label="Gender" />}
                {t.has_deathday > 0 && <CoverageBar filled={t.has_deathday} total={t.total_rows} label="Deceased Date" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Relational Tables ──────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Relational Tables</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/20 text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Table</th>
                <th className="py-2 pr-4 font-medium text-right">Rows</th>
                <th className="py-2 pr-4 font-medium text-right">Unique Left</th>
                <th className="py-2 pr-4 font-medium text-right">Unique Right</th>
                <th className="py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {relations.map((r) => (
                <tr key={r.relation} className="border-b border-border/10 hover:bg-pearl/30">
                  <td className="py-2 pr-4 font-mono text-xs">{r.relation}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.total_rows.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.movie_entries > 0 ? r.movie_entries.toLocaleString() : '—'}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.episode_entries > 0 ? r.episode_entries.toLocaleString() : '—'}</td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {r.relation === 'watch_history' && `${r.movie_entries} movies, ${r.episode_entries} episodes, ${r.has_rating} rated`}
                    {r.relation === 'movie_cast' && `${r.has_rating} lead, ${r.extra_stat_1} supporting, ${r.extra_stat_2} minor`}
                    {r.relation === 'movie_crew' && `${r.has_rating} directors`}
                    {r.relation === 'show_cast' && `${r.has_rating} with ep count`}
                    {r.relation === 'show_crew' && `${r.has_rating} directors/creators`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Relationship Map ───────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Relationship Map</h3>
        <p className="text-xs text-muted-foreground mb-3">How core entities connect through junction/relational tables.</p>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {SCHEMA_RELATIONS.map((rel, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-1.5 rounded border border-border/15 bg-pearl/10 px-2.5 py-1.5 text-xs min-w-0"
            >
              <RelationLabel name={rel.from} />
              <span className="text-muted-foreground">→</span>
              <RelationLabel name={rel.to} />
              <span className="text-[10px] text-muted-foreground/70 font-mono break-all">{rel.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Genre Data Coverage ─────────────────────────────────────── */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Genre Data Coverage</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Number of movie and show entries associated with each genre. Combined TMDB genres (like "Sci-Fi & Fantasy") are flagged with a
          warning if they contain records.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border/20 bg-pearl/20">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/20 text-left text-muted-foreground bg-pearl/10">
                <th className="py-2.5 px-4 font-medium">Genre ID</th>
                <th className="py-2.5 px-4 font-medium">Genre Name</th>
                <th className="py-2.5 px-4 font-medium text-right">Movies</th>
                <th className="py-2.5 px-4 font-medium text-right">Shows</th>
                <th className="py-2.5 px-4 font-medium text-right">Total Watches</th>
                <th className="py-2.5 px-4 font-medium">Distribution</th>
                <th className="py-2.5 px-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const sortedGenres = [...genreCoverage].sort((a, b) => b.movie_count + b.show_count - (a.movie_count + a.show_count));
                const totalMovies = Number(coreTables.find((t) => t.table_name === 'movies')?.total_rows ?? 0);
                const totalShows = Number(coreTables.find((t) => t.table_name === 'shows')?.total_rows ?? 0);
                const grandTotal = totalMovies + totalShows || 1;

                return sortedGenres.map((g) => {
                  const isUnified = ['Sci-Fi & Fantasy', 'Action & Adventure', 'War & Politics'].includes(g.name);
                  const hasArtifacts = isUnified && (g.movie_count > 0 || g.show_count > 0);
                  const totalWatches = Number(g.movie_count) + Number(g.show_count);
                  const pct = Math.round((totalWatches / grandTotal) * 100);
                  const genreColor = getGenreColor(g.name);

                  return (
                    <tr key={g.id} className="border-b border-border/10 hover:bg-pearl/30 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">{g.id}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: `color-mix(in oklch, ${genreColor}, transparent 88%)`,
                            color: genreColor,
                            border: `1px solid color-mix(in oklch, ${genreColor}, transparent 75%)`,
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: genreColor }} />
                          {g.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-muted-foreground">{g.movie_count.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-muted-foreground">{g.show_count.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-semibold tabular-nums">{totalWatches.toLocaleString()}</td>
                      <td className="py-2.5 px-4 min-w-35">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-border/20 overflow-hidden shrink-0">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: genreColor }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {hasArtifacts ? (
                          <span className="inline-block rounded bg-ruby/20 text-ruby border border-ruby/30 px-1.5 py-0.5 text-[10px] font-medium">
                            Unified (Has Records)
                          </span>
                        ) : isUnified ? (
                          <span className="inline-block rounded bg-quicksilver/20 text-quicksilver border border-quicksilver/30 px-1.5 py-0.5 text-[10px] font-medium">
                            Unified (Cleaned)
                          </span>
                        ) : (
                          <span className="inline-block rounded bg-emerald/20 text-emerald border border-emerald/30 px-1.5 py-0.5 text-[10px] font-medium">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
