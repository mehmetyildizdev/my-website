"use client";
import { cn } from "@/lib/shadcn/utils";

export default function AboutMe() {
  return (
    <section className="p-8 md:p-12 space-y-6">
      <header className="space-y-2">
        <h3 className="text-xl font-black tracking-tighter uppercase italic bg-linear-to-r from-amethyst via-platinum to-sapphire bg-clip-text text-transparent">
          The First Spark
        </h3>
        <div className="h-1 w-20 bg-linear-to-r from-amethyst to-transparent rounded-full" />
      </header>

      <div className="space-y-4 text-foreground/80 leading-relaxed text-sm md:text-base lg:text-lg">
        <p>
          I am a Digital Alchemist hailing from Turkey, where my journey into the intricate world of technology began over two decades ago.
          It started in the year 2000 with my first computer, a machine that felt like an uncharted territory to explore every day with excitement.
        </p>
        <p>
          By middle school, I was already diving into the depths of Photoshop and video editing, nurturing a passion for the visual and the technical in equal measure. This early curiosity wasn&apos;t just about creativity but understanding the mechanics behind the screen.
        </p>
        
        <hr className="border-border/10 my-6" />
        
        <h4>The Academic Crucible</h4>
        <p>
          My path took a fascinating turn toward the <strong>History of Sciences</strong>. My university years were spent studying the evolution of human thought and discovery, a field where I honed my skills in <strong>rigorous research</strong> and the pursuit of deeper knowledge.
        </p>
        <p>
          This academic foundation instilled in me a &quot;researcher&quot; mindset that I carry into my development work today. I don&apos;t just look for answers; I seek to understand the history and logic of the tools I use.
        </p>

        <hr className="border-border/10 my-6" />

        <h4>Continuous Evolution</h4>
        <p>
          Today, my forge is powered by a relentless drive for <strong>continuous learning</strong>. Whether I&apos;m exploring new tools or diving into integrations between applications, I treat every project as a new field of research.
        </p>
        <p>
          My &quot;alchemical&quot; skill set blends technical mastery with creative intuition:
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm md:text-base text-foreground/70 list-none pt-2">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amethyst" />
            Frontend Architecture
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sapphire" />
            Deep Technical Research
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-platinum" />
            System Administration
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amethyst" />
            Data Analysis & Scraping
          </li>
        </ul>
        
        <p className="italic text-foreground/60 border-l-2 border-amethyst/30 pl-4 mt-6">
          I am perpetually seeking the &quot;Great Work&quot; that perfect synthesis of stable engineering and breathtaking design.
        </p>
      </div>
    </section>
  );
}
