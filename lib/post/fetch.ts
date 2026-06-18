import { cache } from "react";
import { client } from "@/sanity/lib/client";
import { ALL_POSTS_QUERY, POST_BY_SLUG_QUERY } from "./queries";

export const fetchAllPosts = cache(async (): Promise<Post[]> => {
  return client.fetch<Post[]>(
    ALL_POSTS_QUERY,
    {},
    {
      next: { revalidate: 604800 }, // Cache for 7 days
    }
  );
});

export const fetchPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  return client.fetch<Post | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    {
      next: { revalidate: 604800 }, // Cache for 7 days
    }
  );
});
