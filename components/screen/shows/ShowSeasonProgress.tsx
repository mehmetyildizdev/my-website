'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
import { Select } from '@/components/shadcn/ui/select';
import { formatDate } from '@/lib/screen/utils/format';

type ShowProgress = {
  show_tmdb_id: number;
  show_name: string;
  total_seasons: number;
  watched_seasons: number;
  total_episodes: number;
  watched_episodes: number;
  completion_pct: number;
  avg_rating: string | number | null;
  status: string;
  last_watched_at?: string | null;
};

type FilterMode = 'all' | 'complete' | 'watching' | 'dropped';

function statusBadge(status: string) {
  switch (status) {
    case 'complete':
      return { label: 'Complete', color: 'bg-emerald/20 text-emerald' };
    case 'watching':
      return { label: 'Watching', color: 'bg-sapphire/20 text-sapphire' };
    case 'dropped':
      return { label: 'Dropped', color: 'bg-ruby/20 text-ruby' };
    default:
      return { label: status, color: 'bg-border/20 text-muted-foreground' };
  }
}

function completionColor(pct: number | string, status?: string): string {
  const val = Number(pct);
  if (val >= 100 || status === 'complete') return 'bg-emerald';
  if (val >= 75) return 'bg-sapphire';
  if (val >= 50) return 'bg-topaz';
  if (val >= 25) return 'bg-amethyst';
  return 'bg-ruby';
}

const PAGE_SIZE = 20;

export default function ShowSeasonProgress({ data }: { data: ShowProgress[] }) {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (filter === 'all') return data;
    return data.filter((s) => s.status === filter);
  }, [data, filter]);

  const displayed = filtered.slice(0, visible);

  const stats = useMemo(() => {
    const complete = data.filter((s) => s.status === 'complete').length;
    const watching = data.filter((s) => s.status === 'watching').length;
    const totalEps = data.reduce((sum, s) => sum + s.watched_episodes, 0);
    return { total: data.length, complete, watching, totalEps };
  }, [data]);

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight text-accent">
            Show Progress Tracker
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.total} shows · {stats.totalEps.toLocaleString()} episodes watched ·{' '}
            {stats.complete} completed
          </p>
        </div>
        <Select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as FilterMode);
            setVisible(PAGE_SIZE);
          }}
        >
          <option value="all">All ({data.length})</option>
          <option value="complete">Complete ({stats.complete})</option>
          <option value="watching">Watching ({stats.watching})</option>
          <option value="dropped">Dropped</option>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {displayed.map((show) => {
            const rating = show.avg_rating != null ? Number(show.avg_rating) : null;
            const badge = statusBadge(show.status);
            const barColor = completionColor(show.completion_pct, show.status);

            return (
              <Tooltip
                key={show.show_tmdb_id}
                placement="mouse"
                content={
                  <div className="flex flex-col gap-0.5 min-w-45">
                    <span
                      className="font-semibold text-gold"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {show.show_name}
                    </span>
                    <div className="flex justify-between gap-4 text-[11px] mt-1">
                      <span className="text-quicksilver">Seasons</span>
                      <span className="text-platinum tabular-nums">
                        {show.watched_seasons}/{show.total_seasons}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-[11px]">
                      <span className="text-quicksilver">Episodes</span>
                      <span className="text-platinum tabular-nums">
                        {show.watched_episodes}/{show.total_episodes}
                      </span>
                    </div>
                    {rating != null && (
                      <div className="flex justify-between gap-4 text-[11px]">
                        <span className="text-quicksilver">Avg Rating</span>
                        <span className="text-emerald tabular-nums">{rating.toFixed(1)}</span>
                      </div>
                    )}
                    {show.last_watched_at && (
                      <div className="flex justify-between gap-4 text-[11px]">
                        <span className="text-quicksilver">Last Watched</span>
                        <span className="text-platinum tabular-nums">
                          {formatDate(show.last_watched_at)}
                        </span>
                      </div>
                    )}
                  </div>
                }
              >
                <div className="grid grid-cols-[1fr_80px_60px_50px] items-center gap-3 py-1.5 px-2 hover:bg-pearl/30 rounded transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-foreground/90 truncate">{show.show_name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 hidden sm:inline-block ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-border/15 overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
                      style={{ width: `${show.completion_pct}%`, opacity: 0.8 }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground text-right">
                    {show.watched_episodes}/{show.total_episodes}
                  </span>
                  <span className="text-xs tabular-nums text-platinum text-right font-medium">
                    {show.completion_pct}%
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>

        {visible < filtered.length && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full mt-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-pearl/30 rounded-md border border-border/10 transition-colors"
          >
            Show more ({filtered.length - visible} remaining)
          </button>
        )}
      </CardContent>
    </Card>
  );
}
