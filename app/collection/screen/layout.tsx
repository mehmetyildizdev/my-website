import React from "react";
import ScreenSidebar from "@/components/screen/dashboard/ScreenSidebar";
import { NowPlayingProvider } from "@/components/screen/now-playing/NowPlayingContext";
import { createScreenLayoutMetadata } from "@/lib/screen/seo";

export const metadata = createScreenLayoutMetadata();

export default function ScreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NowPlayingProvider>
      <div className="min-h-screen bg-background text-foreground font-rubik selection:bg-selection">
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-16">
          <div className="flex flex-col 2xl:flex-row gap-6 2xl:gap-8">
            {/* Sticky sidebar navigation — desktop only */}
            <ScreenSidebar />
            {/* Main content — full width */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </NowPlayingProvider>
  );
}
