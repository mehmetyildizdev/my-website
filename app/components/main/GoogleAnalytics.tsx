"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function GoogleAnalytics({ trackingID }: GAProps) {
  useEffect(() => {
    const trackClicks = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Track button clicks
      if (target.tagName === "BUTTON") {
        window.gtag("event", "click", {
          event_category: "Button",
          event_label: target.innerText || "Unknown Button",
        });
      }

      // Track link clicks
      if (target.tagName === "A") {
        window.gtag("event", "click", {
          event_category: "Link",
          event_label: (target as HTMLAnchorElement).href || "Unknown Link",
        });
      }
    };

    // Add event listener for clicks
    document.addEventListener("click", trackClicks);

    // Cleanup
    return () => {
      document.removeEventListener("click", trackClicks);
    };
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingID}');
          `,
        }}
      />
    </>
  );
}
