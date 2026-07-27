// components/screen/slugs/detail/departments.ts
// Groups raw crew `job` strings into the curated departments shown on detail
// pages. Mapping is built from the exact jobs persisted by the sync pipeline
// (see lib/screen/sync/constants.ts → CREW_JOBS) plus common fallbacks so the
// grouping still behaves if the stored job set grows later.
// Order here = render order on the page.
export const DEPARTMENTS: DepartmentDef[] = [
  {
    key: 'directing',
    title: 'Directing',
    blurb: 'The vision behind the camera',
    token: 'gold',
    jobs: ['Director', 'Creator', 'Co-Director'],
  },
  {
    key: 'screenwriting',
    title: 'Screenwriting',
    blurb: 'Words that shaped the story',
    token: 'sapphire',
    jobs: ['Screenplay', 'Writer', 'Story', 'Teleplay'],
  },
  {
    key: 'cinematography',
    title: 'Cinematography',
    blurb: 'Light, lens and framing',
    token: 'emerald',
    jobs: ['Director of Photography', 'Cinematography'],
  },
  {
    key: 'composition',
    title: 'Composition',
    blurb: 'The score and its sound',
    token: 'amethyst',
    jobs: ['Original Music Composer', 'Music', 'Composer'],
  },
  {
    key: 'design',
    title: 'Design',
    blurb: 'The world made tangible',
    token: 'ruby',
    jobs: ['Production Design', 'Art Direction', 'Costume Design'],
  },
  {
    key: 'production',
    title: 'Production',
    blurb: 'Who made it happen',
    token: 'topaz',
    jobs: ['Executive Producer', 'Co-Executive Producer', 'Producer', 'Co-Producer'],
  },
  {
    key: 'source',
    title: 'Source Material',
    blurb: 'Where it all began',
    token: 'quicksilver',
    jobs: [
      'Original Story',
      'Novel',
      'Comic Book',
      'Characters',
      'Graphic Novel',
      'Book',
      'Short Story',
    ],
  },
];

const JOB_TO_DEPT = new Map<string, DepartmentKey>();
for (const d of DEPARTMENTS) for (const job of d.jobs) JOB_TO_DEPT.set(job, d.key);

/**
 * Collapse a flat crew list into ordered department groups. A person appearing
 * under multiple jobs in the same department is merged into one card listing
 * each job. People can legitimately appear in more than one department.
 */
export function groupCrewByDepartment(crew: CrewLike[]): DepartmentGroup[] {
  const buckets = new Map<DepartmentKey, Map<number, GroupedPerson>>();

  for (const c of crew) {
    const key = JOB_TO_DEPT.get(c.job);
    if (!key) continue;
    if (!buckets.has(key)) buckets.set(key, new Map());
    const bucket = buckets.get(key)!;
    const existing = bucket.get(c.tmdb_id);
    if (existing) {
      if (!existing.jobs.includes(c.job)) existing.jobs.push(c.job);
    } else {
      bucket.set(c.tmdb_id, {
        tmdb_id: c.tmdb_id,
        name: c.name,
        profile_path: c.profile_path,
        jobs: [c.job],
      });
    }
  }

  return DEPARTMENTS.map((def) => ({
    def,
    people: Array.from(buckets.get(def.key)?.values() ?? []),
  })).filter((g) => g.people.length > 0);
}
