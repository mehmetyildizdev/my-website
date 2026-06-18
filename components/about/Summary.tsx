"use client";

import SummaryDesktop from "./summary/SummaryDesktop";
import SummaryMobile from "./summary/SummaryMobile";
import { useIsXlBreakpoint } from "@/hooks/about/useIsXlBreakpoint";
import { MotionLazy } from "@/components/main/MotionLazy";

/**
 * Summary — mounts both desktop and mobile versions, using CSS
 * for visibility. Components use the `isActive` prop to gate
 * animations or internal effects.
 *
 * DEBUG FLAG: Set to true to hide all text, images, and content
 * to experiment with background gradients.
 */
const HIDE_CONTENT = false;

export default function Summary({ id }: SummaryUIProps) {
  const isDesktop = useIsXlBreakpoint();

  return (
    <>
      <div className="xl:hidden">
        <SummaryMobile id={id} isActive={!isDesktop} hideContent={HIDE_CONTENT} />
      </div>
      <div className="hidden xl:block">
        <MotionLazy>
          <SummaryDesktop id={id} isActive={isDesktop} hideContent={HIDE_CONTENT} />
        </MotionLazy>
      </div>
    </>
  );
}
