import Link from "next/link";
import Image from "next/image";
import { getCategoryTheme } from "@/lib/post/categoryBasedSelector";
import { FilteredPostsClient } from "@/components/blog/FilteredPostsClient";
import { Metadata } from "next";

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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
    const response = await fetch(
      baseUrl ? `${baseUrl}/api/posts` : "/api/posts",
      {
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching posts", error);
    return [];
  }
}

function resolveExcerpt(post: Post): string {
  if (post.excerpt) return post.excerpt;
  if (post.metaDescription) return post.metaDescription;

  const blocks = post.body as PortableTextBlock[] | undefined;
  const firstBlock = blocks?.find((block) => block?._type === "block");

  if (!firstBlock) {
    return "Dive into the full story.";
  }

  const text = firstBlock.children
    ?.map((child) => child?.text ?? "")
    .join(" ")
    .trim();

  return text || "Dive into the full story.";
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
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
          <h1 className="text-5xl font-black tracking-tight md:text-6xl text-shadow-lg">
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
              <div className="lg:col-span-8 flex flex-col">
                <Link href={`/blog/post/${latestPost.slug.current}`}>
                  <article className="group relative flex flex-col gap-2 rounded-4xl bg-pearl/80 p-6 shadow-2xl backdrop-blur-md border border-border/20 transition-all duration-500 hover:shadow-silver/20 hover:bg-card/90 flex-1">

                    {/* Featured Image */}

                    {latestPost.mainImage?.asset?.url && (
                      <div className="relative w-full h-72 shrink-0 overflow-hidden rounded-3xl bg-muted">
                        <div className="absolute inset-0 bg-sapphire/10 group-hover:bg-transparent transition-colors duration-500 z-10 mix-blend-overlay" />
                        <Image
                          src={latestPost.mainImage.asset.url}
                          alt={latestPost.mainImage.alt ?? latestPost.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          priority
                        />
                      </div>
                    )}

                    {/* Featured Content */}
                    <div className="flex flex-col justify-center flex-1 py-2">
                      <div className="flex items-center gap-3">
                        <p className={`text-xs font-black uppercase tracking-widest ${featuredTheme.text}`}>
                          {latestPost.categories?.[0]?.title}
                        </p>
                        <div className="h-1 w-1 rounded-full bg-foreground/30" />
                        <time className="text-xs font-semibold uppercase tracking-widest text-metadata">
                          {formatDate(latestPost.publishedAt)}
                        </time>
                      </div>
                      <h2 className={`mt-4 text-2xl md:text-4xl font-extrabold text-foreground leading-tight text-shadow-sm transition-colors ${featuredTheme.groupHoverText}`}>
                        {latestPost.title}
                      </h2>
                      <p className="text-meta mt-4 leading-relaxed">
                        {latestPost.metaDescription}
                      </p>
                    </div>
                  </article>
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
                          className="group relative flex items-center gap-4 rounded-3xl border border-border/20 bg-pearl/60 p-3 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-card/90"
                        >
                          {/* Thumbnail */}
                          {post.mainImage?.asset?.url && (
                            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted/20">
                              <Image
                                src={post.mainImage.asset.url}
                                alt={post.mainImage.alt ?? post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="96px"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex flex-col justify-center flex-1 pr-2 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {catTitle && (
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.text}`}>
                                  {catTitle}
                                </span>
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
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
                <h3 className="text-3xl font-black text-foreground">Latest Articles</h3>
                <Link href="/blog/archive" className="text-sm font-bold uppercase tracking-widest text-link hover:text-link-hover transition-colors z-10 relative">
                  View Everything →
                </Link>
              </div>

              <FilteredPostsClient allPosts={posts} defaultCat="Insight" />
            </div>
          </>
        ) : (
          <div className="mt-12 rounded-4xl border border-dashed border-border/40 bg-card/40 p-16 text-center backdrop-blur-sm">
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
