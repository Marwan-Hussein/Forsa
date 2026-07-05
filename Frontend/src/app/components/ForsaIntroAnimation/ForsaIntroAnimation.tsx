import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShouldPlayIntro } from "./useShouldPlayIntro";
import "./ForsaIntroAnimation.css";

type Phase = "idle" | "rising" | "greeting" | "exiting" | "done";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN_EXPO = [0.7, 0, 0.84, 0] as const;

/**
 * ForsaIntroAnimation
 * --------------------------------------------------------------------------
 * A one-time cinematic entrance: a friendly Forsa event-ticket character
 * rises in, waves a welcoming point at the viewer, then exits — revealing
 * the app underneath.
 *
 * Usage: mount once at the very top of the app tree, above the router.
 *   <ForsaIntroAnimation />
 *   <RouterProvider router={router} />
 *
 * It plays once per real page load / hard refresh, and never replays on
 * client-side (SPA) navigation — see useShouldPlayIntro for how that's
 * guaranteed. It also respects prefers-reduced-motion by skipping the
 * choreography and just doing a brief fade.
 */
export function ForsaIntroAnimation() {
  const [shouldPlay, markPlayed] = useShouldPlayIntro();
  const [phase, setPhase] = useState<Phase>(shouldPlay ? "idle" : "done");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Kick off the sequence.
  useEffect(() => {
    if (!shouldPlay) return;
    markPlayed();

    if (reducedMotion) {
      const t = setTimeout(() => setPhase("done"), 350);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setPhase("rising"), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay, reducedMotion]);

  // Hold the greeting pose for ~1.5s, then start the exit.
  useEffect(() => {
    if (phase !== "greeting") return;
    const t = setTimeout(() => setPhase("exiting"), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  // Reduced-motion path: no ticket choreography, just a short fade.
  if (reducedMotion) {
    return (
      <motion.div
        className="forsa-intro-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        onAnimationComplete={() => setPhase("done")}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="forsa-intro-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "exiting" ? 0 : 1 }}
        transition={{
          duration: 0.5,
          delay: phase === "exiting" ? 0.45 : 0,
        }}
        onAnimationComplete={() => {
          if (phase === "exiting") setPhase("done");
        }}
      >
        <div className="forsa-intro-particles" aria-hidden="true">
          {phase === "greeting" &&
            Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={`forsa-particle forsa-particle-${i}`} />
            ))}
        </div>

        <motion.div
          className="forsa-ticket"
          initial={{ opacity: 0, y: 260, scale: 0.6, rotate: -10 }}
          animate={
            phase === "rising"
              ? {
                  opacity: 1,
                  y: [260, -16, 0],
                  scale: [0.6, 1.06, 1],
                  rotate: [-10, 4, 0],
                }
              : phase === "greeting"
              ? { opacity: 1, y: [0, -5, 0], scale: 1, rotate: [0, -2, 0] }
              : phase === "exiting"
              ? { opacity: 0, y: 260, scale: 0.7, rotate: 8 }
              : {}
          }
          transition={
            phase === "rising"
              ? { duration: 1.1, ease: EASE_OUT_EXPO, times: [0, 0.75, 1] }
              : phase === "greeting"
              ? { duration: 1.5, ease: "easeInOut" }
              : phase === "exiting"
              ? { duration: 0.7, ease: EASE_IN_EXPO }
              : undefined
          }
          onAnimationComplete={() => {
            if (phase === "rising") setPhase("greeting");
          }}
        >
          <span className="forsa-ticket-glow" aria-hidden="true" />

          {/* Left arm stays relaxed throughout */}
          <span className="forsa-arm forsa-arm-left" aria-hidden="true">
            <span className="forsa-hand" />
          </span>

          {/* Right arm lifts into a friendly welcoming point during the greeting */}
          <motion.span
            className="forsa-arm forsa-arm-right"
            aria-hidden="true"
            animate={
              phase === "greeting"
                ? { rotate: -70, y: -12 }
                : { rotate: 8, y: 0 }
            }
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          >
            <span className="forsa-hand forsa-hand-point" />
          </motion.span>

          <div className="forsa-ticket-body">
            <span
              className="forsa-ticket-notch forsa-ticket-notch-left"
              aria-hidden="true"
            />
            <span
              className="forsa-ticket-notch forsa-ticket-notch-right"
              aria-hidden="true"
            />
            <span className="forsa-ticket-perforation" aria-hidden="true" />
            <span className="forsa-ticket-logo">Forsa</span>
            <span
              className={`forsa-ticket-smile ${
                phase === "greeting" ? "forsa-ticket-smile-visible" : ""
              }`}
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
