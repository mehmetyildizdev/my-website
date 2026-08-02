// components/screen/slugs/detail/RatingCluster.tsx
// Compact dual-rating display (personal rating + TMDB) rendered as paired
// "score coins" with clockwise filling SVG circular progress indicators.
import { getRatingTextColorClass } from '@/lib/screen/utils/format';

interface RatingCoinProps {
  value: number;
  label: string;
  colorClass: string;
  href?: string;
}

interface RatingClusterProps {
  myRating?: number | null;
  tmdbRating?: number | null;
  tmdbId?: number | null;
  mediaType?: 'movie' | 'tv';
}

function RatingCoin({ value, label, colorClass, href }: RatingCoinProps) {
  const numValue = Number(value);
  const radius = 20;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius; // ~125.66
  const pct = (Math.max(0, Math.min(numValue, 10)) / 10) * 100;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-card/50 backdrop-blur-sm">
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48">
          {/* Background circle */}
          <circle className="text-border/10 stroke-current" strokeWidth={strokeWidth} fill="transparent" r={radius} cx="24" cy="24" />
          {/* Fill circle */}
          <circle
            className={`${colorClass} stroke-current`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="24"
            cy="24"
          />
        </svg>
        <span className={`font-poppins text-sm font-black leading-none ${colorClass}`}>{numValue.toFixed(1).replace(/\.0$/, '')}</span>
      </div>
      <div className="leading-tight">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs font-semibold hover:underline inline-flex items-center gap-0.5 ${colorClass}`}
          >
            {label}
            <span className="text-[9px] opacity-70">↗</span>
          </a>
        ) : (
          <p className={`text-xs font-semibold ${colorClass}`}>{label}</p>
        )}
      </div>
    </div>
  );
}

export default function RatingCluster({ myRating, tmdbRating, tmdbId, mediaType }: RatingClusterProps) {
  const tmdbLink = tmdbId && mediaType ? `https://www.themoviedb.org/${mediaType}/${tmdbId}` : undefined;

  return (
    <>
      {myRating != null && <RatingCoin value={myRating} label="My Rating" colorClass={getRatingTextColorClass(myRating)} />}
      {tmdbRating != null && <RatingCoin value={Number(tmdbRating)} label="TMDB" colorClass="text-gold" href={tmdbLink} />}
    </>
  );
}
