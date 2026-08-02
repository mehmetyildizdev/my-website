import Link from 'next/link';
import { getCategoryTheme } from '@/lib/post/categoryBasedSelector';
import { getAllPosts } from '@/lib/post';
import { FilteredPostsClient } from '@/components/blog/FilteredPostsClient';
import { Metadata } from 'next';
import { Separator } from '@/components/shadcn/ui/separator';
import { Button } from '@/components/shadcn/ui/button';
import { FeaturedPost } from '@/components/blog/FeaturedPost';
import { LatestPostsList } from '@/components/blog/LatestPostsList';

export const metadata: Metadata = {
  title: 'Blog | Mehmet Yildiz',
  description: 'Compendium of Insight and Intuition - Thoughts on development, design, and the craft of building for the web.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | Mehmet Yildiz',
    description: 'Compendium of Insight and Intuition - Thoughts on development, design, and the craft of building for the web.',
    type: 'website',
    images: ['/images/seo/og-blog.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Mehmet Yildiz',
    description: 'Compendium of Insight and Intuition - Thoughts on development, design, and the craft of building for the web.',
    images: ['/images/seo/og-blog.webp'],
  },
};

type PortableTextBlock = {
  _type?: string;
  children?: { text?: string }[];
};

async function getPosts(): Promise<Post[]> {
  try {
    return await getAllPosts();
  } catch (error) {
    console.error('Error fetching posts', error);
    return [];
  }
}

export default async function Blog() {
  const posts = await getPosts();
  const latestPost = posts[0];
  const featuredCategory = latestPost?.categories?.[0]?.title;

  // Pick the latest post from each unique category (excluding featured)
  const uniqueCategoryMap = new Map<string, Post>();
  posts.slice(1).forEach((post) => {
    const cat = post.categories?.[0]?.title;
    if (cat && cat !== featuredCategory && !uniqueCategoryMap.has(cat)) {
      uniqueCategoryMap.set(cat, post);
    }
  });

  const nextPosts = Array.from(uniqueCategoryMap.values()).slice(0, 4);
  const featuredTheme = getCategoryTheme(featuredCategory);

  return (
    <section className="bg-diamond relative overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute top-0 left-0 w-full h-36 bg-linear-to-b from-diamond via-obsidian/10 to-transparent pointer-events-none" />

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col gap-12 px-6 py-24 sm:px-12 lg:px-16">
        <header className="flex flex-col gap-4 text-left">
          <h1 className="text-5xl font-black tracking-tight md:text-6xl text-shadow-primary">Compendium of Insight and Intuition</h1>
          <p className="text-lg font-medium text-shadow-sm">
            Thoughts on development, design, and the craft of building for the web. Grab a coffee and stay awhile.
          </p>
        </header>

        {latestPost ? (
          <>
            <div className="grid gap-8 lg:grid-cols-12 mt-8">
              <FeaturedPost post={latestPost} />
              <LatestPostsList posts={nextPosts} />
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-border/20 bg-card/66 p-16 text-center backdrop-blur-sm">
            <h2 className="text-3xl font-black text-foreground drop-shadow-md">No posts yet</h2>
            <p className="mt-4 text-lg font-medium text-foreground/60">Check back soon—fresh writing is on the way.</p>
          </div>
        )}

        {/* Filtered Category Posts Section */}
        {posts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center justify-between pb-4 mb-8">
              <h3 className="text-3xl font-black text-foreground">Latest Posts</h3>
              <Button
                variant="link"
                asChild
                className="text-sm font-bold uppercase tracking-widest text-link hover:text-link-hover z-10 relative no-underline hover:no-underline"
              >
                <Link href="/blog/archive">Post Archive →</Link>
              </Button>
            </div>
            <Separator className="mb-8" />

            <FilteredPostsClient allPosts={posts} defaultCat="Insight" />
          </div>
        )}
      </div>
    </section>
  );
}
