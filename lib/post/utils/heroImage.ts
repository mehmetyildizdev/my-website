/**
 * Helpers for resolving hero media from a Post.
 *
 * Priority order (post page hero only):
 *   1. post.htmlVisual — animated HTML snippet (shown ONLY on post page)
 *   2. post.mainImage  — standard image upload
 *   3. First image block found in post.body (fallback)
 *
 * List views (archive, blog page cards) always use post.mainImage directly.
 */

export function isImageBlock(block: BodyBlock): block is ImageBlock {
  return block._type === "image";
}

export function pickFirstBodyImage(
  blocks?: BodyBlock[],
): ImageBlock | undefined {
  return blocks?.find((block) => isImageBlock(block) && !!block.asset?.url);
}

/** Resolve the hero media for the post page. Returns a discriminated union. */
export function resolveHeroMedia(post: Post): HeroMedia | undefined {
  // HTML visual takes priority — only shown on post page
  if (post.htmlVisual?.htmlCode) {
    return {
      kind: "htmlVisual",
      htmlCode: post.htmlVisual.htmlCode,
      alt: post.htmlVisual.alt,
      caption: post.htmlVisual.caption,
      aspectRatio: post.htmlVisual.aspectRatio ?? "16 / 9",
    };
  }

  // Standard main image
  const mi = post.mainImage;
  if (mi?.asset?.url) {
    return {
      kind: "image",
      url: mi.asset.url,
      alt: mi.alt ?? post.title,
      caption: mi.caption,
      width: mi.asset.metadata?.dimensions?.width,
      height: mi.asset.metadata?.dimensions?.height,
    };
  }

  // Fall back to first image block in body
  const bodyImage = pickFirstBodyImage(post.body);
  if (bodyImage?.asset?.url) {
    return {
      kind: "image",
      url: bodyImage.asset.url,
      alt: bodyImage.alt ?? post.title,
      caption: bodyImage.caption,
      width: bodyImage.asset.metadata?.dimensions?.width,
      height: bodyImage.asset.metadata?.dimensions?.height,
    };
  }

  return undefined;
}

/**
 * Backward-compatible shim used by metadata.ts and any code that only
 * needs a static image URL. Does NOT surface HTML visuals.
 */
export function resolveHeroImage(post: Post): HeroImage | undefined {
  const mi = post.mainImage;
  if (mi?.asset?.url) {
    return {
      url: mi.asset.url,
      alt: mi.alt ?? post.title,
      caption: mi.caption,
      width: mi.asset.metadata?.dimensions?.width,
      height: mi.asset.metadata?.dimensions?.height,
    };
  }

  const bodyImage = pickFirstBodyImage(post.body);
  if (bodyImage?.asset?.url) {
    return {
      url: bodyImage.asset.url,
      alt: bodyImage.alt ?? post.title,
      caption: bodyImage.caption,
      width: bodyImage.asset.metadata?.dimensions?.width,
      height: bodyImage.asset.metadata?.dimensions?.height,
    };
  }

  return undefined;
}
