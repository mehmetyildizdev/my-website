import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive | Compendium of Insight",
  description: "Explore the full history of the Mehmet Yildiz Blog. A complete list of all articles and thoughts published so far.",
  alternates: {
    canonical: "/blog/archive",
  },
  openGraph: {
    title: "Archive | Mehmet Yildiz Blog",
    description: "Complete list of all articles and insights.",
    url: "https://mehmetyildiz.dev/blog/archive",
    siteName: "Mehmet Yildiz Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive | Mehmet Yildiz",
    description: "Full archive of articles and thoughts.",
  },
};

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="archive-layout" className="py-8 lg:py-16 bg-diamond min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-0">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 mt-12">
          <main className="col-span-1 lg:col-span-12 p-3 text-foreground/90">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
