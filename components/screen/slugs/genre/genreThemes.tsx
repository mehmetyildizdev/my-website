// components/screen/slugs/genre/genreThemes.tsx
// Central registry mapping every TMDB genre to a theme-fitting visual identity.
//
// Each genre owns:
//   - a gemstone/metal tint (one of the design-system tokens) used as `color`
//   - a Motif component (the textural SVG layer)
//   - an `anchor` corner so that when several genres stack, their motifs/glows
//     occupy different regions instead of overlapping into mud.
//   - per-genre `glowPos` and `glowSpread` so that stacked glows radiate from
//     unique positions rather than the same 5 anchor slots.
//
// This is what makes the backgrounds "modular": a single-genre title shows one
// motif; a multi-genre title layers each motif in its own anchor + tint, and the
// radial glows blend in OKLCH-friendly color-mix to form a brand-new composite.

import type { ComponentType } from "react";
import {
  ActionMotif,
  AdventureMotif,
  AnimationMotif,
  ComedyMotif,
  CrimeMotif,
  DocumentaryMotif,
  DramaMotif,
  FamilyMotif,
  FantasyMotif,
  HistoryMotif,
  HorrorMotif,
  MusicMotif,
  MysteryMotif,
  RomanceMotif,
  ScifiMotif,
  ThrillerMotif,
  WarMotif,
  WesternMotif,
  PoliticsMotif,
  RealityMotif,
  KidsMotif,
  SoapMotif,
  DefaultMotif,
  type MotifProps,
} from "./motifs";

/** oklch tint per token — used for radial-gradient glows (CSS var fallback). */
export const TOKEN_VAR = {
  ruby: "var(--ruby)",
  sapphire: "var(--sapphire)",
  emerald: "var(--emerald)",
  amethyst: "var(--amethyst)",
  topaz: "var(--topaz)",
};

export const TOKEN_TEXT = {
  ruby: "text-ruby",
  sapphire: "text-sapphire",
  emerald: "text-emerald",
  amethyst: "text-amethyst",
  topaz: "text-topaz",
};

const make = (
  token: GenreTheme["token"],
  Motif: ComponentType<MotifProps>,
  anchor: Anchor,
  label: string,
  glowPos: string,
  glowSpread: string,
): GenreTheme => ({ token, Motif, anchor, label, glowPos, glowSpread });

/**
 * Master map. Keys are normalized genre names (TMDB canonical, plus the combined
 * TV genres which we also split where helpful). Lookup is case-insensitive via
 * `getGenreTheme`.
 *
 * Mapped strictly to the five gem colors: ruby, sapphire, emerald, amethyst, topaz.
 *
 * Each genre has a unique glowPos so that even when 4 genres stack
 * (e.g. Sci-Fi + Action + Thriller + Drama), each glow radiates from a
 * different region — no more stacking mud.
 */
