// components/screen/slugs/detail/WatchBadges.tsx
// Personal watch-history badges (count watched, optional progress).

interface WatchBadgesProps {
  /** e.g. "Watched 3×" or "12 of 24 episodes" */
  primary: string;
  lastWatchedAt?: string | null; // Keep for backward-comp type safety, but we don't render it.
  /** 0–100, renders a progress bar when provided */
  progressPct?: number | null;
}

export default function WatchBadges({ primary, lastWatchedAt, progressPct }: WatchBadgesProps) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald/30 bg-emerald/10 px-2.5 py-1 font-semibold text-emerald">
          <span aria-hidden>✓</span>
          {lastWatchedAt ? (
            <span>
              Watched on{' '}
              {new Date(lastWatchedAt).toLocaleDateString('en-GB', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          ) : (
            primary
          )}
        </span>
      </div>
      {progressPct != null && (
        <div className="max-w-xs w-full">
          <div className="h-2.5 overflow-hidden rounded-full border border-border/10" style={{ backgroundColor: 'var(--obsidian)' }}>
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald to-emerald/60 transition-all duration-500"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
