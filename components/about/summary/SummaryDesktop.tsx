"use client";
import { useState, useCallback } from "react";
import { useSummaryGradients } from "@/hooks/about/useSummaryGradients";
import { SummaryDesktopPhoto } from "./SummaryDesktopPhoto";
import { SummaryDesktopNav } from "./SummaryDesktopNav";
import { SummaryDesktopPanels } from "./SummaryDesktopPanels";

export default function SummaryDesktop({
  id,
  isActive = true,
  hideContent = false,
}: SummaryUIProps) {
  const [activeIdx, setActiveIdx] = useState(2);
  const [isTurnstileChecking, setIsTurnstileChecking] = useState(false);

  const handleToggleCheck = useCallback((checking: boolean) => {
    setIsTurnstileChecking(checking);
  }, []);

  const animPauseStyle = isTurnstileChecking
    ? { animationPlayState: "paused" as const }
    : {};

  const { angle, bgClockwise, bgAntiClockwise, bgClockwiseStatic } =
    useSummaryGradients(isActive, isTurnstileChecking);

  return (
    <section
      id={id}
      className="3xl:w-[85%] px-16 h-screen mx-auto flex justify-center items-center max-w-[1560px]"
    >
      <div className="w-2/5 h-144 relative flex xl:items-center">
        <SummaryDesktopPhoto
          gradient={bgClockwiseStatic}
          angle={angle}
          hideContent={hideContent}
        />

        <SummaryDesktopNav
          gradient={bgAntiClockwise}
          activeIdx={activeIdx}
          onTabChange={setActiveIdx}
          animPauseStyle={animPauseStyle}
          angle={angle}
          hideContent={hideContent}
        />
      </div>

      <SummaryDesktopPanels
        gradient={bgClockwise}
        activeIdx={activeIdx}
        onToggleCheck={handleToggleCheck}
        hideContent={hideContent}
      />
    </section>
  );
}
