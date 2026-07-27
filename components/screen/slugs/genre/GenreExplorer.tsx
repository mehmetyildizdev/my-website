// components/screen/slugs/genre/GenreExplorer.tsx
// Interactive sandbox to preview the genre background system: a gallery of every
// single genre, a set of curated layered combos, plus a live composer where you
// can toggle genres on/off and watch the modular layers blend in real time.
//
// Now supports toggling between "container" and "bg" motif variants.

"use client";

import { useState, useMemo } from "react";
import GenreBackground from "./GenreBackground";
import { GENRE_THEMES, getGenreTheme, TOKEN_VAR } from "./genreThemes";

const ALL_GENRES = Object.entries(GENRE_THEMES).map(([key, t]) => ({ key, label: t.label }));

const COMBOS: { label: string; genres: string[] }[] = [
  { label: "Sci-Fi + Action", genres: ["Science Fiction", "Action"] },
  { label: "Horror + Mystery + Thriller", genres: ["Horror", "Mystery", "Thriller"] },
  { label: "Fantasy + Adventure + Family", genres: ["Fantasy", "Adventure", "Family"] },
  { label: "Drama + Romance + Music", genres: ["Drama", "Romance", "Music"] },
  { label: "Crime + Thriller + Drama", genres: ["Crime", "Thriller", "Drama"] },
  { label: "War + History + Documentary", genres: ["War", "History", "Documentary"] },
  { label: "Comedy + Family + Animation", genres: ["Comedy", "Family", "Animation"] },
  { label: "SciFi + Action + Thriller + Drama", genres: ["Science Fiction", "Action", "Thriller", "Drama"] },
];

const ALCHEMY_COLORS = [
  { name: "diamond", label: "Diamond", type: "gemstone" },
  { name: "pearl", label: "Pearl", type: "gemstone" },
  { name: "obsidian", label: "Obsidian", type: "gemstone" },
  { name: "emerald", label: "Emerald", type: "gemstone" },
  { name: "sapphire", label: "Sapphire", type: "gemstone" },
  { name: "ruby", label: "Ruby", type: "gemstone" },
  { name: "amethyst", label: "Amethyst", type: "gemstone" },
  { name: "topaz", label: "Topaz", type: "gemstone" },
  { name: "platinum", label: "Platinum", type: "metal" },
  { name: "titanium", label: "Titanium", type: "metal" },
  { name: "gold", label: "Gold", type: "metal" },
  { name: "silver", label: "Silver", type: "metal" },
  { name: "quicksilver", label: "Quicksilver", type: "metal" },
];

