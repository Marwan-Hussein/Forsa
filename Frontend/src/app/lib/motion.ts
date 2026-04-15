import type { Transition, Variants } from "motion/react";

export const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const EASE_SCROLL: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const SCROLL_REVEAL_DURATION = 0.62;

export const scrollRevealViewport = {
  once: true,
  amount: "some" as const,
  margin: "0px 0px -12% 0px",
};

export const DURATION_FAST = 0.2;
export const DURATION = 0.3;
export const DURATION_SLOW = 0.4;

export const transitionSnappy: Transition = {
  duration: DURATION,
  ease: EASE_IN_OUT,
};

export const transitionFast: Transition = {
  duration: DURATION_FAST,
  ease: EASE_IN_OUT,
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const pageTransition: Transition = {
  duration: 0.42,
  ease: EASE_SCROLL,
};

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalPanelVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 8 },
};

export function listStaggerDelay(index: number, cap = 12): number {
  return Math.min(index, cap) * 0.045;
}
