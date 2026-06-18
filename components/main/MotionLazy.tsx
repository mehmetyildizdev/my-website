"use client";

import type { ReactNode } from "react";
import { LazyMotion, domAnimation } from "framer-motion";

/** Loads only the DOM animation feature subset (~60% smaller than full framer-motion). */
export function MotionLazy({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
