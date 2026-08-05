# Mehmet Yıldız — Personal Sanctuary & Portfolio

> **Full-Stack Developer | IT Specialist**  
> _A digital sanctuary where systematic logic meets the alchemy of modular design._

---

## 🌟 Overview

Source codebase for the personal website, digital portfolio, and interactive data vault of Mehmet Yıldız. Built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**, this application serves as the central hub for software projects, technical chronicles, and personal media analytics.

Beyond a traditional portfolio, this platform features custom-engineered modules including a live **Screen Collection Vault** for movie/TV analytics, a decoupled **Sanity CMS** blog engine, and an **OKLCH-powered Design System** inspired by alchemical metals and gemstones.

---

## ✨ Key Features & Architecture

### 🎬 Screen Collection Vault (`/collection/screen`)

- **Live Media Analytics**: Deep tracking and visualization of movies, TV shows, directors, actors, and network timelines.
- **Interactive Visualizations**: Rating distribution charts, genre rating trends, watch heatmaps, and binge pattern metrics powered by Recharts & D3.
- **TMDB Integration**: Dynamic metadata retrieval and structured data parsing.

### ⚡ Database Caching & Revalidation Architecture (Neon DB Optimization)

- **Zero-Wakeup Routine Visits**: All SQL queries across Screen analytics (`/collection/screen`, `/charts`, `/m`, `/s`, `/p`, `/stats`) are wrapped in `cachedQuery` using Next.js `unstable_cache`. Standard user page views read directly from Next.js Data Cache (Vercel Edge), keeping Neon DB compute asleep.
- **Cloudflare D1 Primary Detail Source**: Detail page lookups (`/m/[id]`, `/s/[id]`, `/p/[id]`) read pre-compiled `slug_details` JSON directly from Cloudflare D1 via the Search Worker (`GET /slug?type=...&id=...`). The worker derives `available`, `excluded`, or `pending` from D1 tables without writing a status table.
- **Strict Fallback Scoping**:
  - **Person Pages**: D1-only lookup; never query Neon DB as fallback.
  - **Movie & Show Pages**: Query Neon DB emergency fallback (`movie_detail_fallback.sql` / `show_detail_fallback.sql`) ONLY when accessed via `?source=recent-watches` (items watched between GitHub Action sync cycles). All standard browsing, search clicks, and direct links return `404` without touching Neon if absent in D1.
- **On-Demand Cache Invalidation**:
  - **Daily Revalidation**: Daily GitHub Actions trigger `/api/screen/revalidate` to purge `screen-db`, `recent-watches`, and `slug-details` cache tags once per day. The first visitor to a charts page post-revalidation triggers a single set of queries to Neon DB to re-warm the Next.js Data Cache for 7 days.
  - **Live Scrobble Sync**: Personal watch syncs from MemoStream hit `/api/screen/recent?revalidate=true`, refreshing only the `recent-watches` feed without invalidating heavy analytics caches.

#### 📊 Screen Data Routing & Caching Matrix

| Feature / Page | Primary Data Source | Neon DB Fallback & Caching Behavior |
| :--- | :--- | :--- |
| **Search Page** (`/collection/screen/search`) | Cloudflare D1 Worker (`/db` & `/tmdb`) | **Zero Neon DB queries.** All database searches use Cloudflare D1 FTS5 trigram indexes. |
| **Person Detail** (`/collection/screen/p/[id]`) | Cloudflare D1 Worker (`/slug?type=person`) | **Zero Neon DB queries.** D1-only lookup. Missing or pending profiles return 404 without querying Neon. |
| **Movie & Show Detail** (`/m/[id]`, `/s/[id]`) | Cloudflare D1 Worker (`/slug?type=movie\|show`) | **Emergency Fallback Only.** Neon is queried ONLY when `?source=recent-watches` is present (from Recent Watches strip) and state is pending in D1. Direct visits, search clicks, and filmography links never trigger fallback. |
| **Featured Recommendations** (`/api/screen/featured`) | Next.js Data Cache (`screen-featured` tag) | **7-Day TTL Cache (`604800s`).** Reads from Neon DB on cold cache only; served from edge memory on routine views. Not invalidated by daily chart updates. |
| **Analytics & Charts** (`/collection/screen`, `/charts`, `/m`, `/s`, `/p`, `/stats`) | Next.js Data Cache (`screen-db` tag) | **Daily Revalidation.** Daily GitHub Action purges `screen-db`. First visitor triggers query against Neon DB to re-warm 7-day Next.js Data Cache. |

### ✍️ Blog & Chronicles (`/blog`)

- **Decoupled Headless CMS**: Powered by **Sanity CMS** (`next-sanity`) for fast, secure, structured content editing.
- **Rich Post Renderer**: Syntax-highlighted code blocks, PortableText rendering, category filtering, and archive browsing.
- **Bilingual & Localization Ready**: Integrated language toggle support.

### 💎 Elemental Design System

- **OKLCH Color Engine**: Perceptually uniform color palette built on modern CSS OKLCH variables.
- **Motif Tokens**: Structured around _Noble Metals_ (Gold, Titanium, Platinum, Silver, Quicksilver) and _Ethereal Gems_ (Diamond, Sapphire, Ruby, Amethyst, Emerald, Topaz).
- **Responsive & Accessible**: Fully dark/light mode adaptable via `next-themes` and `shadcn/ui`.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **UI & Logic**: [React 19](https://react.dev/), [TypeScript 6](https://www.typescriptlang.org/)
- **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), Lucide Icons & React Icons
- **CMS**: [Sanity CMS](https://www.sanity.io/) (`next-sanity`, `@portabletext/react`)
- **Data & Charts**: [Recharts](https://recharts.org/), [d3-geo](https://d3js.org/)
- **Database & Edge Workers**: PostgreSQL (`pg`), Cloudflare Workers (`wrangler`)
- **Security & Bot Protection**: Cloudflare Turnstile (`nextjs-turnstile`)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

© Mehmet Yıldız. Built with logic & modular alchemy.
