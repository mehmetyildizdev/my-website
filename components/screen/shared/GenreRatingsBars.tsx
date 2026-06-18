'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
import { getAvgRatingToken, getShowAvgRatingToken } from '@/lib/screen/utils/format';

const RATING_BG_CLASS = {
  amethyst: 'bg-amethyst',
  sapphire: 'bg-sapphire',
  emerald: 'bg-emerald',
  topaz: 'bg-topaz',
  ruby: 'bg-ruby',
} as const;

const MOVIE_LEGEND = [
  { tier: 'amethyst' as const, label: '≥7.0' },
  { tier: 'sapphire' as const, label: '6.5–7.0' },
  { tier: 'emerald' as const, label: '6.0–6.5' },
  { tier: 'topaz' as const, label: '5.5–6.0' },
  { tier: 'ruby' as const, label: '<5.5' },
];

const SHOW_LEGEND = [
  { tier: 'amethyst' as const, label: '≥8.0' },
  { tier: 'sapphire' as const, label: '7.8–8.0' },
  { tier: 'emerald' as const, label: '7.6–7.8' },
  { tier: 'topaz' as const, label: '7.4–7.6' },
  { tier: 'ruby' as const, label: '<7.4' },
];

export default function GenreRatingsBars({
  data,
  mode = 'movie',
}: {
  data: GenreRating[];
  mode?: 'movie' | 'show';
}) {
  const ratings = data.map((d) => Number(d.avg_rating));
  const minR = Math.min(...ratings);
  const maxR = Math.max(...ratings);
  const scaleMin = Math.max(0, Math.floor(minR - 0.5));
  const scaleMax = Math.min(10, Math.ceil(maxR + 0.5));
  const range = scaleMax - scaleMin || 1;

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">
          Genre Affinity (Avg Rating)
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Average personal rating per genre (20+ rated items). Higher = you tend to like it more.
          The divider in each bar marks the movie/show split by count.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          {data.map((g) => {
            const rating = Number(g.avg_rating);
            const pct = ((rating - scaleMin) / range) * 100;
            const movieR = g.avg_movie_rating != null ? Number(g.avg_movie_rating) : null;
            const showR = g.avg_show_rating != null ? Number(g.avg_show_rating) : null;
            const token =
              mode === 'show' ? getShowAvgRatingToken(rating) : getAvgRatingToken(rating);
            const bgClass = RATING_BG_CLASS[token];

            // Movie share of total counts → divider position within the filled bar
            const total = g.movie_count + g.show_count;
            const moviePct = total > 0 ? (g.movie_count / total) * 100 : 100;
            const hasSplit = g.movie_count > 0 && g.show_count > 0;

            return (
              <Tooltip
                key={g.name}
                placement="mouse"
                content={
                  <div className="flex flex-col gap-0.5 min-w-[160px]">
                    <span
                      className="font-semibold text-gold"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {g.name}
                    </span>
                    <div className="flex justify-between gap-4 text-[11px] mt-1">
                      <span className="text-quicksilver">Avg Rating</span>
                      <span className="text-platinum font-semibold tabular-nums">
                        {rating.toFixed(2)}
                      </span>
                    </div>
                    {movieR != null && (
                      <div className="flex justify-between gap-4 text-[11px]">
                        <span className="text-quicksilver">Movies ({g.movie_count})</span>
                        <span className="text-sapphire tabular-nums">{movieR.toFixed(2)}</span>
                      </div>
                    )}
                    {showR != null && (
                      <div className="flex justify-between gap-4 text-[11px]">
                        <span className="text-quicksilver">Shows ({g.show_count})</span>
                        <span className="text-amethyst tabular-nums">{showR.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-4 text-[11px] pt-1 mt-1 border-t border-border/20">
                      <span className="text-quicksilver">Total rated</span>
                      <span className="text-platinum tabular-nums">{g.total_count}</span>
                    </div>
                  </div>
                }
              >
                <div className="grid grid-cols-[110px_1fr_50px] items-center gap-3 py-1 hover:bg-pearl/30 rounded transition-colors px-2 w-full">
                  <span className="text-sm text-foreground/90 truncate">{g.name}</span>
                  <div className="relative h-4 rounded-full bg-border/15 overflow-hidden">
                    {/* Filled rating bar */}
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all ${bgClass}`}
                      style={{ width: `${pct}%`, opacity: 0.85 }}
                    />
                    {/* Movie/Show divider — placed at moviePct of the filled length */}
                    {hasSplit && (
                      <div
                        className="absolute top-0 bottom-0 border-l border-2 border-background/70"
                        style={{ left: `${(pct * moviePct) / 100}%` }}
                      />
                    )}
                  </div>
                  <span className="text-sm tabular-nums font-mono text-platinum text-right">
                    {rating.toFixed(2)}
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/10 text-[10px] text-muted-foreground flex-wrap">
          <span>
            Scale {scaleMin}–{scaleMax}
          </span>
          {(mode === 'show' ? SHOW_LEGEND : MOVIE_LEGEND).map(({ tier, label }) => (
            <div key={label} className="flex items-center gap-1">
              <span
                className={`inline-block w-3 h-3 rounded-full opacity-85 ${RATING_BG_CLASS[tier]}`}
              />
              {label}
            </div>
          ))}
          <span className="ml-auto flex items-center gap-1.5">
            <span className="inline-block w-px h-4 bg-foreground/60" />
            <span>Movies | Shows split</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
