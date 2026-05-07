import Link from "next/link";
import Image from "next/image";
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
import { ExternalLink, Sparkles } from "lucide-react";
import { LegacyLightbox } from "@/components/collection/LegacyLightbox";
import { legacyDesigns } from "@/lib/collection/data";

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

/* ─────────────────────────────────────────────────────────────
   Data — swap image paths or descriptions any time
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   Data — swap image paths or descriptions any time
───────────────────────────────────────────────────────────── */

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
    <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
      <h2 className="text-3xl font-black text-foreground">{label}</h2>
      {href && hrefLabel && (
        <Link
          href={href}
          className="text-sm font-bold uppercase tracking-widest text-link hover:text-link-hover transition-colors duration-200 z-10 relative"
        >
          {hrefLabel} →
        </Link>
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
          <h1 className="text-5xl font-black tracking-tight md:text-6xl text-shadow-lg">
            Collection
          </h1>
          <p className="text-lg font-medium text-shadow-sm">
            Software projects, legacy web designs, and things still in the oven.
          </p>
        </header>

        {/* ════════════════════════════════════════════════════════════
            A. FEATURE HERO — MemoVolume
        ════════════════════════════════════════════════════════════ */}
        <div id="memovolume">
          <SectionDivider label="Featured Project" />

          {/* Hero card */}
          <article className="relative overflow-hidden rounded-4xl border border-border/20 bg-pearl/80 shadow-2xl backdrop-blur-md transition-all duration-500 hover:bg-card/90 hover:shadow-gold/10 hover:border-gold/20">

            {/* Accent gradient strip behind content */}
            <div className="absolute inset-0 bg-linear-to-tl from-silver/25 via-transparent to-pearl pointer-events-none" />

            <div className="relative grid lg:grid-cols-12 gap-0">

              {/* Left Column (Image & Main Description) - Spans 8 cols */}
              <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-border/20">
                {/* 16:9 Image */}
                <div className="relative w-full aspect-video bg-obsidian/10 border-b border-border/20 overflow-hidden lg:rounded-tl-4xl">
                  {/* Corner Wrap Badge */}
                  <div className="absolute top-6 -right-16 z-20 w-56 rotate-45 bg-sapphire/50 backdrop-blur-md border-y border-sapphire/40 text-foreground text-[10px] font-black tracking-widest uppercase py-2 shadow-xl flex items-center justify-center gap-2 pointer-events-auto">
                    <FaMicrosoft className="text-xs" />
                    Windows 11
                  </div>

                  {/* Dark Mode Image */}
                  <Image
                    src="/collection/memovolume/memovolume_wide_dark_720.webp"
                    alt="MemoVolume App"
                    fill
                    className="hidden dark:block object-cover object-top"
                    sizes="(max-width: 1920px) 100vw, 100vw"
                    loading='eager'
                    priority
                  />
                  {/* Light Mode Image */}
                  <Image
                    src="/collection/memovolume/memovolume_wide_light_720.webp"
                    alt="MemoVolume App"
                    fill
                    className="block dark:hidden object-cover object-top"
                    sizes="(max-width: 1920px) 100vw, 100vw"
                    loading='eager'
                    priority
                  />
                </div>

                {/* Description Text */}
                <div className="p-8 lg:p-10 flex flex-col gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gold mb-2">
                      WPF · .NET 10 · Desktop
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight text-shadow-sm">
                      MemoVolume
                    </h2>
                  </div>

                  <p className="text-base leading-relaxed text-metadata max-w-2xl">
                    A lightweight Windows 11 audio management utility built with
                    WPF and .NET&nbsp;10. Provides a clean, always-on-top
                    per-application volume mixer with hotkey support, system-tray
                    integration, and a design that feels native to the Windows 11
                    design language.
                  </p>
                </div>
              </div>

              {/* Right Column (Meta & Actions) - Spans 4 cols */}
              <div className="lg:col-span-4 flex flex-col justify-center gap-10 p-8 lg:p-10 bg-sapphire/5 lg:rounded-tr-4xl lg:rounded-br-4xl">

                {/* Tech Stack List */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Core Technologies</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: ".NET 10", icon: <SiDotnet className="text-amethyst" />, desc: "Framework" },
                      { label: "WPF", icon: <FaMicrosoft className="text-sapphire" />, desc: "UI Library" },
                      { label: "C#", icon: <SiSharp className="text-amethyst" />, desc: "Language" },
                    ].map((t) => (
                      <div key={t.label} className="flex items-center gap-4 p-3 rounded-xl bg-card/60 border border-border/30 shadow-sm transition-colors hover:border-sapphire/30">
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border/50 shadow-inner">
                          {t.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{t.label}</span>
                          <span className="text-[10px] uppercase tracking-widest text-metadata">{t.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3 mt-2">
                  <a
                    href="https://apps.microsoft.com/detail/9nwqjj04fgsq"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get MemoVolume on Microsoft Store"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-linear-to-tl from-sapphire/80 to-sapphire/40 text-foreground text-sm font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sapphire/30 hover:shadow-lg w-full group"
                  >
                    <FaMicrosoft className="text-base" />
                    Microsoft Store
                    <ExternalLink className="h-4 w-4 opacity-70 ml-auto group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a
                    href="https://github.com/mehmetyildizdev/MemoVolume"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View MemoVolume source code on GitHub"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border/40 bg-card/60 text-foreground text-sm font-bold backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:text-gold w-full group"
                  >
                    <FaGithub className="text-base group-hover:text-gold transition-colors" />
                    View Source
                  </a>
                </div>
              </div>

            </div>
          </article>
        </div>

        {/* ════════════════════════════════════════════════════════════
            B. SOFTWARE LIST — VoiceSync
        ════════════════════════════════════════════════════════════ */}
        <div id="software">
          <SectionDivider label="Software" />

          <article className="group relative flex flex-col sm:flex-row items-start gap-6 rounded-3xl border border-border/20 bg-pearl/60 p-6 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-card/90 hover:border-gold/20">

            {/* Icon block */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 shadow-inner">
              <FaMicrophoneAlt className="text-2xl text-gold" />
            </div>

            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gold">
                    Audio · TTS · CLI Tool
                  </p>
                  <h3 className="text-2xl font-bold text-foreground leading-snug mt-1 group-hover:text-gold transition-colors duration-200">
                    VoiceSync
                  </h3>
                </div>
                <a
                  href="https://github.com/mehmetyildizdev/voicesync"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View VoiceSync on GitHub"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/40 bg-card/60 text-foreground text-sm font-bold backdrop-blur-sm transition-all duration-200 hover:border-gold/40 hover:text-gold"
                >
                  <FaGithub className="text-base" />
                  GitHub
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-metadata max-w-2xl">
                A desktop application built with Tauri, Rust backend, and Next.js frontend.
                Generates realistic text-to-speech audio using GPT-SoVITS.
                Uses a short reference audio clip to mimic a target voice — great for generating
                consistent narration audio across content.
              </p>

              {/* Tech badges */}
              <div className="flex flex-wrap gap-2 mt-1">
                {voiceSyncTags.map((t) => (
                  <span
                    key={t.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/30 bg-card/60 text-xs font-semibold text-foreground/80"
                  >
                    {t.icon}
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* ════════════════════════════════════════════════════════════
            C. LEGACY GALLERY — WordPress Designs
        ════════════════════════════════════════════════════════════ */}
        <div id="legacy">
          <SectionDivider label="Legacy WordPress Designs" />

          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/30 bg-card/40 text-xs font-semibold text-iridium">
              <SiWordpress className="text-[#21759b]" />
              WordPress
            </span>
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

          {/* Glassmorphism teaser card */}
          <div className="relative overflow-hidden rounded-4xl border border-border/20 bg-pearl/60 shadow-2xl backdrop-blur-md">

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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-black uppercase tracking-[0.25em]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
                Coming Soon
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight text-shadow-sm">
                Screen
              </h2>

              <p className="text-base text-metadata leading-relaxed max-w-lg">
                A personal movie & TV show watch-history dashboard. Track every
                title, see genre breakdowns, rating trends, director deep-dives,
                and decade analytics — all synced via Trakt.
              </p>

              <Link
                href="/collection/screen"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sapphire/10 border border-sapphire/30 text-sapphire text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:bg-sapphire/20 hover:shadow-lg hover:shadow-sapphire/10"
                aria-label="Preview the Screen dashboard"
              >
                Preview Dashboard
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
