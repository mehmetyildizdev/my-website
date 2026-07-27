import { m } from 'framer-motion';
import { TABS } from '../tabs/Constants';
import { SyncButton } from './SyncButton';

export function SummaryDesktopNav({
  gradient,
  activeIdx,
  onTabChange,
  animPauseStyle,
  angle,
  hideContent,
}: SummaryUIProps) {
  return (
    <m.div
      id="buttons"
      style={{ background: gradient as any }}
      className="z-60 h-144 w-2/5 ml-[60%] p-1 absolute flex justify-end items-center drop-shadow-2xl shadow-2xl shadow-obsidian/33 rounded-s-2xl"
    >
      <div className="flex flex-col gap-1 w-[95%] h-[98%] rounded-s-2xl">
        {TABS.map((tab, index) => (
          <SyncButton
            key={index}
            tab={tab}
            index={index}
            activeIdx={activeIdx}
            onTabChange={onTabChange}
            animPauseStyle={animPauseStyle}
            angle={angle}
            hideContent={hideContent}
          />
        ))}
      </div>
    </m.div>
  );
}
