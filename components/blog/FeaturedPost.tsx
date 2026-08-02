import Link from 'next/link';
import { Card } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { HeroImageContent } from '@/components/blog/HeroImageContent';
import { getCategoryTheme } from '@/lib/post/categoryBasedSelector';
import { formatDate } from '@/lib/post';

export function FeaturedPost({ post }: { post: Post }) {
  const category = post.categories?.[0]?.title;
  const theme = getCategoryTheme(category);

  return (
    <div className="lg:col-span-8">
      <Link href={`/blog/post/${post.slug.current}`} className="group block h-full">
        <Card className="h-full bg-card/66 backdrop-blur-md border-border/20 transition-all duration-500 hover:shadow-silver/20 hover:bg-muted/33 flex flex-col p-6 rounded-3xl overflow-hidden border-2">
          {/* Featured Image */}
          {post.mainImage?.asset?.url && (
            <div className="relative w-full h-72 shrink-0 mb-2">
              <HeroImageContent
                kind="image"
                url={post.mainImage.asset.url}
                alt={post.mainImage.alt ?? post.title}
                themeBg="bg-muted/33"
                priority
              />
            </div>
          )}

          {/* Featured Content */}
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="ghost" className={`text-xs font-black uppercase tracking-widest ${theme.text} bg-transparent border-0 px-0`}>
                {category}
              </Badge>
              <div className="h-1 w-1 rounded-full bg-foreground/30" />
              <time className="text-xs font-semibold uppercase tracking-widest text-metadata">{formatDate(post.publishedAt)}</time>
            </div>
            <h2
              className={`mt-4 text-2xl md:text-4xl font-extrabold text-foreground leading-tight text-shadow-sm transition-colors ${theme.groupHoverText}`}
            >
              {post.title}
            </h2>
            <p className="text-metadata mt-4 leading-relaxed line-clamp-3">{post.metaDescription}</p>
          </div>
        </Card>
      </Link>
    </div>
  );
}
