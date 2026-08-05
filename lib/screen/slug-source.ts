export const RECENT_WATCH_SOURCE = 'recent-watches';

export function isRecentWatchSource(source: string | string[] | undefined): boolean {
  return source === RECENT_WATCH_SOURCE || (Array.isArray(source) && source.includes(RECENT_WATCH_SOURCE));
}
