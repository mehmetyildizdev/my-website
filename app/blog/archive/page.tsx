import React from "react";
import Link from "next/link";
import ArchiveClient from "../../../components/blog/ArchiveClient";
import { MoveLeft } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/shadcn/ui/button";

export const metadata: Metadata = {
  title: "Archive | Mehmet Yildiz Blog",
  description: "Browse the full collection of articles on development, design, and more.",
  alternates: {
    canonical: "/blog/archive",
  },
};

import { getAllPosts } from "@/lib/post";

async function getPosts(): Promise<Post[]> {
  try {
    return await getAllPosts();
  } catch (error) {
    console.error("Error fetching posts", error);
    return [];
  }
}

export default async function ArchivePage() {
  const posts = await getPosts();

  return (
    <section className="bg-diamond relative overflow-hidden min-h-screen">

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-24 sm:px-12 lg:px-16">
        <Button variant="glass" size="sm" asChild className="w-fit rounded-full bg-foreground/30 text-background hover:text-foreground text-shadow-sm">
          <Link
            href="/blog"
            aria-label="Back to blog"
            className="group inline-flex items-center gap-1"
          >
            <MoveLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Compendium
          </Link>
        </Button>
        <header className="flex flex-col gap-4 text-left">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-sapphire drop-shadow-sm">
            Archive
          </p>
          <h1 className="text-4xl font-black tracking-tight text-gold md:text-5xl text-shadow-lg">
            All Posts
          </h1>
          <p className="text-lg text-foreground/80 font-medium max-w-2xl text-shadow-sm">
            Browse through everything published so far. Keep scrolling to discover more content.
          </p>
        </header>

        <ArchiveClient allPosts={posts} />
      </div>
    </section>
  );
}
