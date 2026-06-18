"use client";
import { cn } from "@/lib/shadcn/utils";

export default function WhatIDo() {
  return (
    <section className="p-8 md:p-12 space-y-6">
      <header className="space-y-2">
        <h3 className="text-xl font-black tracking-tighter uppercase italic bg-linear-to-r from-emerald via-platinum to-topaz bg-clip-text text-transparent">
          The Craft of the Forge
        </h3>
        <div className="h-1 w-20 bg-linear-to-r from-emerald to-transparent rounded-full" />
      </header>

      <div className="space-y-4 text-foreground/80 leading-relaxed text-sm md:text-base lg:text-lg">
        <p>
          I offer a unique blend of <strong>IT Wizardry</strong> and <strong>Digital Stewardship</strong>. My work is focused on architecting robust systems that stand the test of time, much like the structural integrity of the metals that inspire my design.
        </p>

        <h4>Web Architecture & Design</h4>
        <p>
          I craft visually stunning, highly performant web experiences using <strong>Next.js</strong> and <strong>Tailwind CSS</strong>. By mapping custom OKLCH theme variables to the <strong>shadcn/ui</strong> schema, I create design systems that are not only beautiful but also mathematically consistent and easy for both humans and AI agents to work with.
        </p>

        <hr className="border-border/10 my-6" />

        <h4>IT Support & System Mastery</h4>
        <p>
          Beyond the frontend, I possess a deep understanding of the &quot;machinery&quot; below. My experience as an <strong>IT Support Specialist</strong> for large-scale manufacturers has given me the expertise to handle server management, digital administration, and complex technical troubleshooting.
        </p>
        <p>
          Whether it&apos;s <strong>web scraping</strong> for data analysis, managing secure <strong>hosting environments</strong>, or integrating <strong>CMS </strong> to deliver professional editing experiences, I ensure that every digital &quot;alloy&quot; I create is stable, secure, and intuitive for the end-user.
        </p>

        <p className="italic text-foreground/60 border-l-2 border-emerald/30 pl-4 mt-6">
          I am currently focused on a <strong>Unification Project</strong>, leveraging APIs to aggregate personal media data into a centralized, custom-built vault.
        </p>
      </div>
    </section>
  );
}
