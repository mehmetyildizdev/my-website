// lib/screen/logger.ts
//
// Two-layer logging system:
//   1. pino  — structured JSON logs (info / warn / error). Fast, zero-allocation,
//              pretty-printed in dev via pino-pretty transport.
//   2. ANSI  — terminal progress lines with proper \x1b[2K\r erase-before-write
//              so old characters never bleed through on shorter updates.
//
// Usage:
//   import { log } from "@/lib/screen/logger";
//   log.section("Trakt Sync — Full mode");
//   log.startTimer("Fetching page 1…");
//   log.stopTimer("Page 1: 100 records");
//   log.progress("Metadata [4/11]");
//   log.batch(showTitles, movieTitles);
//   log.done("Finished");
//   log.warn("Skipping X");
//   log.error("Something failed");
//   log.info("Additional detail");

import pino from "pino";

// ── ANSI codes ────────────────────────────────────────────────────────────────
const C = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  green:   "\x1b[32m",
  red:     "\x1b[31m",
  yellow:  "\x1b[33m",
  cyan:    "\x1b[36m",
  blue:    "\x1b[34m",
  white:   "\x1b[37m",
  // Erase entire current line then return cursor to col 0.
  // Use this BEFORE writing any in-place update to avoid stale characters.
  eraseLine: "\x1b[2K\r",
};

// ── pino instance (structured JSON, pretty in dev) ───────────────────────────
const isDev = process.env.NODE_ENV !== "production";

export const pinoLog = pino(
  { level: "info" },
  isDev
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      })
    : process.stdout
);

// ── Spinner state ─────────────────────────────────────────────────────────────
let _spinnerTimer: ReturnType<typeof setInterval> | null = null;
let _spinnerStart = Date.now();
let _spinnerLabel = "";

function writeProgress(msg: string) {
  // Erase current line, then write without newline — cursor stays on same line
  process.stdout.write(`${C.eraseLine}  ${C.cyan}⟳${C.reset}  ${msg}`);
}

function writeDone(msg: string, secs: number) {
  // Erase the in-progress line, write the final checkmark with newline
  process.stdout.write(`${C.eraseLine}  ${C.green}✓${C.reset}  ${msg} ${C.dim}[${secs.toFixed(1)}s]${C.reset}\n`);
}

// ── Public API ────────────────────────────────────────────────────────────────
export const log = {
  /** Bold section divider */
  section(title: string) {
    const bar = "─".repeat(58);
    process.stdout.write(`\n${C.dim}${bar}${C.reset}\n  ${C.bold}${title}${C.reset}\n${C.dim}${bar}${C.reset}\n`);
  },

  /** Dim arrow — supplementary info */
  info(msg: string) {
    process.stdout.write(`  ${C.dim}→  ${msg}${C.reset}\n`);
  },

  /** Green check — completion without a timer */
  done(msg: string) {
    process.stdout.write(`  ${C.green}✓${C.reset}  ${msg}\n`);
  },

  /** Red cross — non-fatal error */
  error(msg: string) {
    process.stderr.write(`  ${C.red}✗${C.reset}  ${msg}\n`);
  },

  /** Yellow warning */
  warn(msg: string) {
    process.stdout.write(`  ${C.yellow}⚠${C.reset}  ${msg}\n`);
  },

  /**
   * In-place progress line.
   * Erases the current line before writing, so no stale characters are left.
   */
  progress(msg: string) {
    writeProgress(msg);
  },

  /**
   * Print a one-time batch summary (titles of shows/movies about to be synced).
   * Writes regular newline-terminated lines so they stay in the scrollback.
   */
  batch(shows: string[], movies: string[]) {
    if (shows.length)  process.stdout.write(`    ${C.dim}Shows :${C.reset}  ${shows.join(" · ")}\n`);
    if (movies.length) process.stdout.write(`    ${C.dim}Movies:${C.reset}  ${movies.join(" · ")}\n`);
  },

  /**
   * Start a ticking spinner. Updates the same terminal line every second.
   * Call stopTimer() when done.
   */
  startTimer(label: string) {
    if (_spinnerTimer) { clearInterval(_spinnerTimer); _spinnerTimer = null; }
    _spinnerLabel = label;
    _spinnerStart = Date.now();
    writeProgress(label);
    _spinnerTimer = setInterval(() => {
      const secs = Math.floor((Date.now() - _spinnerStart) / 1000);
      writeProgress(`${_spinnerLabel} (${secs}s)`);
    }, 1000);
  },

  /**
   * Stop the spinner and print the final completed line.
   */
  stopTimer(msg: string) {
    if (_spinnerTimer) { clearInterval(_spinnerTimer); _spinnerTimer = null; }
    const secs = (Date.now() - _spinnerStart) / 1000;
    writeDone(msg, secs);
  },

  /** Clear any running spinner without printing a done line */
  clearTimer() {
    if (_spinnerTimer) { clearInterval(_spinnerTimer); _spinnerTimer = null; }
    process.stdout.write("\n");
  },
};
