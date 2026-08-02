import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostRenderer } from '@/components/blog/PostRenderer';
import { MoveLeft } from 'lucide-react';
import { getCategoryTheme } from '@/lib/post/categoryBasedSelector';
import { getPostPageData } from '@/lib/post/utils/postData';
import { resolveParams, type BlogPostPageParams } from '@/lib/post/utils/params';
import { getAllPosts, extractPlainText, calculateReadingTime, resolveHeroMedia, wrapHtmlVisual, formatPublishedDate } from '@/lib/post';
import { TranslateToggleButton } from '@/components/blog/TranslateToggleButton';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Separator } from '@/components/shadcn/ui/separator';
import { HeroImageContent } from '@/components/blog/HeroImageContent';
import { cn } from '@/lib/shadcn/utils';

export default async function BlogPostPageVariant({
  params,
  searchParams,
}: {
  params: BlogPostPageParams;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await resolveParams(params);

  if (!slug) {
    notFound();
  }

  const { post } = await getPostPageData(slug);
  const plainText = extractPlainText(post.body ?? []);
  const readingTime = calculateReadingTime(plainText);
  const publishedDate = formatPublishedDate(post.publishedAt ?? '');
  const categories = post.categories?.map((category) => category.title) ?? [];
  const tags = post.tags?.map((tag) => tag.title) ?? [];
  const heroMedia = resolveHeroMedia(post);
  const theme = getCategoryTheme(categories[0]);

  // Translation toggle — URL param ?translated=1
  const resolvedParams = searchParams ? await searchParams : {};
  const isTurkish = tags.some((t) => t.toLowerCase() === 'türkçe');
  const hasTranslation = isTurkish && !!post.translationBody?.length;
  const showingTranslation = hasTranslation && resolvedParams?.translated === '1';
  const activeBody = showingTranslation ? post.translationBody! : post.body;

  return (
    <article className="relative isolate">
      <div className={`absolute inset-x-0 top-0 -z-10 h-108 md:h-96 lg:h-84 bg-linear-to-b ${theme.from} from-0% to-pearl/33 to-90%`} />
      <div className={`absolute inset-x-0 top-0 -z-11 h-108 md:h-96 lg:h-84 ${theme.backgroundImage} opacity-33 bg-cover md:bg-auto`} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button variant="glass" size="sm" asChild className="rounded-none text-platinum text-shadow-sm">
            <Link href="/blog" aria-label="Back to blog" className="group inline-flex items-center gap-1">
              <MoveLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
              Blog
            </Link>
          </Button>
          <TranslateToggleButton isActive={hasTranslation} showingTranslation={showingTranslation} />
        </div>
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 suppressHydrationWarning className="font-bold tracking-tight text-foreground text-pretty text-shadow-lg px-6 py-6 lg:px-12">
              {post.title}
            </h1>

            <div
              id="post-meta-bar"
              className="mt-2 md:mt-10 lg:mt-4 px-6 lg:px-12 flex h-10 items-center justify-between text-sm text-metadata"
            >
              <div className="flex items-center gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className={`${theme.border} text-xs font-semibold uppercase tracking-[0.2em] text-shadow-lg`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-shadow-lg font-medium">
                <time suppressHydrationWarning dateTime={post.publishedAt}>
                  {publishedDate}
                </time>
                <span aria-hidden="true">•</span>
                <span>{readingTime} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* excerpt (padded from left a bit) */}
        <div id="post-excerpt" className={`flex justify-end mx-auto w-full max-w-3x border-t-2 ${theme.border}`}>
          <div className="flex rounded-bl-lg py-4 pr-6 lg:pr-12 lg:w-[75%]">
            <p className="text-base text-metadata text-shadow-md pl-4 md:pb-6 lg:pb-2">{post.metaDescription}</p>
          </div>
        </div>

        {/* hero image / HTML visual with colorful border — aspect-ratio preserves 16:9 at all widths */}
        {heroMedia && (
          <figure id="hero-image" className="group relative mx-auto mt-2 px-2 w-full max-w-4xl">
            {/* aspect-video = 16:9; height is always width × (9/16), p-1 is the colored border */}
            <div className={`rounded-2xl aspect-video p-1 ${theme.bg}`}>
              <HeroImageContent
                kind={heroMedia.kind}
                url={heroMedia.kind === 'image' ? heroMedia.url : undefined}
                htmlCode={heroMedia.kind === 'htmlVisual' ? wrapHtmlVisual(heroMedia.htmlCode) : undefined}
                alt={heroMedia.alt ?? post.title}
                themeBg={theme.bg}
                priority
              />

              {heroMedia.caption && (
                <figcaption
                  className={cn(
                    'absolute left-0 right-0 bottom-0 bg-muted/66 backdrop-blur-md px-6 py-3 text-sm font-medium transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none border-t',
                    theme.border,
                    theme.text,
                  )}
                >
                  <span className={cn('mr-4 inline-block h-2 w-2', theme.bg)} />
                  {heroMedia.caption}
                </figcaption>
              )}
            </div>
          </figure>
        )}

        <div className="mt-12 grid grid-cols-1 px-6 lg:px-12">
          <section id="article" className="flex flex-col">
            <PostRenderer value={activeBody} />

            {/* keep share + tags below content on smaller viewports */}
            <div className="flex flex-col gap-8 text-md text-muted-foreground">
              <Separator className="mt-4" />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 py-8">
                <span className="text-lg text-shadow-md font-bold uppercase tracking-[0.15em] text-foreground/75">Tags:</span>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        className={`text-sm text-shadow-md font-semibold uppercase tracking-[0.15em] ${theme.bg} text-pearl text-shadow-foreground transition-transform hover:scale-105`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-muted-foreground">No tags yet</span>
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
