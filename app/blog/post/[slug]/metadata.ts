import { Metadata } from "next";
import { resolveParams, BlogPostPageParams } from "@/lib/post/utils/params";
import { getPostPageData } from "@/lib/post/utils/postData";

const BRAND_NAME = "Mehmet Yildiz";
const MAX_TITLE_LENGTH = 60;

function formatSeoTitle(postTitle: string): string {
  const separator = " | ";
  const fullTitle = `${postTitle}${separator}${BRAND_NAME}`;

  if (fullTitle.length <= MAX_TITLE_LENGTH) {
    return fullTitle;
  }

  // If too long, truncate the post title to fit the brand name and ellipsis
  const availableLength =
    MAX_TITLE_LENGTH - separator.length - BRAND_NAME.length - 3;
  const truncatedPostTitle = postTitle.substring(0, availableLength).trim();

  return `${truncatedPostTitle}...${separator}${BRAND_NAME}`;
}

export async function getBlogPostMetadata({
  params,
}: {
  params: BlogPostPageParams;
}): Promise<Metadata> {
  const { slug } = await resolveParams(params);
  if (!slug) return {};

  const { post, postUrl } = await getPostPageData(slug);
  const seoTitle = formatSeoTitle(post.title ?? "");

  // mainImage is always the source of truth for OG/Twitter (static URL required)
  let ogImageUrl = post.mainImage?.asset?.url;
  if (ogImageUrl?.includes("cdn.sanity.io")) {
    // Social platforms (LinkedIn/Twitter) often don't support SVGs for OG images.
    // Use Sanity Image API to convert to PNG and set standard OG dimensions.
    ogImageUrl = `${ogImageUrl}?fm=png&w=1200&h=630&fit=max`;
  }
  const ogImageAlt = post.mainImage?.alt ?? post.title;
  return {
    title: seoTitle,
    description: post.metaDescription,
    alternates: {
      canonical: `/blog/post/${post.slug.current}`,
    },
    openGraph: {
      title: seoTitle,
      description: post.metaDescription,
      url: postUrl,
      type: "article",
      publishedTime: post.publishedAt,
      images: ogImageUrl ? [{ url: ogImageUrl, alt: ogImageAlt }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: post.metaDescription,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}
