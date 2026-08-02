import { m } from 'framer-motion';
import { TABS } from '../tabs/Constants';
import { cn } from '@/lib/shadcn/utils';

export function SummaryDesktopPanels({ gradient, activeIdx, onToggleCheck, hideContent }: SummaryUIProps) {
  return (
    <m.div
      id="content"
      style={{ background: gradient as any }}
      className="z-55 h-144 w-3/5 justify-center items-center rounded-e-2xl shadow-md shadow-pearl"
    >
      <div className="w-full h-full flex justify-center items-center drop-shadow-2xl">
        <div
          className={cn(
            'bg-pearl w-[95%] h-[94%] rounded-2xl relative transition-opacity duration-300',
            hideContent ? 'opacity-0' : 'opacity-100',
          )}
        >
          {TABS.map((tab, index) => {
            const isActive = activeIdx === index;
            const Component = tab.Component;
            const noScroll = tab.noScroll;

            return (
              <div
                key={index}
                className={cn(
                  isActive
                    ? 'relative h-full opacity-100 transition-opacity duration-300 z-10'
                    : 'absolute inset-0 opacity-0 pointer-events-none transition-opacity duration-300 z-0',
                  !noScroll && 'overflow-y-auto',
                )}
              >
                <Component {...(tab.name === 'Contact Me' ? { onCheckingChange: onToggleCheck } : {})} />
              </div>
            );
          })}
        </div>
      </div>
    </m.div>
  );
}
