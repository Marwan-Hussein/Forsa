import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./RobotLauncher.css";

interface RobotLauncherProps {
  /** Whether the chat window is currently open. The robot hides itself while open. */
  isOpen: boolean;
  /** Called once the click animation finishes, to actually open the chat. */
  onOpen: () => void;
}

const GREETING_TEXT = "Ask Forsa Chatbot";

/**
 * A cute, premium, animated robot that acts as the launcher for the
 * Forsa AI chat assistant. Fully self-contained: handles its own
 * entrance, idle motion, looping greeting bubble, hover/click states,
 * and accessibility. Rendering only — actually opening the chat is left
 * to the parent via `onOpen`.
 */
export function RobotLauncher({ isOpen, onOpen }: RobotLauncherProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number }[]>([]);

  const prefersReducedMotion = useRef(false);
  const loopTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Detect the user's reduced-motion preference once on mount.
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // --- Entrance: the robot does not exist until ~500ms after mount ---
  useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 500);
    return () => clearTimeout(t);
  }, []);

  // // --- Looping greeting cycle: wave -> bubble in -> pause -> bubble out -> wait -> repeat ---
  // useEffect(() => {
  //   if (!hasEntered || isOpen) return;
  //   if (prefersReducedMotion.current) return; // don't force a repeating animation

  //   const clearAll = () => {
  //     loopTimeouts.current.forEach(clearTimeout);
  //     loopTimeouts.current = [];
  //   };

  //   const BUBBLE_VISIBLE_MS = 3500;
  //   const WAIT_BETWEEN_MS = 2500;

  //   const runCycle = () => {
  //     setIsWaving(true);
  //     const t1 = setTimeout(() => setShowBubble(true), 300);
  //     const t2 = setTimeout(() => {
  //       setShowBubble(false);
  //       setIsWaving(false);
  //     }, 300 + BUBBLE_VISIBLE_MS);
  //     const t3 = setTimeout(runCycle, 300 + BUBBLE_VISIBLE_MS + WAIT_BETWEEN_MS);
  //     loopTimeouts.current.push(t1, t2, t3);
  //   };

  //   const initialDelay = setTimeout(runCycle, 400);
  //   loopTimeouts.current.push(initialDelay);

  //   return clearAll;
  // }, [hasEntered, isOpen]);

  // Hide the greeting the moment the chat opens.
  useEffect(() => {
    if (isOpen) {
      setIsWaving(false);
    }
  }, [isOpen]);

  const spawnParticles = () => {
    const burst = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      angle: (360 / 8) * i,
    }));
    setParticles(burst);
    setTimeout(() => setParticles([]), 650);
  };

  const handleActivate = () => {
    if (isClicked) return;
    setIsClicked(true);
    spawnParticles();
    setTimeout(() => {
      setIsClicked(false);
      onOpen();
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
  };

  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      <AnimatePresence>
        {isHovered  && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="robot-speech-bubble mb-3 ml-2"
            role="status"
          >
            <span className="robot-speech-text">{GREETING_TEXT}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Open Forsa AI Assistant"
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        initial={{ opacity: 0, scale: 0, y: 24, rotate: -12 }}
        animate={
          hasEntered
            ? { opacity: 1, scale: 1, y: 0, rotate: 0 }
            : { opacity: 0, scale: 0, y: 24, rotate: -12 }
        }
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={[
          "robot-launcher",
          isHovered ? "robot-hovered" : "",
          isHovered ? "robot-waving" : "",
          isClicked ? "robot-clicked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="robot-glow" aria-hidden="true" />

        <span className="robot-body" aria-hidden="true">
          <span className="robot-antenna">
            <span className="robot-antenna-tip" />
          </span>

          <span className="robot-head">
            <span className="robot-eye robot-eye-left" />
            <span className="robot-eye robot-eye-right" />
          </span>

          <span className="robot-arm robot-arm-left" />
          <span className="robot-arm robot-arm-right" />
        </span>

        {particles.map((p) => (
          <span
            key={p.id}
            className="robot-particle"
            aria-hidden="true"
            style={{ "--angle": `${p.angle}deg` } as React.CSSProperties}
          />
        ))}
      </motion.button>
    </div>
  );
}
