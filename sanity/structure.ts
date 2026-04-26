import type { StructureResolver } from "sanity/structure";
import { apiVersion } from "./env";
import {
  fetchCategoriesWithCount,
  fetchTagsWithCount,
  fetchPostMonthGroups,
  type DocWithCount,
  type MonthGroup,
} from "./lib/structureUtils";

export const structure: StructureResolver = (S, context) => {
  const client = context.getClient({ apiVersion });

  return S.list()
    .title("Content")
    .items([
      // ── Posts ────────────────────────────────────────────────────────
      S.documentTypeListItem("post").title("All Posts"),

      S.listItem()
        .title("Posts by Category")
        .child(async () => {
          const categories = await fetchCategoriesWithCount(client);
          return S.list()
            .title("Posts by Category")
            .items(
              categories.map((cat: DocWithCount) =>
                S.listItem()
                  .title(`${cat.title}  (${cat.count})`)
                  .id(cat._id)
                  .child(
                    S.documentList()
                      .title(cat.title)
                      .apiVersion(apiVersion)
                      .filter('_type == "post" && $catId in categories[]._ref')
                      .params({ catId: cat._id })
                      .defaultOrdering([
                        { field: "publishedAt", direction: "desc" },
                      ])
                  )
              )
            );
        }),

      S.listItem()
        .title("Posts by Date")
        .child(async () => {
          const months = await fetchPostMonthGroups(client);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items: any[] = [];
          let currentYear = "";
          for (const m of months) {
            if (m.year !== currentYear) {
              if (currentYear) items.push(S.divider());
              currentYear = m.year;
            }
            items.push(
              S.listItem()
                .title(`${m.monthName} ${m.year}  (${m.count})`)
                .child(
                  S.documentList()
                    .title(`${m.monthName} ${m.year}`)
                    .apiVersion(apiVersion)
                    .filter(
                      '_type == "post" && publishedAt >= $start && publishedAt < $end'
                    )
                    .params({ start: m.startDate, end: m.endDate })
                    .defaultOrdering([
                      { field: "publishedAt", direction: "desc" },
                    ])
                )
            );
          }
          return S.list().title("Posts by Date").items(items);
        }),

      S.divider(),

      // ── Meta ─────────────────────────────────────────────────────────
      S.documentTypeListItem("author").title("Authors"),

      S.listItem()
        .title("Categories")
        .child(async () => {
          const categories = await fetchCategoriesWithCount(client);
          return S.list()
            .title("Categories")
            .items(
              categories.map((cat: DocWithCount) =>
                S.listItem()
                  .title(`${cat.title}  (${cat.count})`)
                  .id(`meta-cat-${cat._id}`)
                  .child(
                    S.document().documentId(cat._id).schemaType("category")
                  )
              )
            );
        }),

      S.listItem()
        .title("Tags")
        .child(async () => {
          const tags = await fetchTagsWithCount(client);
          return S.list()
            .title("Tags")
            .items(
              tags.map((tag: DocWithCount) =>
                S.listItem()
                  .title(`${tag.title}  (${tag.count})`)
                  .id(`meta-tag-${tag._id}`)
                  .child(
                    S.document().documentId(tag._id).schemaType("tag")
                  )
              )
            );
        }),
    ]);
};
