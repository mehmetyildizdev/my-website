// components/screen/slugs/detail/Overview.tsx
// Synopsis block with a large opening drop-glyph and a comfortable measure for
// reading. Sits inside a SectionShell-styled frame but managed locally so the
// quote bar can hug the text.

interface OverviewProps {
  text: string;
}

export default function Overview({ text }: OverviewProps) {
  const trimmed = text.trim();
  const spaceIdx = trimmed.indexOf(' ');
  const firstWord = spaceIdx !== -1 ? trimmed.slice(0, spaceIdx) : trimmed;
  const restText = spaceIdx !== -1 ? trimmed.slice(spaceIdx) : '';

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <span className="h-7 w-1 rounded-full bg-linear-to-b from-gold to-transparent" />
        <div>
          <h2 className="font-poppins text-lg md:text-xl font-semibold text-obsidian dark:text-gold leading-none">Overview</h2>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-quicksilver">Synopsis</p>
        </div>
      </div>
      <div className="relative max-w-3xl rounded-2xl border border-border/10 bg-card/40 p-5 md:p-6 backdrop-blur-sm">
        <span className="float-left mr-2 font-poppins text-4xl md:text-5xl font-bold leading-[0.8] text-obsidian/40 dark:text-gold/40 select-none">
          {firstWord}
        </span>
        <p className="text-[15px] leading-relaxed text-foreground/90">{restText}</p>
      </div>
    </section>
  );
}
