"use client";

import { useEffect } from "react";
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

/**
 * Sanity Studio makes persistent EventSource connections to the Sanity API
 * for real-time content updates. When the browser throttles or drops these
 * connections (background tab, sleep, etc.) they throw "TypeError: network error"
 * as unhandled promise rejections — which the Next.js dev overlay catches and
 * shows as the error indicator button.
 *
 * This component suppresses only that specific error type while the Studio is
 * mounted. Real application errors are still surfaced normally.
 */
export function StudioClientWrapper() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg =
        event.reason?.message ??
        (typeof event.reason === "string" ? event.reason : "");
      if (msg === "network error" || msg.includes("network error")) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return <NextStudio config={config} />;
}
