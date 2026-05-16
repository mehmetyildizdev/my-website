import { useAnimationFrame, useMotionValue, useMotionTemplate, useTransform, MotionValue } from "framer-motion";

export function useSummaryGradients(isActive: boolean, isTurnstileChecking: boolean) {
  const angle = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    if (!isTurnstileChecking && isActive) {
      angle.set((angle.get() + delta * 0.03) % 360);
    }
  });

  const angleReverse = useTransform(angle, (a) => -a);

  const bgClockwise = useMotionTemplate`conic-gradient(from ${angle}deg, var(--color-ruby), var(--color-amethyst), var(--color-sapphire), var(--color-emerald), var(--color-topaz), var(--color-ruby))`;
  const bgAntiClockwise = useMotionTemplate`conic-gradient(from ${angleReverse}deg, var(--color-ruby), var(--color-topaz), var(--color-emerald), var(--color-sapphire), var(--color-amethyst), var(--color-ruby))`;
  const bgClockwiseStatic = `conic-gradient(var(--color-ruby), var(--color-amethyst), var(--color-sapphire), var(--color-emerald), var(--color-topaz), var(--color-ruby))`;

  return {
    angle,
    bgClockwise,
    bgAntiClockwise,
    bgClockwiseStatic,
  };
}
