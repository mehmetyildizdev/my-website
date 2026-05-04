export function formatPublishedDate(date: string | null | undefined): string {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateString));
}
