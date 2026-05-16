"use client";
import { useState } from "react";
import Link from "next/link";
import {
  SiVercel,
  SiShadcnui,
  SiTailwindcss,
  SiSanity,
  SiTrakt,
  SiGoogleanalytics,
  SiThemoviedatabase,
} from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";
import { cn } from "@/lib/shadcn/utils";

const paletteGroups = [
  {
    title: "Noble Metals",
    textColor: "text-pearl",
    elements: [
      { name: "Titanium", className: "bg-titanium", desc: "Strength" },
      { name: "Platinum", className: "bg-platinum", desc: "Nobility" },
      { name: "Gold", className: "bg-gold", desc: "Perfection" },
      { name: "Silver", className: "bg-silver", desc: "Reflection" },
      { name: "Quicksilver", className: "bg-quicksilver", desc: "Fluidity" },
    ],
  },
  {
    title: "Substrates",
    textColor: "text-platinum",
    elements: [
      { name: "Diamond", className: "bg-diamond", desc: "Pureness" },
      { name: "Pearl", className: "bg-pearl", desc: "Wisdom" },
      { name: "Obsidian", className: "bg-obsidian", desc: "Depth" },
    ],
  },
  {
    title: "Ethereal Gems",
    textColor: "text-platinum",
    elements: [
      { name: "Sapphire", className: "bg-sapphire", desc: "Calm" },
      { name: "Ruby", className: "bg-ruby", desc: "Vitality" },
      { name: "Amethyst", className: "bg-amethyst", desc: "Clarity" },
      { name: "Emerald", className: "bg-emerald", desc: "Growth" },
      { name: "Topaz", className: "bg-topaz", desc: "Energy" },
    ],
  },
];

