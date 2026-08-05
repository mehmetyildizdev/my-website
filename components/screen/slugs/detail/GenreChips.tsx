// components/screen/slugs/detail/GenreChips.tsx
// Genre chips tinted with each genre's own theme token, so the chip row doubles
// as a legend for the layered background.

import { getGenreTheme } from '../genre/genreThemes';
import { TEXT, BORDER, BG_SOFT } from './tokens';

export default function GenreChips({ genres }: { genres: { name: string }[] }) {
  if (!genres?.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
      {genres.map((g) => {
        const token = getGenreTheme(g.name).token as Token;
        return (
          <span
            key={g.name}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${TEXT[token]} ${BORDER[token]} ${BG_SOFT[token]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
            {g.name}
          </span>
        );
      })}
    </div>
  );
}
