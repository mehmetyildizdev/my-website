import { TABS } from "../tabs/Constants";
import { cn } from "@/lib/shadcn/utils";

export function SummaryMobileNav({
  containerRef,
  activeIdx,
  onTabChange,
}: SummaryUIProps) {
  return (
    <nav
      ref={containerRef as any}
      className="flex shrink-0 overflow-x-auto border-b border-border/10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Section navigation"
    >
      {TABS.map((tab, idx) => {
        const isActive = idx === activeIdx;
        const Icon = tab.icon;
        return (
          <button
            key={tab.name}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`summary-panel-${idx}`}
            id={`summary-tab-${idx}`}
            onClick={() => onTabChange?.(idx)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
              isActive
                ? "border-current"
                : "border-transparent text-platinum/70 hover:text-platinum"
            )}
            style={
              isActive
                ? {
                  color: `var(--color-${tab.color})`,
                  borderColor: `var(--color-${tab.color})`,
                }
                : undefined
            }
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
