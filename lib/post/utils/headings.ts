export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export { slugify };

export function extractHeadings(blocks?: BodyBlock[]): HeadingItem[] {
  if (!blocks || !blocks.length) return [];

  const headings: HeadingItem[] = [];
  const usedIds = new Set<string>();

  for (const block of blocks) {
    if (block && (block as any)._type === "block") {
      const b = block as any;
      const style = b.style || "normal";
      // consider h1..h4
      if (/^h[1-4]$/.test(style)) {
        const children = Array.isArray(b.children) ? b.children : [];
        const text = children
          .map((c: any) => (typeof c?.text === "string" ? c.text : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (text) {
          let id = slugify(text);
          let counter = 1;
          while (usedIds.has(id)) {
            id = `${slugify(text)}-${counter}`;
            counter++;
          }
          usedIds.add(id);
          const level = Number(style.replace("h", ""));
          headings.push({ id, text, level });
        }
      }
    }
  }

  return headings;
}
