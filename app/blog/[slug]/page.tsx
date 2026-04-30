import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostRenderer } from "@/components/blog/PostRenderer";
import { MoveLeft } from "lucide-react";
import { getCategoryTheme } from "@/lib/post/categoryBasedSelector";
import { getPostPageData } from "@/lib/post/utils/postData";
import {
  resolveParams,
  type BlogPostPageParams,
} from "@/lib/post/utils/params";
import {
  getAllPosts,
  extractPlainText,
  calculateReadingTime,
  resolveHeroImage,
  formatPublishedDate,
} from "@/lib/post";

export default async function BlogPostPageVariant({
  params,
}: {
  params: BlogPostPageParams;
}) {
  const { slug } = await resolveParams(params);

  if (!slug) {
    notFound();
  }

  const { post, shareLinks } = await getPostPageData(slug);
  const plainText = extractPlainText(post.body ?? []);
  const readingTime = calculateReadingTime(plainText);
  const publishedDate = formatPublishedDate(post.publishedAt ?? "");
  const categories = post.categories?.map((category) => category.title) ?? [];
  const tags = post.tags?.map((tag) => tag.title) ?? [];
  const heroImage = resolveHeroImage(post);
  const share = shareLinks ?? [];
  const theme = getCategoryTheme(categories[0]);

  return (
    <article className="relative isolate">
      <div
        className={`absolute inset-x-0 top-0 -z-10 h-108 md:h-96 lg:h-84 bg-linear-to-b ${theme.from} from-0% to-pearl/33 to-90%`}
      />
      <div
        className={`absolute inset-x-0 top-0 -z-11 h-108 md:h-96 lg:h-84 ${theme.backgroundImage} opacity-33 bg-cover md:bg-auto`}
      />

      <div>
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-0"></div>
        <Link
          href="/blog"
          className="group inline-flex w-fit items-center gap-1 px-4 text-sm text-shadow-sm bg-foreground/20 font-medium text-background transition hover:text-foreground"
        >
          <MoveLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          Back
        </Link>
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold tracking-tight text-foreground text-pretty text-shadow-lg px-6 py-6 lg:px-12">
              {post.title}
            </h1>

            <div
              id="post-meta-bar"
              className="mt-2 md:mt-10 lg:mt-4 px-6 lg:px-12 flex h-10 items-center justify-between bg-card/70 text-sm text-metadata"
            >
              <div className="flex items-center gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className={`rounded-full border ${theme.border} px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.2em] text-shadow-lg`}
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-shadow-lg font-medium">
                <time dateTime={post.publishedAt}>{publishedDate}</time>
                <span aria-hidden>•</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* excerpt (padded from left a bit) */}
        <div
          id="post-excerpt"
          className={`flex justify-end mx-auto w-full max-w-3x border-t-2 ${theme.border}`}
        >
          <div className="flex rounded-bl-lg bg-card/70 py-4 pr-6 lg:pr-12 lg:w-[75%]">
            <p className="text-base text-metadata text-shadow-md pl-4 md:pb-6 lg:pb-2">
              {post.metaDescription}
            </p>
          </div>
        </div>

        {/* hero image with colorful border + subtle animation */}
        {heroImage && (
          <figure
            id="hero-image"
            className="group relative mx-auto mt-2 px-2 w-full max-w-4xl"
          >
            <div className={`rounded-2xl h-64 lg:h-120 p-1 ${theme.bg}`}>
              <div className="relative overflow-hidden rounded-xl bg-card">
                <div className="relative h-62 lg:h-118 w-full">
                  <Image
                    src={heroImage.url}
                    alt={heroImage.alt ?? post.title}
                    fill
                    className="object-cover object-center"
                    sizes="(min-width: 1024px) 1440px, 100vw"
                    priority
                  />

                  {heroImage.caption && (
                    <figcaption className="absolute left-0 right-0 bottom-0 bg-card text-sm text-muted-foreground px-6 py-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
                      {heroImage.caption}
                    </figcaption>
                  )}
                </div>
              </div>
            </div>
          </figure>
        )}

        <div className="mt-12 grid grid-cols-1 px-6 lg:px-12">
          <section id="article" className="flex flex-col">
            <PostRenderer value={post.body} />

            {/* keep share + tags below content on smaller viewports */}
            <div className="flex flex-col gap-8 text-md text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border/40 mt-4 py-8">
                <span className="text-lg text-shadow-md font-bold uppercase tracking-[0.25em] text-foreground/60">
                  Tags:
                </span>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border border-foreground/10 px-4 py-1 text-sm text-shadow-md font-bold uppercase tracking-[0.2em] ${theme.bg} text-background shadow-sm transition-transform hover:scale-105`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-muted-foreground">
                    No tags yet
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts
    .filter((post) => post.slug?.current)
    .map((post) => ({
      slug: post.slug.current,
    }));
}