// prettier-ignore
export const GENRE_THEMES: Record<string, GenreTheme> = {
  // ── ruby themes ───────────────────────────────────────────────────────────
  thriller:         make("ruby",      ThrillerMotif,    "bl", "Thriller",         "6% 92%",   "50% 50%"),
  horror:           make("ruby",      HorrorMotif,      "tl", "Horror",           "8% 6%",    "50% 45%"),
  crime:            make("ruby",      CrimeMotif,       "br", "Crime",            "92% 92%",  "52% 52%"),
  war:              make("ruby",      WarMotif,         "tr", "War",              "92% 6%",   "48% 45%"),
  reality:          make("ruby",      RealityMotif,     "c",  "Reality",          "38% 38%",  "54% 50%"),

  // ── sapphire themes ───────────────────────────────────────────────────────
  action:           make("sapphire",  ActionMotif,      "tr", "Action",           "78% 18%",  "55% 50%"),
  "science fiction": make("sapphire", ScifiMotif,       "bl", "Science Fiction",  "22% 80%",  "58% 54%"),
  documentary:      make("sapphire",  DocumentaryMotif, "tl", "Documentary",      "22% 16%",  "52% 48%"),
  news:             make("sapphire",  DocumentaryMotif, "br", "News",             "78% 82%",  "52% 42%"),
  talk:             make("sapphire",  RealityMotif,     "c",  "Talk",             "62% 38%",  "50% 45%"),

  // ── emerald themes ────────────────────────────────────────────────────────
  comedy:           make("emerald",   ComedyMotif,      "tr", "Comedy",           "88% 8%",   "58% 52%"),
  romance:          make("emerald",   RomanceMotif,     "br", "Romance",          "85% 90%",  "55% 52%"),
  music:            make("emerald",   MusicMotif,       "bl", "Music",            "12% 88%",  "58% 55%"),
  family:           make("emerald",   FamilyMotif,      "tl", "Family",           "16% 22%",  "55% 50%"),
  soap:             make("emerald",   SoapMotif,        "c",  "Soap",             "62% 62%",  "48% 42%"),

  // ── amethyst themes ───────────────────────────────────────────────────────
  adventure:        make("amethyst",  AdventureMotif,   "tl", "Adventure",        "18% 76%",  "60% 55%"),
  fantasy:          make("amethyst",  FantasyMotif,     "tr", "Fantasy",          "82% 14%",  "60% 55%"),
  animation:        make("amethyst",  AnimationMotif,   "bl", "Animation",        "20% 8%",   "55% 50%"),
  "tv movie":       make("amethyst",  RealityMotif,     "br", "TV Movie",         "82% 78%",  "50% 45%"),
  kids:             make("amethyst",  KidsMotif,        "c",  "Kids",             "38% 62%",  "55% 52%"),

  // ── topaz themes ──────────────────────────────────────────────────────────
  drama:            make("topaz",     DramaMotif,       "br", "Drama",            "8% 84%",   "65% 60%"),
  mystery:          make("topaz",     MysteryMotif,     "tl", "Mystery",          "7% 18%",   "45% 40%"),
  history:          make("topaz",     HistoryMotif,     "tr", "History",          "76% 20%",  "50% 48%"),
  western:          make("topaz",     WesternMotif,     "bl", "Western",          "90% 84%",  "55% 50%"),
  politics:         make("topaz",     PoliticsMotif,    "c",  "Politics",         "50% 32%",  "52% 48%"),
};

export const DEFAULT_THEME: GenreTheme = make(
  "topaz",
  DefaultMotif,
  "c",
  "Default",
  "50% 50%",
  "55% 50%",
);

export function getGenreTheme(name: string): GenreTheme {
  return GENRE_THEMES[name.trim().toLowerCase()] ?? DEFAULT_THEME;
}

/** Get the CSS variable representing the theme color for a genre name. */
export function getGenreColor(name: string): string {
  const theme = getGenreTheme(name);
  return TOKEN_VAR[theme.token];
}

/** Anchor → CSS background-position for radial glows. */
export const ANCHOR_POS: Record<Anchor, string> = {
  tl: "15% 12%",
  tr: "85% 12%",
  bl: "15% 88%",
  br: "85% 88%",
  c: "50% 45%",
};

/** Anchor → motif container positioning class (motif sits in its quadrant). */
export const ANCHOR_CLASS: Record<Anchor, string> = {
  tl: "[mask-image:radial-gradient(150%_150%_at_0%_0%,black_20%,transparent_85%)]",
  tr: "[mask-image:radial-gradient(150%_150%_at_100%_0%,black_20%,transparent_85%)]",
  bl: "[mask-image:radial-gradient(150%_150%_at_0%_100%,black_20%,transparent_85%)]",
  br: "[mask-image:radial-gradient(150%_150%_at_100%_100%,black_20%,transparent_85%)]",
  c: "[mask-image:radial-gradient(140%_140%_at_50%_50%,black_30%,transparent_90%)]",
};
