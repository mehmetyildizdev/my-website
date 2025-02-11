"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    gtag: (...args: (string | Date | { [key: string]: unknown })[]) => void;
  }
}

const GA_TRACKING_ID = process.env.GOOGLE_TRACKING_ID || ""; // Replace with your Measurement ID

export default function GoogleAnalytics() {
  useEffect(() => {
    // Initialize Google Analytics after the script has loaded
    if (GA_TRACKING_ID) {
      window.gtag("config", GA_TRACKING_ID, {});
    }
  }, []);

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
