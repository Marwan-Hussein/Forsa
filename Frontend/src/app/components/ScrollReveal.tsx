import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  EASE_SCROLL,
  SCROLL_REVEAL_DURATION,
  scrollRevealViewport,
} from "../lib/motion";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/**
 * Fades/slides content in when it enters the viewport while scrolling.
 */
export function ScrollReveal({ children, className, delay = 0, y = 28 }: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={scrollRevealViewport}
      transition={{
        duration: reduceMotion ? 0 : SCROLL_REVEAL_DURATION,
        delay: reduceMotion ? 0 : delay,
        ease: EASE_SCROLL,
      }}
    >
      {children}
    </motion.div>
  );
}
