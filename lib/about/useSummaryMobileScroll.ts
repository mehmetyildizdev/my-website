import { useState, useCallback, useRef, useEffect } from "react";
import { TABS } from "../../components/about/tabs/Constants";

export function useSummaryMobileScroll(isActive: boolean) {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const scrollRaf = useRef<number | null>(null);
  const isProgrammaticScroll = useRef(false);

  activeIdxRef.current = activeIdx;

  const onTabChange = useCallback((index: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    isProgrammaticScroll.current = true;
    el.scrollTo({
      left: index * el.clientWidth,
      behavior: smooth ? "smooth" : "auto",
    });
    setActiveIdx(index);
    window.setTimeout(
      () => {
        isProgrammaticScroll.current = false;
      },
      smooth ? 400 : 50,
    );
  }, []);

  const syncTabFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isProgrammaticScroll.current) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    const clamped = Math.max(0, Math.min(TABS.length - 1, index));
    setActiveIdx((prev) => (prev === clamped ? prev : clamped));
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRaf.current !== null) return;
    scrollRaf.current = window.requestAnimationFrame(() => {
      scrollRaf.current = null;
      syncTabFromScroll();
    });
  }, [syncTabFromScroll]);

  // Sync navigation bar scroll
  useEffect(() => {
    if (!isActive) return;
    const nav = navRef.current;
    if (nav) {
      const activeBtn = nav.querySelector(
        `[aria-selected="true"]`,
      ) as HTMLElement;
      if (activeBtn) {
        const navWidth = nav.clientWidth;
        const btnWidth = activeBtn.clientWidth;
        const btnLeft = activeBtn.offsetLeft;
        nav.scrollTo({
          left: btnLeft - navWidth / 2 + btnWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeIdx, isActive]);

  // Initial scroll and resize handler
  useEffect(() => {
    if (!isActive) return;

    onTabChange(0, false);

    const onResize = () => {
      const el = scrollRef.current;
      if (!el) return;
      isProgrammaticScroll.current = true;
      el.scrollLeft = activeIdxRef.current * el.clientWidth;
      window.setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 50);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (scrollRaf.current !== null) {
        window.cancelAnimationFrame(scrollRaf.current);
      }
    };
  }, [isActive, onTabChange]);

  return {
    activeIdx,
    scrollRef,
    navRef,
    handleScroll,
    onTabChange,
  };
}