export default function MyWebsite() {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  return (
    <section className="flex flex-col xl:flex-row bg-background/50">
      {/* Left Content: The Lore & Tech */}
      <div className="xl:w-3/5 2xl:w-4/5 p-8 md:p-12 flex flex-col">
        <header className="space-y-2">
          <h3 className="text-xl font-black tracking-tighter uppercase italic bg-linear-to-r from-gold via-platinum to-silver bg-clip-text text-transparent">
            Digital Mining Site
          </h3>
          <div className="h-1 w-20 mb-4 bg-linear-to-r from-gold to-transparent rounded-full" />
        </header>

        <div className="space-y-4 text-foreground/80 leading-relaxed text-sm md:text-base lg:text-lg">
          <h4>Behind the Design</h4>
          <p>
            I read many classical books in my childhood, but <em>The Alchemist</em> was one of the few that truly stuck with me—so much so that chemistry and geometry became my favorite subjects leading up to university. As a history of sciences enthusiast, I&apos;ve always fascinated by the roles that minerals, metals, and gems play across different disciplines.
          </p>
          <p>
            As a passionate RPG enjoyer, this connection brought extra joy, as these exact &quot;materials&quot; often form the core elements of gaming worlds. While exploring color palettes in Adobe, I asked myself: <em>&quot;Why not build a design system based on these materials?&quot;</em>
          </p>
          <p>
            Then, I noticed how Tailwind CSS handles color transformations mathematically on the client. Diving deeper into modern color theory, I migrated the entire system to the <strong>OKLCH color space</strong>. The result is a palette where every hue feels perceptually balanced and deeply integrated into the theme, covering the full spectrum of the color wheel while maintaining visual harmony.
          </p>

          <hr className="border-border/10 my-6" />

          <h4>The Turning Wheels</h4>
          <p>
            The technical architecture of this site went through its own evolution. Today, the site runs on <strong>Next.js</strong>, which provides the agility and seamless integration capabilities I need. I pair it with <strong>Tailwind CSS</strong> and <strong>shadcn/ui</strong>. Adapting my custom OKLCH theme variables to the shadcn schema has been a game-changer, especially for allowing AI agents to modify and write components with strict consistency.
          </p>
          <p>
            Instead of building a rigid internal content management system, I opted for <strong>Sanity CMS</strong>, a headless platform. Utilizing a decoupled, professional CMS allows me to practice delivering intuitive, secure, and time-efficient editing experiences—keeping the core code safe from accidental &quot;fiddling.&quot;
          </p>

          <hr className="border-border/10 my-6" />

          <h4>Open Source & The Unification Project</h4>
          <p>
            Knowledge is a universal commodity that gains value only when it is shared. I try my best to lean toward <strong>open-source</strong> technologies because I believe the &quot;Great Work&quot; of digital progress is a collaborative effort. By building on these platforms, I am standing on the shoulders of giants, aiming to contribute back to that collective wisdom.
          </p>
          <p>
            Currently, I am working on a personal <strong>Unification Project</strong> to aggregate my various media hobbies into a centralized, custom database—leveraging the <strong>Trakt.tv API</strong> and <strong>TMDB</strong>. My goal is to build environments that are sustainable, performant, and accessible, where the complexity of the machine remains hidden, leaving the user with an experience as clear as a well-cut gemstone.
          </p>

          <hr className="border-border/10 my-6" />

          <h4>Venture Deeper</h4>
          <p>
            I welcome you to explore more in my website. Below are some quick links. Please feel free to connect or reach out if you have any questions.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/blog"
              className="px-4 py-2 bg-obsidian/20 hover:bg-gold/10 border border-gold/20 rounded-lg text-sm font-bold tracking-widest uppercase transition-all hover:-translate-y-1"
            >
              The Blog
            </Link>
            <Link
              href="/collection"
              className="px-4 py-2 bg-obsidian/20 hover:bg-gold/10 border border-gold/20 rounded-lg text-sm font-bold tracking-widest uppercase transition-all hover:-translate-y-1"
            >
              The Collection
            </Link>
            <Link
              href="/privacy"
              className="px-4 py-2 bg-obsidian/20 hover:bg-gold/10 border border-gold/20 rounded-lg text-sm font-bold tracking-widest uppercase transition-all hover:-translate-y-1"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Tech Stack Logos */}
        <div className="flex flex-wrap items-center gap-6 pt-12">
          <div className="flex flex-col items-center group">
            <SiVercel className="text-3xl hover:text-platinum transition-colors" />
            <span className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Vercel</span>
          </div>
          <div className="flex flex-col items-center group">
            <TbBrandNextjs className="text-3xl hover:text-platinum transition-colors duration-300" />
            <span className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Next.js</span>
          </div>
          <div className="flex flex-col items-center group">
            <SiTailwindcss className="text-3xl text-teal-600 hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Tailwind</span>
          </div>
          <div className="flex flex-col items-center group">
            <SiShadcnui className="text-3xl hover:text-platinum transition-colors" />
            <span className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Shadcn</span>
          </div>
          <div className="flex flex-col items-center group">
            <SiSanity className="text-3xl text-ruby hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Sanity</span>
          </div>
          <div className="flex flex-col items-center group">
            <SiTrakt className="text-3xl text-ruby hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Trakt</span>
          </div>
          <div className="flex flex-col items-center group">
            <SiThemoviedatabase className="text-3xl text-cyan-400 hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">TMDB</span>
          </div>
          <div className="flex flex-col items-center group">
            <SiGoogleanalytics className="text-3xl text-orange-500 hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Analytics</span>
          </div>
        </div>
      </div>

      {/* Right Content: The Alchemical Palette (Strip Layout) */}
      <div className="xl:w-2/5 2xl:w-1/5 bg-obsidian/10 border-l border-border/20 p-4 flex flex-col space-y-6">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] light:text-gold text-gold/60 mb-2">Elemental Palette</h4>
          <p className="text-[10px] text-foreground/40 italic">Sorted by Alchemical Type</p>
        </div>

        {paletteGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h5 className="text-[10px] font-bold uppercase text-platinum/50">{group.title}</h5>
            <div className="flex flex-col gap-1">
              {group.elements.map((element) => (
                <div
                  key={element.name}
                  className={cn(
                    "group relative h-10 w-full rounded-md cursor-help transition-all duration-300 border border-border/5 overflow-hidden",
                    element.className,
                    hoveredElement === element.name ? "ring-1 ring-gold/50 z-10" : "opacity-90 hover:opacity-100"
                  )}
                  onMouseEnter={() => setHoveredElement(element.name)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Label (Visible on hover or narrow) */}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-between px-3 transition-opacity duration-300 backdrop-blur-[1px]",
                    hoveredElement === element.name ? "opacity-100" : "opacity-0"
                  )}>
                    <span className={cn("text-[11px] font-bold uppercase tracking-tighter", group.textColor)}>{element.name}</span>
                    <span className={cn("text-[9px] tracking-tighter", group.textColor)}>{element.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Legend / Status */}
        <div className="mt-auto pt-6 border-t border-border/10">
          <p className="text-[9px] text-foreground/30 leading-snug text-center italic">
            Forged in OKLCH
          </p>
        </div>
      </div>
    </section>
  );
}
