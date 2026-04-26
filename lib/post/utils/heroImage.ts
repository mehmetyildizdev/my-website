/**
 * Helpers for resolving hero images from a Post's main image or body.
 * Uses the project's global `BodyBlock`, `HeroImage`,`ImageBlock` and `Post` types.
 */

export function isImageBlock(block: BodyBlock): block is ImageBlock {
  return block._type === "image";
}

export function pickFirstBodyImage(
  blocks?: BodyBlock[],
): ImageBlock | undefined {
  return blocks?.find((block) => isImageBlock(block) && !!block.asset?.url);
}

export function resolveHeroImage(post: Post): HeroImage | undefined {
  const mainImage = post.mainImage;

  if (mainImage?.asset?.url) {
    return {
      url: mainImage.asset.url,
      alt: mainImage.alt ?? post.title,
      caption: mainImage.caption,
      width: mainImage.asset.metadata?.dimensions?.width,
      height: mainImage.asset.metadata?.dimensions?.height,
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
