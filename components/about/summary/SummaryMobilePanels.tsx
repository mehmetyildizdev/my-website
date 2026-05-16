import { TABS } from "../tabs/Constants";
import { SummaryMobileAboutIntro } from "./SummaryMobileAboutIntro";
import { cn } from "@/lib/shadcn/utils";

export function SummaryMobilePanels({
  containerRef,
  activeIdx,
  onScroll,
  hideContent,
}: SummaryUIProps) {
  return (
    <div
      ref={containerRef as any}
      onScroll={onScroll}
      className="flex min-h-0 min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab, idx) => {
        const Panel = tab.Component;
        const isActive = idx === activeIdx;
        return (
          <article
            key={tab.name}
            id={`summary-panel-${idx}`}
            role="tabpanel"
            aria-labelledby={`summary-tab-${idx}`}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            className={cn(
              "flex h-full min-w-full w-full shrink-0 snap-start snap-always flex-col overscroll-y-contain transition-opacity duration-300",
              !tab.noScroll && "overflow-y-auto",
              hideContent ? "opacity-0" : "opacity-100"
            )}
          >
            {idx === 0 && <SummaryMobileAboutIntro />}
            <Panel
              {...(tab.name === "Contact Me"
                ? { onCheckingChange: () => { } }
                : {})}
            />
          </article>
        );
      })}
    </div>
  );
}
