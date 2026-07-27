'use client';

import { TABS } from '../tabs/Constants';
import { useSummaryMobileScroll } from '@/hooks/about/useSummaryMobileScroll';
import { SummaryMobileNav } from './SummaryMobileNav';
import { SummaryMobilePanels } from './SummaryMobilePanels';

export default function SummaryMobile({
  id,
  isActive = true,
  hideContent = false,
}: SummaryUIProps) {
  const { activeIdx, scrollRef, navRef, handleScroll, onTabChange } =
    useSummaryMobileScroll(isActive);

  const activeColor = TABS[activeIdx].color;

  return (
    <section id={id} className="h-dvh flex flex-col overflow-hidden bg-diamond relative pt-24">
      <div
        className="absolute inset-0 opacity-5 transition-colors duration-700 pointer-events-none"
        style={{ backgroundColor: `var(--color-${activeColor})` }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 min-h-0 flex-col px-4 pb-4">
        <div
          className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/25 bg-pearl shadow-2xl"
          style={{
            boxShadow: `0 8px 32px color-mix(in oklch, var(--color-${activeColor}) 22%, transparent)`,
          }}
        >
          <div
            className="h-1 w-full shrink-0 transition-colors duration-500"
            style={{ backgroundColor: `var(--color-${activeColor})` }}
          />

          <SummaryMobileNav containerRef={navRef} activeIdx={activeIdx} onTabChange={onTabChange} />

          <SummaryMobilePanels
            containerRef={scrollRef}
            activeIdx={activeIdx}
            onScroll={handleScroll}
            hideContent={hideContent}
          />
        </div>
      </div>
    </section>
  );
}
