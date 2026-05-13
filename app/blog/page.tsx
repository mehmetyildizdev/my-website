import Link from "next/link";
import Image from "next/image";
import { getCategoryTheme } from "@/lib/post/categoryBasedSelector";
import { getAllPosts, formatDate, resolveExcerpt } from "@/lib/post";
import { FilteredPostsClient } from "@/components/blog/FilteredPostsClient";
import { Metadata } from "next";
import { Separator } from "@/components/shadcn/ui/separator";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { Card } from "@/components/shadcn/ui/card";
import { HeroImageContent } from "@/components/blog/HeroImageContent";

export const metadata: Metadata = {
  title: "Blog | Mehmet Yildiz",
  description:
    "Compendium of Insight and Intuition - Thoughts on development, design, and the craft of building for the web.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Mehmet Yildiz",
    description:
      "Compendium of Insight and Intuition - Thoughts on development, design, and the craft of building for the web.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Mehmet Yildiz",
    description:
      "Compendium of Insight and Intuition - Thoughts on development, design, and the craft of building for the web.",
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
    console.error("Error fetching posts", error);
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
          <h1 className="text-5xl font-black tracking-tight md:text-6xl text-shadow-primary">
            Compendium of Insight and Intuition
          </h1>
          <p className="text-lg font-medium text-shadow-sm">
            Thoughts on development, design, and the craft of building for the
            web. Grab a coffee and stay awhile.
          </p>
        </header>

        {latestPost ? (
          <>
            <div className="grid gap-8 lg:grid-cols-12 mt-8">

              {/* Featured Post Area (Left - 8 cols) */}
              <div className="lg:col-span-8">
                <Link href={`/blog/post/${latestPost.slug.current}`} className="group block h-full">
                  <Card className="h-full bg-card/66 backdrop-blur-md border-border/20 transition-all duration-500 hover:shadow-silver/20 hover:bg-muted/33 flex flex-col p-6 rounded-3xl overflow-hidden border-2">
                    {/* Featured Image */}
                    {latestPost.mainImage?.asset?.url && (
                      <div className="relative w-full h-72 shrink-0 mb-2">
                        <HeroImageContent
                          kind="image"
                          url={latestPost.mainImage.asset.url}
                          alt={latestPost.mainImage.alt ?? latestPost.title}
                          themeBg="bg-muted/33"
                          priority
                        />
                      </div>
                    )}

                    {/* Featured Content */}
                    <div className="flex flex-col justify-center flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="ghost" className={`text-xs font-black uppercase tracking-widest ${featuredTheme.text} bg-transparent border-0 px-0`}>
                          {latestPost.categories?.[0]?.title}
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-foreground/30" />
                        <time className="text-xs font-semibold uppercase tracking-widest text-metadata">
                          {formatDate(latestPost.publishedAt)}
                        </time>
                      </div>
                      <h2 className={`mt-4 text-2xl md:text-4xl font-extrabold text-foreground leading-tight text-shadow-sm transition-colors ${featuredTheme.groupHoverText}`}>
                        {latestPost.title}
                      </h2>
                      <p className="text-metadata mt-4 leading-relaxed line-clamp-3">
                        {latestPost.metaDescription}
                      </p>
                    </div>
                  </Card>
                </Link>
              </div>

              {/* Next 4 Latest Posts Area (Right - 4 cols) */}
              <div className="lg:col-span-4 flex flex-col">
                <div className="flex flex-col justify-center gap-4 h-full flex-1">
                  {nextPosts.map((post) => {
                    const catTitle = post.categories?.[0]?.title;
                    const theme = getCategoryTheme(catTitle);

                    return (
                      <Link href={`/blog/post/${post.slug.current}`} key={post._id}>
                        <article
                          className="group relative flex items-center gap-4 rounded-3xl border border-border/20 bg-card/66 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-muted/33"
                        >
                          {/* Thumbnail */}
                          {post.mainImage?.asset?.url && (
                            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted/33">
                              <Image
                                src={post.mainImage.asset.url}
                                alt={post.mainImage.alt ?? post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="96px"
                                loading="lazy"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex flex-col justify-center flex-1 pr-2 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {catTitle && (
                                <Badge variant="ghost" className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.text} bg-transparent border-0 px-0`}>
                                  {catTitle}
                                </Badge>
                              )}
                            </div>
                            <h4 className={`text-sm md:text-base font-bold text-foreground leading-snug drop-shadow-sm transition-colors ${theme.groupHoverText} line-clamp-2`}>
                              {post.title}
                            </h4>
                            <time className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-metadata block truncate">
                              {formatDate(post.publishedAt)}
                            </time>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filtered Category Posts Section */}
            <div className="mt-24">
              <div className="flex items-center justify-between pb-4 mb-8">
                <h3 className="text-3xl font-black text-foreground">Latest Posts</h3>
                <Button variant="link" asChild className="text-sm font-bold uppercase tracking-widest text-link hover:text-link-hover z-10 relative no-underline hover:no-underline">
                  <Link href="/blog/archive">
                    Post Archive →
                  </Link>
                </Button>
              </div>
              <Separator className="mb-8" />

              <FilteredPostsClient allPosts={posts} defaultCat="Insight" />
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-border/20 bg-card/66 p-16 text-center backdrop-blur-sm">
            <h2 className="text-3xl font-black text-foreground drop-shadow-md">No posts yet</h2>
            <p className="mt-4 text-lg font-medium text-foreground/60">
              Check back soon—fresh writing is on the way.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
