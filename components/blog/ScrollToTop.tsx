"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "scroll to top" button.
 * Appears after the user scrolls past 400px.
 * Placed fixed at bottom-right — add to any layout that needs it.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={scrollTop}
      aria-label="Scroll to top"
      className={`fixed bottom-8 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full
                  border border-border/30 bg-card/80 backdrop-blur-md shadow-lg
                  text-foreground/70 transition-all duration-300
                  hover:bg-card hover:text-foreground hover:scale-110 hover:shadow-xl
                  ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 cursor-pointer"}`}
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
