"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryTheme } from "@/lib/post/categoryBasedSelector";
import { formatDate } from "@/lib/post";



export function FilteredPostsClient({ allPosts, defaultCat = "Insight" }: { allPosts: Post[], defaultCat?: string }) {
  // Extract unique categories from posts, default to ["Insight"] if none exist
  const categoriesSet = new Set<string>();
  allPosts.forEach(post => {
    if (post.categories && post.categories.length > 0) {
      post.categories.forEach(cat => categoriesSet.add(cat.title));
    }
  });
  const allCategories = Array.from(categoriesSet).sort();

  // State for active category. If the default category exists, use it, else use the first available, or a fallback.
  const initialCategory = allCategories.includes(defaultCat) ? defaultCat : (allCategories[0] || "All");
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return allPosts.slice(0, 4); // Fallback for no filtering but max 4
    const filtered = allPosts.filter(post =>
      post.categories?.some(cat => cat.title.toLowerCase() === activeCategory.toLowerCase())
    );
    return filtered.slice(0, 4); // Limit to 4 random/latest posts
  }, [allPosts, activeCategory]);

  if (allPosts.length === 0) return null;

  return (
    <div className="w-full">
      {/* Category Filter Buttons */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-8">
          {allCategories.map((cat) => {
            const { bg, text } = getCategoryTheme(cat);
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-label={`Filter posts by category: ${cat}`}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 shadow-sm hover:scale-105 ${isActive
                  ? `${bg} text-background shadow-md`
                  : `bg-card/60 ${text} border border-white/10 hover:bg-card/90`
                  }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Grid of 4 Posts */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filteredPosts.map((post) => {
          const catTitle = post.categories?.[0]?.title;
          const { bg: catBg, text: catText } = getCategoryTheme(catTitle);

          return (
            <Link href={`/blog/post/${post.slug.current}`} key={post._id}>
              <article
                className="group relative flex flex-col rounded-3xl border border-border/20 bg-pearl/60 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-card/60"
              >
                {post.mainImage?.asset?.url && (
                  <div className="relative mb-4 w-full h-32 overflow-hidden rounded-2xl bg-muted/20">
                    <Image
                      src={post.mainImage.asset.url}
                      alt={post.mainImage.alt ?? post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>
                )}

                <time className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/50">
                  {formatDate(post.publishedAt)}
                </time>

                <h4 className="mt-2 text-lg font-bold text-foreground leading-snug drop-shadow-sm transition-colors group-hover:text-sapphire line-clamp-2">

                  {post.title}

                </h4>

                <div className="mt-auto pt-4 flex items-center justify-between z-10">
                  {catTitle ? (
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] ${catBg} text-background shadow-sm`}>
                      {catTitle}
                    </span>
                  ) : (
                    <span />
                  )}

                  <span className={`font-bold text-xs ${catText} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                    Read <span aria-hidden="true" className="text-base leading-none">→</span>
                  </span>
                </div>
              </article>
            </Link>
          );
        })}
        {filteredPosts.length === 0 && (
          <div className="col-span-full py-8 text-center text-foreground/50 italic text-sm">
            No posts found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
