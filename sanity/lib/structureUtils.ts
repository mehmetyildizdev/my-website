import type { SanityClient } from "sanity";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DocWithCount {
  _id: string;
  title: string;
  count: number;
}

export interface MonthGroup {
  ym: string;   // "YYYY-MM"
  year: string;
  monthName: string;
  count: number;
  startDate: string; // "YYYY-MM-01"
  endDate: string;   // first day of next month — used in < comparison
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function fetchCategoriesWithCount(
  client: SanityClient
): Promise<DocWithCount[]> {
  return client.fetch(
    `*[_type == "category" && !(_id in path("drafts.**"))] | order(title asc) {
      _id, title,
      "count": count(*[_type == "post" && !(_id in path("drafts.**")) && ^._id in categories[]._ref])
    }`
  );
}

export async function fetchTagsWithCount(
  client: SanityClient
): Promise<DocWithCount[]> {
  return client.fetch(
    `*[_type == "tag" && !(_id in path("drafts.**"))] | order(title asc) {
      _id, title,
      "count": count(*[_type == "post" && !(_id in path("drafts.**")) && ^._id in tags[]._ref])
    }`
  );
}

export async function fetchPostMonthGroups(
  client: SanityClient
): Promise<MonthGroup[]> {
  const rows: Array<{ publishedAt: string }> = await client.fetch(
    `*[_type == "post" && defined(publishedAt) && !(_id in path("drafts.**"))] | order(publishedAt desc) {
      publishedAt
    }`
  );

  const counts: Record<string, number> = {};
  const order: string[] = []; // "YYYY-MM" keys in newest-first order

  for (const { publishedAt } of rows) {
    if (!publishedAt) continue;
    const d = new Date(publishedAt);
    if (isNaN(d.getTime())) continue;
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1; // 1-12
    const ym = `${year}-${String(month).padStart(2, "0")}`;
    if (!counts[ym]) {
      counts[ym] = 0;
      order.push(ym);
    }
    counts[ym]++;
  }

  return order.map((ym): MonthGroup => {
    const [yearStr, mmStr] = ym.split("-");
    const year = parseInt(yearStr);
    const monthNum = parseInt(mmStr);
    const monthName = new Date(Date.UTC(year, monthNum - 1, 1)).toLocaleString(
      "en-US",
      { month: "long", timeZone: "UTC" }
    );

    const nextMm = monthNum === 12 ? 1 : monthNum + 1;
    const nextYear = monthNum === 12 ? year + 1 : year;

    return {
      ym,
      year: yearStr,
      monthName,
      count: counts[ym],
      startDate: `${ym}-01T00:00:00.000Z`,
      endDate: `${nextYear}-${String(nextMm).padStart(2, "0")}-01T00:00:00.000Z`,
    };
  });
}

