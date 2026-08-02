import { cache } from 'react';
import { notFound } from 'next/navigation';
import { buildShareLinks, getPostBySlug } from '@/lib/post';
import { resolveOrigin } from '@/lib/resolveOrigin';
import { extractHeadings } from '@/lib/post/utils/headings';

export const getPost = cache(async (slug: string): Promise<Post> => {
  if (!slug) {
    notFound();
  }
  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }
  return post;
});

export async function getPostPageData(slug: string): Promise<PostPageData> {
  const post = await getPost(slug);
  const headings = extractHeadings(post.body);
  const origin = (await resolveOrigin()) || null;
  const postUrl = origin ? `${origin}/blog/post/${post.slug.current}` : `/blog/post/${post.slug.current}`;

  return {
    post,
    headings,
    origin,
    postUrl,
    shareLinks: buildShareLinks(post.title ?? '', postUrl),
  };
}
