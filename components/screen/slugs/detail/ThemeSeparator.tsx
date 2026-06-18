// components/screen/slugs/detail/ThemeSeparator.tsx
// Renders an elegant, fading horizontal rule colored with the movie/show's
// dominant genre theme color. Fades to transparent on both sides.

import { getGenreColor } from '../genre/genreThemes';

interface ThemeSeparatorProps {
  genres: { name: string }[];
  className?: string;
}

export default function ThemeSeparator({ genres, className = '' }: ThemeSeparatorProps) {
  const primaryGenre = genres[0]?.name;
  const color = primaryGenre ? getGenreColor(primaryGenre) : 'var(--border)';

  return (
    <div className={`w-full py-6 ${className}`} aria-hidden>
      <div
        className="h-px w-full"
        style={{
          background: `linear-gradient(to right, transparent, color-mix(in oklch, ${color}, transparent 65%), transparent)`,
        }}
      />
    </div>
  );
}
