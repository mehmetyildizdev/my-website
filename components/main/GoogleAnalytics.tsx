"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function GoogleAnalytics({ trackingID }: GAProps) {
  useEffect(() => {
    const trackClicks = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Find the NEAREST ancestor that is either a link OR a button
      const interactive = target.closest("a, button");

      if (!interactive) return;

      if (interactive.tagName === "A") {
        const link = interactive as HTMLAnchorElement;
        const titleElement = link.querySelector("h1, h2, h3, h4");
        const customLabel = link.getAttribute("data-gtag-label");
        
        const label = customLabel || 
                      titleElement?.textContent?.trim() || 
                      link.innerText?.split("\n")[0]?.trim() || 
                      link.href || 
                      "Unknown Link";

        window.gtag("event", "click", {
          event_category: "Link",
          event_label: label.substring(0, 100),
          link_url: link.href,
        });
      } else if (interactive.tagName === "BUTTON") {
        const btn = interactive as HTMLButtonElement;
        const customLabel = btn.getAttribute("data-gtag-label");
        const label = customLabel || btn.innerText?.trim() || "Unknown Button";

        window.gtag("event", "click", {
          event_category: "Button",
          event_label: label.substring(0, 100),
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
