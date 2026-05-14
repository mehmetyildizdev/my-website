import Link from "next/link";
import ArchiveClient from "@/components/blog/ArchiveClient";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";

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
    <div className="flex flex-col gap-12">
      <Button variant="link" size="sm" asChild className="w-fit rounded-full text-platinum text-shadow-sm">
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

      <ArchiveClient allPosts={posts} layout="grid" />
    </div>
  );
}
