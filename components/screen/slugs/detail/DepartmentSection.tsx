// components/screen/slugs/detail/DepartmentSection.tsx
// Renders one creative department (Directing, Screenwriting, …) as a section of
// PersonCards. Pure presentation — grouping logic lives in departments.ts.

import SectionShell from './SectionShell';
import PersonCard from './PersonCard';

interface DepartmentSectionProps {
  group: DepartmentGroup;
}

export default function DepartmentSection({ group }: DepartmentSectionProps) {
  const { def, people } = group;
  return (
    <SectionShell
      title={def.title}
      blurb={def.blurb}
      token={def.token}
      aside={`${people.length} ${people.length === 1 ? 'person' : 'people'}`}
    >
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-5">
        {people.map((p) => (
          <PersonCard
            key={p.tmdb_id}
            tmdb_id={p.tmdb_id}
            name={p.name}
            profile_path={p.profile_path}
            role={p.jobs.join(' · ')}
            token={def.token}
            variant="portrait"
          />
        ))}
      </div>
    </SectionShell>
  );
}
