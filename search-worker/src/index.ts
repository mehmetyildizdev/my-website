/// <reference types="@cloudflare/workers-types" />
import searchSql from '../sql/search.sql';
import slugLookupSql from '../sql/slug_lookup.sql';

export interface Env {
  DB: D1Database;
  TMDB_API_READ_ACCESS_TOKEN: string;
  SEARCH_SYNC_SECRET: string;
}

interface SearchRow {
  type: 'movie' | 'show' | 'person';
  tmdb_id: number;
  name: string;
  extra_name: string | null;
  image_path: string | null;
  rating: number | null;
  release_date: string | null;
}

// Global in-memory rate limit tracker (per-isolate edge cache)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const query = url.searchParams.get('q');

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── Endpoint: GET /slug ────────────────────────────────────────────────
    // Serves pre-compiled slug_details JSON directly from Cloudflare D1 and
    // derives availability from the existing D1 search/slug tables. No status
    // rows are written during normal operation.
    if (path === '/slug') {
      const type = url.searchParams.get('type');
      const id = url.searchParams.get('id');

      if (!type || !id || !['movie', 'show', 'person'].includes(type)) {
        return new Response(JSON.stringify({ error: 'Missing type or id' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      try {
        const tmdbId = Number.parseInt(id, 10);
        if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) {
          return new Response(JSON.stringify({ error: 'Invalid id' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const row = await env.DB.prepare(slugLookupSql)
          .bind(type, tmdbId)
          .first<{ detail_json: string | null; state: 'available' | 'excluded' | 'pending' }>();

        if (row?.state === 'excluded') {
          return new Response(JSON.stringify({ result: null, state: 'excluded' }), {
            status: 410,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=3600, s-maxage=604800',
              ...corsHeaders,
            },
          });
        }

        if (!row || row.state === 'pending' || !row.detail_json) {
          return new Response(JSON.stringify({ result: null, state: 'pending' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=3600, s-maxage=604800',
              ...corsHeaders,
            },
          });
        }

        return new Response(JSON.stringify({ result: row.detail_json, state: 'available' }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600, s-maxage=604800',
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // ── Endpoint: GET /db ──────────────────────────────────────────────────
    if (path === '/db') {
      const trimmed = query ? query.trim() : '';
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isNumeric = /^\d+$/.test(trimmed);

      if (trimmed.length < 3 && !isNumeric && !isLocalhost) {
        return new Response(JSON.stringify({ movies: [], shows: [], people: [] }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      try {
        // FTS5 trigram matching preserves the old substring behavior (`%term%`)
        // without scanning the full search_items table. Quote the input so
        // punctuation cannot be interpreted as FTS operators.
        const ftsTerm = `"${trimmed.replace(/"/g, '""')}"`;
        const tmdbId = isNumeric ? Number(trimmed) : -1;

        const { results } = await env.DB.prepare(searchSql)
          .bind(ftsTerm, tmdbId)
          .all<SearchRow>();

        const movies = results.filter((r: SearchRow) => r.type === 'movie');
        const shows = results.filter((r: SearchRow) => r.type === 'show');
        const people = results.filter((r: SearchRow) => r.type === 'person');

        return new Response(JSON.stringify({ movies, shows, people }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=600, s-maxage=86400',
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // ── Endpoint: GET /tmdb ────────────────────────────────────────────────
    if (path === '/tmdb') {
      const trimmed = query ? query.trim() : '';
      const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isNumeric = /^\d+$/.test(trimmed);

      if (trimmed.length < 3 && !isNumeric && !isLocalhost) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Rate Limiting Logic (Max 3 requests per 10 seconds per IP)
      const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
      const now = Date.now();
      const limit = rateLimitMap.get(clientIp);
      const windowMs = 10000; // 10 seconds
      const maxRequests = 3;

      if (limit) {
        if (now > limit.resetTime) {
          // Reset window
          rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
        } else {
          if (limit.count >= maxRequests) {
            return new Response(JSON.stringify({ error: 'Too Many Requests. Rate limit exceeded.' }), {
              status: 429,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          limit.count += 1;
        }
      } else {
        rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
      }

      try {
        const tmdbUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(trimmed)}&page=1`;
        const response = await fetch(tmdbUrl, {
          headers: {
            Authorization: `Bearer ${env.TMDB_API_READ_ACCESS_TOKEN}`,
            accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`TMDB API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60, s-maxage=86400',
            ...corsHeaders,
          },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};

export default worker;
