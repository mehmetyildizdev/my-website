export const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(
  text: string,
  wpm = WORDS_PER_MINUTE
): number {
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}
