/**
 * Global Error/Warning Silencer
 * Add specific strings to the 'ignoredWarnings' array to suppress them.
 */

const ignoredWarnings = [
  "The width(-1) and height(-1) of chart should be greater than 0",
  "Other annoying warning message to hide",
];

export function initSilencers() {
  if (typeof window !== "undefined") {
    const originalWarn = console.warn;

    console.warn = (...args) => {
      const message = args[0];

      if (typeof message === "string") {
        const shouldIgnore = ignoredWarnings.some((warn) =>
          message.includes(warn),
        );
        if (shouldIgnore) return;
      }

      originalWarn(...args);
    };
  }
}
