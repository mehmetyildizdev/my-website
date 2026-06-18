import Link from "next/link";
import { Metadata } from "next";
import {
  SiDotnet,
  SiWordpress,
  SiRust,
  SiTauri,
  SiSharp,
} from "react-icons/si";
import {
  FaGithub,
  FaMicrosoft,
  FaMicrophoneAlt,
  FaFilm,
  FaChartBar,
} from "react-icons/fa";
import { ExternalLink, Sparkles, Database, Cpu } from "lucide-react";
import { LegacyLightbox } from "@/components/collection/LegacyLightbox";
import { legacyDesigns } from "@/lib/collection/data";
import { Separator } from "@/components/shadcn/ui/separator";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { FeaturedProjectCard } from "@/components/collection/FeaturedProjectCard";
import { ProjectCard } from "@/components/collection/ProjectCard";

export const metadata: Metadata = {
  title: "Collection | Mehmet Yildiz",
  description:
    "A curated portfolio of projects, tools and activities — of a developer with hobbies.",
  alternates: { canonical: "/collection" },
  openGraph: {
    title: "Collection | Mehmet Yildiz",
    description:
      "Software projects, designs, activities and hobbies by Mehmet Yildiz.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collection | Mehmet Yildiz",
    description:
      "Software projects, designs, activities and hobbies by Mehmet Yildiz.",
  },
};

const voiceSyncTags = [
  { label: "Tauri", icon: <SiTauri className="text-amber-500" /> },
  { label: "Rust", icon: <SiRust className="text-orange-500" /> },
  { label: "Next.js", icon: <span className="text-black dark:text-white font-bold">N</span> },
  { label: "GPT-SoVITS", icon: <FaMicrophoneAlt className="text-topaz" /> },
];