function Tile({
  genres,
  label,
  animated,
  bgColor,
  variant,
}: {
  genres: { name: string }[];
  label: string;
  animated: boolean;
  bgColor: string;
  variant: "container" | "repeat";
}) {
  const isLight = ["pearl", "gold", "silver"].includes(bgColor);
  return (
    <div
      className={`relative h-44 overflow-hidden rounded-2xl border transition-all ${
        isLight
          ? "border-obsidian/10 text-obsidian"
          : "border-border/15 text-foreground"
      }`}
      style={{
        backgroundColor: `var(--color-${bgColor})`,
      }}
    >
      <GenreBackground genres={genres} animated={animated} intensity={isLight ? 0.75 : 1} variant={variant} />
      <div className="absolute inset-0 flex items-end p-3 pointer-events-none">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm shadow-sm ${
          isLight
            ? "bg-pearl/80 border border-obsidian/10 text-obsidian"
            : "bg-background/70 border border-border/10 text-titanium"
        }`}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function GenreExplorer() {
  const [animated, setAnimated] = useState(true);
  const [selected, setSelected] = useState<string[]>(["Science Fiction", "Action"]);
  const [bgColor, setBgColor] = useState<string>("diamond");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [variant, setVariant] = useState<"container" | "repeat">("container");

  const toggle = (label: string) =>
    setSelected((prev) => (prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]));

  // De-duplicate genres by canonical label for the live composer.
  const uniqueLabels = useMemo(() => {
    return Array.from(new Map(ALL_GENRES.map((g) => [g.label, g])).values());
  }, []);

  // Group unique labels by token
  const groupedUnique = useMemo(() => {
    const groups: Record<string, typeof uniqueLabels> = {
      ruby: [],
      sapphire: [],
      emerald: [],
      amethyst: [],
      topaz: [],
    };
    uniqueLabels.forEach((g) => {
      const theme = getGenreTheme(g.label);
      if (groups[theme.token]) {
        groups[theme.token].push(g);
      } else {
        groups[theme.token] = [g];
      }
    });
    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [uniqueLabels]);

  const isLightBg = ["pearl", "gold", "silver"].includes(bgColor);

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-poppins text-3xl font-bold text-gold">Genre Backgrounds</h1>
          <p className="mt-2 max-w-2xl text-sm text-quicksilver">
            Each genre is an independent layer — a tinted SVG motif anchored to its own quadrant plus a blended glow.
            Stack several and they compose into a new, title-specific backdrop without turning into noise.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setVariant((v) => (v === "container" ? "repeat" : "container"))}
            className="rounded-full border border-border/30 bg-card/50 px-4 py-1.5 text-xs font-medium text-quicksilver backdrop-blur-sm transition-colors hover:border-gold/50 hover:text-gold cursor-pointer"
          >
            Variant: {variant === "container" ? "Container" : "Repeat"}
          </button>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="rounded-full border border-border/30 bg-card/50 px-4 py-1.5 text-xs font-medium text-quicksilver backdrop-blur-sm transition-colors hover:border-gold/50 hover:text-gold cursor-pointer flex items-center gap-1.5 capitalize"
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: `var(--color-${bgColor})` }} />
              BG: {bgColor}
            </button>
            {showColorPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
                <div className="absolute right-0 mt-2 z-50 w-64 rounded-2xl border border-border/20 bg-background/95 p-3 shadow-xl backdrop-blur-md">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-quicksilver">Gemstones</div>
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {ALCHEMY_COLORS.filter(c => c.type === "gemstone").map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          setBgColor(color.name);
                          setShowColorPicker(false);
                        }}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-card/50 cursor-pointer ${
                          bgColor === color.name ? "bg-card font-semibold text-gold" : "text-quicksilver"
                        }`}
                      >
                        <span className="inline-block w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: `var(--color-${color.name})` }} />
                        {color.label}
                      </button>
                    ))}
                  </div>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-quicksilver">Metals</div>
                  <div className="grid grid-cols-2 gap-1">
                    {ALCHEMY_COLORS.filter(c => c.type === "metal").map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          setBgColor(color.name);
                          setShowColorPicker(false);
                        }}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-card/50 cursor-pointer ${
                          bgColor === color.name ? "bg-card font-semibold text-gold" : "text-quicksilver"
                        }`}
                      >
                        <span className="inline-block w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: `var(--color-${color.name})` }} />
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="rounded-full border border-border/30 bg-card/50 px-4 py-1.5 text-xs font-medium text-quicksilver backdrop-blur-sm transition-colors hover:border-gold/50 hover:text-gold cursor-pointer"
          >
            Fullscreen Live Preview
          </button>
          <button
            type="button"
            onClick={() => setAnimated((a) => !a)}
            className="rounded-full border border-border/30 bg-card/50 px-4 py-1.5 text-xs font-medium text-quicksilver backdrop-blur-sm transition-colors hover:border-gold/50 hover:text-gold cursor-pointer"
          >
            {animated ? "Pause motion" : "Enable motion"}
          </button>
        </div>
      </header>

      {/* ── Live composer ───────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-poppins text-xl font-semibold text-sapphire">Live Composer</h2>
        <div className="flex flex-col gap-4">
          {groupedUnique.map(([token, items]) => {
            const tokenColor = TOKEN_VAR[token as keyof typeof TOKEN_VAR];
            return (
              <div key={token} className="flex flex-col gap-1.5 border border-border/10 rounded-xl p-3 bg-pearl/5">
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: tokenColor }}>
                  {token}
                </span>
                <div className="flex flex-wrap gap-2">
                  {items.map((g) => {
                    const isSelected = selected.includes(g.label);
                    return (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => toggle(g.label)}
                        className="rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer"
                        style={{
                          borderColor: isSelected ? tokenColor : "rgba(255,255,255,0.1)",
                          backgroundColor: isSelected ? `color-mix(in oklch, ${tokenColor}, transparent 85%)` : "rgba(30,30,30,0.4)",
                          color: isSelected ? tokenColor : "var(--quicksilver)",
                        }}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className={`relative h-72 overflow-hidden rounded-3xl border transition-all ${
          isFullscreen ? "fixed inset-0 z-50 h-screen rounded-none" : ""
        } ${
          isLightBg
            ? "border-obsidian/10 text-obsidian"
            : "border-border/15 text-foreground"
        }`}
        style={{
          backgroundColor: `var(--color-${bgColor})`,
        }}>
          <GenreBackground genres={selected.map((name) => ({ name }))} animated={animated} intensity={isLightBg ? 0.7 : 1} variant={variant} />
          <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
            <div className={`max-w-md text-center p-5 rounded-xl backdrop-blur-md border ${
              isLightBg
                ? "bg-pearl/60 border-obsidian/10 text-obsidian"
                : "bg-background/60 border-border/10 text-foreground"
            }`}>
              <h3 className="text-lg font-bold mb-2 font-poppins">Composed View</h3>
              <p className="text-xs leading-relaxed opacity-90">
                Sample body copy sits on top of the composed background so you can judge readability.
                {selected.length === 0 && " (Select at least one genre.)"}
              </p>
            </div>
          </div>
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 rounded-full border border-border/30 bg-background/80 px-4 py-1.5 text-xs font-semibold hover:border-gold/50 cursor-pointer shadow-lg text-foreground"
            >
              Exit Fullscreen
            </button>
          )}
        </div>
      </section>

      {/* ── Curated combos ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-poppins text-xl font-semibold text-emerald">Curated Combinations</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COMBOS.map((c) => (
            <Tile key={c.label} label={c.label} genres={c.genres.map((name) => ({ name }))} animated={animated} bgColor={bgColor} variant={variant} />
          ))}
        </div>
      </section>

      {/* ── Every single genre ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-poppins text-xl font-semibold text-amethyst">Every Genre</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {uniqueLabels.map((g) => (
            <Tile key={g.label} label={g.label} genres={[{ name: g.label }]} animated={animated} bgColor={bgColor} variant={variant} />
          ))}
        </div>
      </section>
    </div>
  );
}
