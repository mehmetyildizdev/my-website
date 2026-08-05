'use client';

import { Film, Tv, Clock, Flame, Crown, Award } from 'lucide-react';
import { getPopularityColor } from '@/lib/screen/utils/format';
import { StatCard } from './StatCard';

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const hours = Math.floor(min / 60);
  return `${hours}h`;
}

interface PersonStatsGridProps {
  person: PersonDetail;
  moviesCount: number;
  showsCount: number;
}

export function PersonStatsGrid({ person, moviesCount, showsCount }: PersonStatsGridProps) {
  const popularityScore = person.popularity ? Number(person.popularity) : 0;
  const popColor = getPopularityColor(popularityScore);

  const row1 = [
    {
      id: 'movies',
      icon: <Film className="w-4 h-4" />,
      value: moviesCount,
      label: 'Movies',
      colorClass: 'text-sapphire',
    },
    {
      id: 'shows',
      icon: <Tv className="w-4 h-4" />,
      value: showsCount,
      label: 'Shows',
      colorClass: 'text-amethyst',
    },
    {
      id: 'time',
      icon: <Clock className="w-4 h-4" />,
      value: person.total_runtime_min ? formatMinutes(person.total_runtime_min) : '0m',
      label: 'Time',
      colorClass: 'text-sapphire',
    },
  ];

  const row2 = [
    {
      id: 'popularity',
      icon: <Flame className="w-4 h-4" />,
      value: person.popularity != null ? Number(person.popularity).toFixed(0) : '0',
      label: 'Popularity',
      colorClass: popColor,
    },
    {
      id: 'lead',
      icon: <Crown className="w-4 h-4" />,
      value: person.lead_movie_count ?? 0,
      label: 'Lead',
      colorClass: 'text-gold',
    },
    {
      id: 'support',
      icon: <Award className="w-4 h-4" />,
      value: person.supporting_movie_count ?? 0,
      label: 'Support',
      colorClass: 'text-emerald',
    },
  ];

  return (
    <div className="flex flex-col gap-2 sm:gap-2.5 w-full max-w-xl mt-3 md:mt-4">
      {/* Row 1: Movies, Shows, Time */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
        {row1.map((stat) => (
          <StatCard key={stat.id} icon={stat.icon} value={stat.value} label={stat.label} colorClass={stat.colorClass} />
        ))}
      </div>

      {/* Row 2: Popularity, Lead, Support */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
        {row2.map((stat) => (
          <StatCard key={stat.id} icon={stat.icon} value={stat.value} label={stat.label} colorClass={stat.colorClass} />
        ))}
      </div>
    </div>
  );
}
