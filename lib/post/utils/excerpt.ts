import type { PortableTextBlock } from "@portabletext/react";

export function resolveExcerpt(post: any): string {
  if (post.excerpt) return post.excerpt;
  if (post.metaDescription) return post.metaDescription;

  const blocks = post.body as PortableTextBlock[] | undefined;
  const firstBlock = blocks?.find((block) => block?._type === "block");

  if (!firstBlock) {
    return "Dive into the full story.";
  }

  const text = firstBlock.children
    ?.map((child: any) => child?.text ?? "")
    .join(" ")
    .trim();

  return text || "Dive into the full story.";
}
