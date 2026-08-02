import React from 'react';
import Sidebar from '@/components/blog/Sidebar';
import { client } from '@/sanity/lib/client';
import { fetchCategoriesWithCount } from '@/sanity/lib/structureUtils';
import { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');
  // Capitalize first letter of each word for the title
  const titleCategory = decodedCategory.replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `${titleCategory} | Compendium of Insight`,
    description: `Explore the ${titleCategory} collection. A curated set of articles and thoughts on ${decodedCategory} by Mehmet Yildiz.`,
    alternates: {
      canonical: `/blog/category/${category}`,
    },
    openGraph: {
      title: `${titleCategory} | Mehmet Yildiz Blog`,
      description: `Deep dives and reflections on ${decodedCategory}.`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mehmetyildiz.dev'}/blog/category/${category}`,
      siteName: 'Mehmet Yildiz Portfolio',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleCategory} | Mehmet Yildiz`,
      description: `Articles and insights about ${decodedCategory}.`,
    },
  };
}

import { getAllPosts } from '@/lib/post';

export default async function CategoryLayout({ children, params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');

  const [allCategories, allPosts] = await Promise.all([fetchCategoriesWithCount(client), getAllPosts()]);

  // Use the author from the first post found in the system
  const sampleAuthor = allPosts[0]?.author || null;

  return (
    <div id="category" className="py-8 lg:py-16 bg-diamond min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-0">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 mt-12 divide-x divide-border/20">
          <main className="col-span-1 lg:col-span-9 p-3 text-foreground/90 bg-pearl/33">{children}</main>
          <aside className="relative col-span-1 lg:col-span-3 bg-obsidian/33">
            <Sidebar allCategories={allCategories} author={sampleAuthor} categories={[{ title: decodedCategory } as any]} />
          </aside>
        </div>
      </div>
    </div>
  );
}
