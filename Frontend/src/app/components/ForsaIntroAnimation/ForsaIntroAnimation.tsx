import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useShouldPlayIntro } from "./useShouldPlayIntro";
import "./ForsaIntroAnimation.css";

type Phase = "idle" | "rising" | "greeting" | "smiling" | "exiting" | "done";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN_EXPO = [0.7, 0, 0.84, 0] as const;

/**
 * ForsaIntroAnimation
 * --------------------------------------------------------------------------
 * A cinematic website entrance animation featuring the Forsa event ticket character.
 * Performs a premium sequence of movements and visual transitions, then unmounts
 * to seamlessly reveal the website below.
 *
 * Timeline Steps:
 * 1. Screen starts dark/blank (300ms delay).
 * 2. Glassmorphic ticket rises from below, scaled, rotated, with Expo easing (1.1s).
 * 3. Subtle center bounce.
 * 4. Ticket tilts toward viewer; right arm lifts to welcome/point.
 * 5. Magic hand glow pulses and floating particles emit (1.2s).
 * 6. Ticket face smiles; pointing arm gently lowers (1.0s).
 * 7. Ticket falls down, exiting the screen with ease-in (800ms).
 * 8. Overlay fades out, fully revealing the SPA.
 */
export function ForsaIntroAnimation() {
  const [shouldPlay, markPlayed] = useShouldPlayIntro();
  const [phase, setPhase] = useState<Phase>(shouldPlay ? "idle" : "done");
  const [reducedMotion, setReducedMotion] = useState(false);

  // Monitor prefers-reduced-motion setting
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Lock scroll while intro is playing to maintain cinematic presentation
  useEffect(() => {
    if (phase !== "done") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // Step 1: Kickoff sequence
  useEffect(() => {
    if (!shouldPlay) return;
    markPlayed();

    if (reducedMotion) {
      const t = setTimeout(() => setPhase("done"), 500);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setPhase("rising"), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay, reducedMotion]);

  // Handle phase progression timeouts
  useEffect(() => {
    if (phase === "greeting") {
      const t = setTimeout(() => setPhase("smiling"), 1200);
      return () => clearTimeout(t);
    } else if (phase === "smiling") {
      const t = setTimeout(() => setPhase("exiting"), 1000);
      return () => clearTimeout(t);
    } else if (phase === "exiting") {
      const t = setTimeout(() => setPhase("done"), 800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (phase === "done") return null;

  // Reduced-motion path: short visual cross-fade
  if (reducedMotion) {
    return (
      <motion.div
        className="forsa-intro-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onAnimationComplete={() => setPhase("done")}
      />
    );
  }

  // Animation variants orchestrating the ticket card body
  const ticketVariants: Variants = {
    initial: {
      opacity: 0,
      y: 350,
      scale: 0.7,
      rotate: -8,
    },
    rising: {
      opacity: 1,
      y: [350, -8, 0],
      scale: [0.7, 1.04, 1],
      rotate: [-8, 3, 0],
      transition: {
        duration: 1.1,
        ease: EASE_OUT_EXPO,
        times: [0, 0.75, 1],
      },
    },
    greeting: {
      opacity: 1,
      y: [0, -4, 0],
      rotate: [0, -1.5, 0],
      scale: 1,
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "mirror" as const,
          duration: 2,
          ease: "easeInOut" as const,
        },
        rotate: {
          repeat: Infinity,
          repeatType: "mirror" as const,
          duration: 2.4,
          ease: "easeInOut" as const,
        },
      },
    },
    smiling: {
      opacity: 1,
      y: [0, -4, 0],
      rotate: [0, -1.5, 0],
      scale: 1,
      transition: {
        y: {
          repeat: Infinity,
          repeatType: "mirror" as const,
          duration: 2,
          ease: "easeInOut" as const,
        },
        rotate: {
          repeat: Infinity,
          repeatType: "mirror" as const,
          duration: 2.4,
          ease: "easeInOut" as const,
        },
      },
    },
    exiting: {
      opacity: 0,
      y: 350,
      scale: 0.85,
      rotate: 6,
      transition: {
        duration: 0.8,
        ease: EASE_IN_EXPO,
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="forsa-intro-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "exiting" ? 0 : 1 }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          delay: phase === "exiting" ? 0.2 : 0,
        }}
      >
        {/* Soft background light */}
        <div className="forsa-bg-glow" aria-hidden="true" />

        {/* Ambient floating magic dust */}
        <div className="forsa-intro-particles" aria-hidden="true">
          {(phase === "greeting" || phase === "smiling") &&
            Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={`forsa-particle forsa-particle-${i}`} />
            ))}
        </div>

        {/* Animated Ticket Character */}
        <motion.div
          className="forsa-ticket-container"
          initial="initial"
          animate={phase}
          variants={ticketVariants}
          onAnimationComplete={(definition) => {
            if (definition === "rising") {
              setPhase("greeting");
            }
          }}
        >
          <div className="forsa-ticket-card">
            {/* Vector glass shape with rounded corners & custom side notches */}
            <svg
              className="forsa-ticket-shape"
              viewBox="0 0 240 150"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ticket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.92)" />
                  <stop offset="45%" stopColor="rgba(255, 255, 255, 0.82)" />
                  <stop offset="100%" stopColor="rgba(240, 246, 255, 0.72)" />
                </linearGradient>
              </defs>
              <path
                d="M 0,12 A 12,12 0 0,1 12,0 H 228 A 12,12 0 0,1 240,12 V 64 A 11,11 0 0,1 240,86 V 138 A 12,12 0 0,1 228,150 H 12 A 12,12 0 0,1 0,138 V 86 A 11,11 0 0,1 0,64 Z"
                fill="url(#ticket-grad)"
                stroke="rgba(255, 255, 255, 0.55)"
                strokeWidth="1.5"
              />
            </svg>

            {/* Sweep light reflecting off the ticket surface */}
            <div className="forsa-ticket-reflection" aria-hidden="true" />

            {/* Perforation boundary separating main ticket body and stub */}
            <div className="forsa-ticket-perforation" aria-hidden="true" />

            {/* Main ticket layout content */}
            <div className="forsa-ticket-content">
              <span className="forsa-ticket-logo">Forsa</span>

              {/* Minimalist character face */}
              <div className="forsa-face" aria-hidden="true">
                <div className="forsa-eyes">
                  <div className="forsa-eye forsa-eye-left" />
                  <div className="forsa-eye forsa-eye-right" />
                </div>
                {/* SVG Mouth rendering smooth transitions */}
                <svg className="forsa-mouth" viewBox="0 0 24 12" width="24" height="12">
                  <motion.path
                    className="forsa-mouth-path"
                    d={
                      phase === "smiling" || phase === "exiting"
                        ? "M 4,4 Q 12,12 20,4" // Sweet curvature smile
                        : "M 4,6 Q 12,6 20,6"  // Calm neutral line
                    }
                    fill="none"
                    stroke="#1E40AF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    animate={{
                      d:
                        phase === "smiling" || phase === "exiting"
                          ? "M 4,4 Q 12,12 20,4"
                          : "M 4,6 Q 12,6 20,6",
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </svg>
              </div>
            </div>

            {/* Ticket stub section containing a decorative barcode representation */}
            <div className="forsa-ticket-stub" aria-hidden="true">
              <div className="forsa-barcode">
                <span className="forsa-barcode-line line-thin" />
                <span className="forsa-barcode-line line-thick" />
                <span className="forsa-barcode-line" />
                <span className="forsa-barcode-line line-thin" />
                <span className="forsa-barcode-line line-thick" />
              </div>
            </div>
          </div>

          {/* Left Arm: subtle breathing rotation */}
          <motion.div
            className="forsa-arm forsa-arm-left"
            aria-hidden="true"
            animate={
              phase === "greeting" || phase === "smiling"
                ? { rotate: [12, 16, 12] }
                : { rotate: 12 }
            }
            transition={
              phase === "greeting" || phase === "smiling"
                ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          >
            <div className="forsa-hand" />
          </motion.div>

          {/* Right Arm: points friendly during greeting, then lowers */}
          <motion.div
            className="forsa-arm forsa-arm-right"
            aria-hidden="true"
            animate={
              phase === "greeting"
                ? { rotate: -45, y: -8 }
                : { rotate: -12, y: 0 }
            }
            transition={{
              duration: 0.6,
              ease: EASE_OUT_EXPO,
            }}
          >
            <div className="forsa-hand">
              {phase === "greeting" && (
                <motion.div
                  className="forsa-hand-glow"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.55, 0.9, 0.55] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
