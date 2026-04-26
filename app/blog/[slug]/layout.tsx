import React from "react";
import Sidebar from "@/components/blog/Sidebar";
import { ShareBar } from "@/components/blog/ShareBar";
import { notFound } from "next/navigation";
import {
  resolveParams,
  type BlogPostPageParams,
} from "@/lib/post/utils/params";
import { getPostPageData } from "@/lib/post/utils/postData";
import { client } from "@/sanity/lib/client";
import { fetchCategoriesWithCount } from "@/sanity/lib/structureUtils";
import { getCategoryTheme } from "@/lib/post/categoryBasedSelector";

export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: BlogPostPageParams;
}) {
  const { slug } = await resolveParams(params);

  if (!slug) {
    notFound();
  }

  const [pageData, allCategories] = await Promise.all([
    getPostPageData(slug),
    fetchCategoriesWithCount(client),
  ]);

  const { post, shareLinks } = pageData;
  const { text: categoryTextColor } = getCategoryTheme(post.categories?.[0]?.title);

  return (
    <div id="post" className="py-8 lg:py-16">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-0 bg-pearl">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 mt-12 divide-x divide-border/40 bg-obsidian/20">
          {/* Main Content */}
          <main className="col-span-1 lg:col-span-9 p-3 bg-pearl/75 ">
            {children}
          </main>

          {/* Sidebar Container */}
          <aside className="relative col-span-1 lg:col-span-3 bg-pearl/50 ">
            <Sidebar
              author={post.author ?? null}
              allCategories={allCategories}
              categories={post.categories ?? []}
            />

            {/* Float-attached Share Bar */}
            <div className="hidden lg:block absolute left-full top-0 h-full ml-4">
              <div className="sticky top-36">
                <ShareBar
                  shareLinks={shareLinks}
                  categoryTextColor={categoryTextColor}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
