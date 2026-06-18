// app/collection/screen/test/page.tsx
// Preview hub for the redesigned detail pages + genre backgrounds. Uses mock
// data only — safe to view without a database. Not linked from navigation.

import Link from "next/link";

export const metadata = { title: "Detail Redesign — Preview" };

const LINKS = [
  { href: "/collection/screen/test/movie", title: "Movie Detail", desc: "Full redesigned movie page with mock data" },
  { href: "/collection/screen/test/show", title: "Show Detail", desc: "Full redesigned show page with mock data" },
  { href: "/collection/screen/test/genres", title: "Genre Backgrounds", desc: "Explore every genre + layered combinations" },
];

export default function TestHubPage() {
  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="font-poppins text-3xl font-bold text-gold">Detail Redesign — Preview</h1>
        <p className="mt-2 text-sm text-quicksilver">
          Mock-data sandbox for the new movie/show detail layouts and the modular genre background system.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group rounded-2xl border border-border/15 bg-card/50 p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-gold/40"
          >
            <h2 className="font-poppins text-lg font-semibold text-titanium group-hover:text-gold transition-colors">{l.title}</h2>
            <p className="mt-1 text-xs text-quicksilver">{l.desc}</p>
            <span className="mt-3 inline-block text-xs text-gold/80">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
