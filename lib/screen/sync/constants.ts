// lib/screen/sync/constants.ts
// Shared constants, helpers and the SyncStats type used across all sync sub-modules.

/** Crew jobs we persist. No profile_path requirement – these are story/creative roles. */
export const CREW_JOBS = new Set([
  'Director',
  'Director of Photography',
  'Original Story',
  'Novel',
  'Comic Book',
  'Characters',
  'Graphic Novel',
  'Original Music Composer',
  'Executive Producer',
  'Co-Executive Producer',
  'Screenplay',
  'Writer',
  'Production Design',
  'Creator', // injected from created_by array
]);

/** top 4 cast order → lead, next 6 → supporting, rest → minor */
export function castRole(order: number): 'lead' | 'supporting' | 'minor' {
  if (order <= 3) return 'lead';
  if (order <= 9) return 'supporting';
  return 'minor';
}

/** Best-effort mapping of place_of_birth text → ISO 3166-1 alpha-2 */
export const COUNTRY_MAP: Record<string, string> = {
  USA: 'US',
  'U.S.A.': 'US',
  'United States': 'US',
  UK: 'GB',
  'U.K.': 'GB',
  'United Kingdom': 'GB',
};

export interface SyncStats {
  pages_processed: number;
  history_records_checked: number;
  new_movies_added: number;
  new_shows_added: number;
  new_episodes_added: number;
  new_people_added: number;
  people_updated: number;
  new_cast_added: number;
  new_crew_added: number;
  new_history_added: number;
  errors: string[];
}

/**
 * Tuning options for the sync pipeline.
 * bulkMode: true → initial-fill optimisations (faster batches, skip episode enrichment)
 */
export interface SyncOptions {
  /** Use aggressive TMDB batching and skip episode runtime/airdate enrichment. */
  bulkMode?: boolean;
}

export const DEFAULT_OPTIONS: SyncOptions = { bulkMode: false };

export function makeSyncStats(): SyncStats {
  return {
    pages_processed: 0,
    history_records_checked: 0,
    new_movies_added: 0,
    new_shows_added: 0,
    new_episodes_added: 0,
    new_people_added: 0,
    people_updated: 0,
    new_cast_added: 0,
    new_crew_added: 0,
    new_history_added: 0,
    errors: [],
  };
}

export function printStats(stats: SyncStats) {
  console.log(`--- Sync Complete ---`);
  console.log(`Pages Processed:      ${stats.pages_processed}`);
  console.log(`Records Checked:      ${stats.history_records_checked}`);
  console.log(`New Movies:           ${stats.new_movies_added}`);
  console.log(`New Shows:            ${stats.new_shows_added}`);
  console.log(`New Episodes:         ${stats.new_episodes_added}`);
  console.log(`New People:           ${stats.new_people_added}`);
  console.log(`New Cast Credits:     ${stats.new_cast_added}`);
  console.log(`New Crew Credits:     ${stats.new_crew_added}`);
  console.log(`New History Records:  ${stats.new_history_added}`);
  console.log(`Errors:               ${stats.errors.length}`);
  if (stats.errors.length > 0) {
    console.log('Error Details:');
    stats.errors.forEach((e) => console.log(`  - ${e}`));
  }
}