/* ─────────────────────────────────────────────────────────────
   Section header — matches blog rhythm
───────────────────────────────────────────────────────────── */
function SectionDivider({
  label,
  href,
  hrefLabel,
}: {
  label: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between pb-4 mb-8">
      <h2 className="text-3xl font-black text-foreground">{label}</h2>
      {href && hrefLabel && (
        <Button variant="link" asChild className="text-sm font-bold uppercase tracking-widest text-link hover:text-link-hover z-10 relative no-underline hover:no-underline">
          <Link href={href}>
            {hrefLabel} →
          </Link>
        </Button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default function CollectionPage() {
  return (
    <section className="bg-diamond relative overflow-hidden">
      {/* Subtle top gradient — same as /blog */}
      <div className="absolute top-0 left-0 w-full h-36 bg-linear-to-b from-diamond via-obsidian/10 to-transparent pointer-events-none" />

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col gap-20 px-6 py-24 sm:px-12 lg:px-16">

        {/* ── Page header ───────────────────────────────────────────── */}
        <header className="flex flex-col gap-4 text-left">
          <h1 className="text-5xl font-black tracking-tight md:text-6xl text-shadow-primary">
            Collection
          </h1>
          <p className="text-lg font-medium text-shadow-sm">
            Software projects, legacy web designs, and things still in the oven.
          </p>
        </header>

        {/* ════════════════════════════════════════════════════════════
            A. FEATURE HERO
        ════════════════════════════════════════════════════════════ */}
        <div id="memovolume">
          <SectionDivider label="Featured Project" />
          <Separator className="mb-8" />

          <FeaturedProjectCard
            title="MemoVolume"
            tagline="WINDOWS 11 | UTILITY"
            description="A lightweight Windows 11 audio management utility built with WPF and .NET 10. Provides a clean, always-on-top per-application volume mixer with hotkey support, system-tray integration, and a design that feels native to the Windows 11 design language."
            darkImage="/collection/memovolume/memovolume_wide_dark_720.webp"
            lightImage="/collection/memovolume/memovolume_wide_light_720.webp"
            platformLabel="Windows 11"
            platformIcon={<FaMicrosoft className="text-xs" />}
            techStack={[
              { label: ".NET 10", icon: <SiDotnet className="text-primary" />, desc: "Framework" },
              { label: "WPF", icon: <FaMicrosoft className="text-primary" />, desc: "UI Library" },
              { label: "C#", icon: <SiSharp className="text-primary" />, desc: "Language" },
            ]}
            primaryLink="https://apps.microsoft.com/detail/9nwqjj04fgsq"
            primaryLinkLabel="Microsoft Store"
            primaryLinkIcon={<FaMicrosoft className="text-base" />}
            secondaryLink="https://github.com/mehmetyildizdev/MemoVolume"
            secondaryLinkLabel="View Source"
            secondaryLinkIcon={<FaGithub className="text-base" />}
          />
        </div>

        {/* ════════════════════════════════════════════════════════════
            B. SOFTWARE LIST
        ════════════════════════════════════════════════════════════ */}
        <div id="software" className="flex flex-col gap-8">
          <div className="w-full">
            <SectionDivider label="Software" />
            <Separator className="mb-8" />
          </div>

          <ProjectCard
            title="VoiceSync"
            tagline="GENERATIVE AI · DASHBOARD · TTS"
            description="A desktop application built with Tauri, Rust backend, and Next.js frontend. Generates realistic text-to-speech audio using GPT-SoVITS. Uses a short reference audio clip to mimic a target voice — great for generating consistent narration audio across content."
            icon={<FaMicrophoneAlt />}
            githubLink="https://github.com/mehmetyildizdev/voicesync"
            tags={[
              { label: "Tauri", icon: <SiTauri className="text-amber-500" /> },
              { label: "Rust", icon: <SiRust className="text-orange-500" /> },
              { label: "Next.js", icon: <span className="font-bold">N</span> },
              { label: "GPT-SoVITS", icon: <FaMicrophoneAlt className="text-primary" /> },
            ]}
          />

          <ProjectCard
            title="AI Chat"
            tagline="GENERATIVE AI · CHATBOT · LOCAL"
            description="A high-performance, local-first AI chat application. Built with Next.js 15 and Tauri 2.0, ensuring all your data and conversations stay securely on your local machine. Integrated with Ollama for seamless local LLM interaction."
            icon={<Sparkles />}
            githubLink="https://github.com/mehmetyildizdev/ai-chat"
            tags={[
              { label: "Tauri", icon: <SiTauri className="text-amber-500" /> },
              { label: "Rust", icon: <SiRust className="text-orange-500" /> },
              { label: "Next.js", icon: <span className="font-bold">N</span> },
              { label: "SQLite", icon: <Database className="text-primary w-3 h-3" /> },
              { label: "Ollama", icon: <Cpu className="text-emerald-500 w-3 h-3" /> },
            ]}
          />
        </div>

        {/* ════════════════════════════════════════════════════════════
            C. DESIGN GALLERY
        ════════════════════════════════════════════════════════════ */}
        <div id="legacy">
          <SectionDivider label="Legacy WordPress Designs" />
          <Separator className="mb-8" />

          <div className="mb-6 flex items-center gap-3">
            <Badge variant="subtle">
              <SiWordpress className="text-[#21759b]" />
              WordPress
            </Badge>
            <p className="text-sm text-metadata">
              Click any card to view the full-height page design in a scrollable
              lightbox.
            </p>
          </div>

          <LegacyLightbox designs={legacyDesigns} />
        </div>

        {/* ════════════════════════════════════════════════════════════
            D. ROADMAP — Screen "SOON"
        ════════════════════════════════════════════════════════════ */}
        <div id="roadmap">
          <SectionDivider label="On the Horizon" />
          <Separator className="mb-8" />

          {/* Glassmorphism teaser card */}
          <div className="relative overflow-hidden rounded-3xl border border-border/20 bg-card/66 shadow-2xl backdrop-blur-md">

            {/* Background blurred dashboard hint */}
            <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
              {/* Fake chart/grid elements to hint at dashboard content */}
              <div className="absolute inset-0 opacity-[0.07]">
                <div className="grid grid-cols-12 gap-px h-full p-6">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="bg-sapphire rounded-sm" />
                  ))}
                </div>
              </div>
              {/* Fake bar chart */}
              <div className="absolute bottom-8 left-8 flex items-end gap-2 opacity-10">
                {[45, 72, 38, 91, 62, 55, 80, 30, 67, 48].map((h, i) => (
                  <div
                    key={i}
                    className="w-6 rounded-t bg-linear-to-t from-sapphire to-amethyst"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              {/* Fake poster row */}
              <div className="absolute top-6 right-8 flex gap-2 opacity-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-14 rounded-lg bg-linear-to-b from-ruby to-amethyst"
                  />
                ))}
              </div>
            </div>

            {/* Glass overlay */}
            <div className="absolute inset-0 bg-diamond/60 backdrop-blur-sm pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-6 py-20 px-8 text-center">

              {/* Animated icon cluster */}
              <div className="flex items-center gap-3">
                <FaFilm className="text-3xl text-sapphire opacity-80" />
                <FaChartBar className="text-4xl text-gold opacity-90" />
                <Sparkles className="h-7 w-7 text-amethyst opacity-80" />
              </div>

              {/* COMING SOON badge */}
              <Badge variant="subtle" className="border-gold/33 bg-gold/10 text-gold text-xs font-black uppercase tracking-[0.25em]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
                Coming Soon
              </Badge>

              <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight text-shadow-sm">
                Screen
              </h2>

              <p className="text-base text-metadata leading-relaxed max-w-lg">
                A personal movie & TV show watch-history dashboard. Track every
                title, see genre breakdowns, rating trends, director deep-dives,
                and decade analytics — all synced via Trakt.
              </p>

              <Button variant="glass" asChild className="rounded-xl font-bold border-sapphire/33 text-sapphire hover:bg-sapphire/20 hover:shadow-lg hover:shadow-sapphire/10">
                <Link
                  href="/collection/screen"
                  aria-label="Preview the Screen dashboard"
                  className="inline-flex items-center gap-2"
                >
                  Preview Dashboard
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
