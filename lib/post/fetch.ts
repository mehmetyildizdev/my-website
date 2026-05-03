import { client } from "@/sanity/lib/client";
import { ALL_POSTS_QUERY, POST_BY_SLUG_QUERY } from "./queries";

export async function fetchAllPosts(): Promise<Post[]> {
  return client.fetch<Post[]>(
    ALL_POSTS_QUERY,
    {},
    {
      next: { revalidate: 86400 }, // Cache for 24 hours
    }
  );
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  return client.fetch<Post | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );
}
