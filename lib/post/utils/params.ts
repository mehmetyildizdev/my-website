type BlogPostPageParams = Promise<{ slug: string }> | { slug: string };

export async function resolveParams(params: BlogPostPageParams): Promise<{ slug: string }> {
  if (typeof (params as Promise<{ slug: string }>).then === 'function') {
    return params as Promise<{ slug: string }>;
  }

  return params as { slug: string };
}

export type { BlogPostPageParams };
