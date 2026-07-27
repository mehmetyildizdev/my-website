'use client';
import { m, useMotionTemplate, useTransform, useMotionValue } from 'framer-motion';
import { trackClick } from 'tools/TrackClicks';
import { cn } from '@/lib/shadcn/utils';

export function SyncButton({
  tab,
  index,
  activeIdx,
  onTabChange,
  animPauseStyle,
  angle,
  hideContent,
}: SummaryUIProps) {
  const fallbackAngle = useMotionValue(0);
  const activeAngle = angle || fallbackAngle;

  const getTabColorAngle = (color: string) => {
    switch (color) {
      case 'ruby':
        return 0;
      case 'amethyst':
        return 72;
      case 'sapphire':
        return 144;
      case 'emerald':
        return 216;
      case 'topaz':
        return 288;
      default:
        return 0;
    }
  };

  const cDeg = getTabColorAngle(tab?.color || '');
  const aHit = (90 - cDeg + 360) % 360;

  const fillRight = useTransform(activeAngle, (a: number) => {
    let diff = (a - aHit) % 360;
    if (diff < 0) diff += 360;
    if (diff <= 180) return (diff / 180) * 100;
    return 100;
  });

  const fillLeft = useTransform(activeAngle, (a: number) => {
    let diff = (a - aHit) % 360;
    if (diff < 0) diff += 360;
    if (diff <= 180) return 0;
    return ((diff - 180) / 180) * 100;
  });

  const bgStyle = useMotionTemplate`linear-gradient(90deg, var(--color-pearl) ${fillLeft}%, color-mix(in oklch, var(--color-${tab?.color || 'pearl'}) 10%, var(--color-pearl)) ${fillLeft}%, color-mix(in oklch, var(--color-${tab?.color || 'pearl'}) 90%, var(--color-pearl)) ${fillRight}%, var(--color-pearl) ${fillRight}%)`;

  const x = useTransform(activeAngle, (a: number) => {
    let diff = (a - aHit) % 360;
    if (diff < 0) diff += 360;

    if (diff <= 90) {
      return -Math.sin(diff * (Math.PI / 90)) * 8;
    }
    return 0;
  });

  const inverseX = useTransform(x, (val: number) => -val);

  return (
    <m.button
      key={index}
      onClick={() => {
        if (index !== undefined) onTabChange?.(index);
        trackClick('Button', tab?.name || '');
      }}
      style={{ ...animPauseStyle, background: bgStyle, x } as any}
      aria-label={`Switch to ${tab?.name || 'tab'}`}
      className="group flex-1 relative flex justify-center items-center cursor-pointer rounded-l-2xl overflow-hidden"
    >
      <div
        style={{
          backgroundImage: 'url(/images/dots-piston.svg)',
          backgroundColor: `var(--color-${tab?.color || 'pearl'})`,
        }}
        className="absolute inset-y-[7.5%] left-2 right-0 bg-no-repeat bg-cover rounded-l-2xl bg-blend-multiply drop-shadow-lg"
      />
      <m.div
        style={{ x: inverseX }}
        className="absolute inset-0 flex justify-start items-center pl-2 z-10 pointer-events-none"
      >
        <p
          className={cn(
            'text-platinum light:text-pearl text-xl flex justify-start items-center gap-2 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] transition-opacity duration-300 whitespace-nowrap',
            hideContent ? 'opacity-0' : 'opacity-100'
          )}
        >
          <span className="w-10 pl-2 flex justify-center">
            {tab?.icon && (
              <tab.icon className="text-xl xl:text-3xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" />
            )}
          </span>
          <span className="text-lg">{tab?.name}</span>
        </p>
      </m.div>
    </m.button>
  );
}
