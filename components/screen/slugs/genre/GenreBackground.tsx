// components/screen/slugs/genre/GenreBackground.tsx
// Modular, layered genre background. Give it the title's genres and it composes
// one quiet textural layer per genre, each in its own tint + anchored quadrant,
// over a blended multi-radial glow. Single genre → one clean motif; many genres
// → a brand-new composite that still reads as "this title's" backdrop.
//
// Supports two motif variants:
//   "bg"        — repeating pattern, for full-page / hero backgrounds (default)
//   "container" — non-repeating corner-emphasis, for small cards / tiles
//
// Designed for text-heavy informative pages: low opacity, a single very-slow
// drift, and full `prefers-reduced-motion` opt-out (the drift simply stops).

import { getGenreTheme, TOKEN_VAR } from "./genreThemes";

interface GenreBackgroundProps {
  genres: { name: string }[];
  /** 0–1 overall intensity. Lower for very text-dense sections. */
  intensity?: number;
  /** Enable the slow drift animation (still respects reduced-motion). */
  animated?: boolean;
  /** "container" for full page/hero backgrounds (using ContainerSvg), "repeat" for cards/tiling backgrounds. */
  variant?: "container" | "repeat";
  className?: string;
}

// Per-layer motif opacity decays as more genres stack, so the composite never
// turns into noise. Capped at 4 visual layers; extra genres still tint the glow.
const MOTIF_OPACITY = [0.96, 0.69, 0.31, 0.13, 0.069];
// Literal classes (Tailwind JIT-safe). `motion-safe:` ⇒ auto-disabled under
// prefers-reduced-motion, satisfying the "not overly animated" requirement.
const DRIFTS = [
  "motion-safe:animate-motifDriftA",
  "motion-safe:animate-motifDriftB",
  "motion-safe:animate-motifDriftC",
  "motion-safe:animate-motifDriftD",
  "motion-safe:animate-motifDriftE",
];

export default function GenreBackground({
  genres,
  intensity = 1,
  animated = true,
  variant = "container",
  className = "",
}: GenreBackgroundProps) {
  const themes = (genres ?? []).map((g) => ({ name: g.name, theme: getGenreTheme(g.name) }));
  const layers = themes.slice(0, 5);

  const isContainer = variant === "container";

  // Build the blended glow: one radial per genre, summed in a single background.
  // For container variant, use genre's static corner/center coordinates.
  // For repeat variant, illuminate from center with distinct offsets, reserving true center for Drama.
  const glowLayers = layers
    .map(({ theme }, i) => {
      const isMain = ["drama", "action", "thriller", "comedy", "adventure"].includes(theme.label.toLowerCase());
      const baseAlpha = isMain ? 0.31 : 0.13;
      const alpha = (baseAlpha - i * 0.031) * intensity;
      let pos = theme.glowPos;
      
      if (!isContainer) {
        const name = theme.label.toLowerCase();
        if (name === "drama") {
          pos = "50% 50%";
        } else if (name === "action") {
          pos = "60% 40%"; // TR
        } else if (name === "adventure") {
          pos = "40% 40%"; // TL
        } else if (name === "thriller") {
          pos = "40% 60%"; // BL
        } else if (name === "comedy") {
          pos = "60% 60%"; // BR
        } else if (name === "kids") {
          pos = "20% 20%"; // Top Left
        } else if (name === "crime" || name === "politics") {
          pos = "80% 80%"; // Bottom Right
        } else if (theme.anchor === "c") {
          // Lesser genres
          if (name === "reality") {
            pos = "20% 80%"; // BL
          } else { // talk, soap
            pos = "80% 20%"; // TR
          }
        } else {
          // Other corner genres mapped to their anchors
          switch (theme.anchor) {
            case "tl": pos = "20% 20%"; break;
            case "tr": pos = "80% 20%"; break;
            case "bl": pos = "20% 80%"; break;
            case "br": pos = "80% 80%"; break;
            default:   pos = "50% 50%";
          }
        }
      }

      return `radial-gradient(${theme.glowSpread} at ${pos}, color-mix(in oklch, ${TOKEN_VAR[theme.token]}, transparent ${Math.round(
        (1 - alpha) * 100,
      )}%), transparent 100%)`;
    })
    .join(", ");

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Blended composite glow (all genres summed) */}
      <div className="absolute inset-0" style={{ backgroundImage: glowLayers }} />

      {/* One textural motif layer per genre, each in its tint */}
      {layers.map(({ name, theme }, i) => {
        const Motif = theme.Motif;
        const drift = animated && !isContainer ? DRIFTS[i % DRIFTS.length] : "";

        return (
          <div
            key={`${name}-${i}`}
            className="absolute inset-0"
            style={{ color: TOKEN_VAR[theme.token], opacity: (MOTIF_OPACITY[i] ?? 0.05) * intensity }}
          >
            {/* The drift only runs when motion is allowed (motion-safe) */}
            <div className={`absolute inset-0 ${drift}`} style={{ transformOrigin: "center" }}>
              <Motif uid={`${i}`} variant={variant} token={theme.token} anchor={theme.anchor} />
            </div>
          </div>
        );
      })}

      {/* Vignette so body text stays legible toward the edges/center */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-background/40" />
    </div>
  );
}
