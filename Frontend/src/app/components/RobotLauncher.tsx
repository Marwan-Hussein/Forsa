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
 * A cute, premium, animated robot launcher based on the Forsa AI chatbot design.
 * Features a circular tech background, 3D gradient robot head & chest, Forsa logo,
 * glowing headphones, antenna, and a floating typing speech bubble.
 * Stands out clearly on both light and dark page backgrounds due to its integrated
 * deep indigo/navy circular frame.
 */
export function RobotLauncher({ isOpen, onOpen }: RobotLauncherProps) {
  const [hasEntered, setHasEntered] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number }[]>([]);

  const prefersReducedMotion = useRef(false);

  // Detect the user's reduced-motion preference once on mount.
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // Entrance delay
  useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 500);
    return () => clearTimeout(t);
  }, []);

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
        {isHovered && (
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
          isClicked ? "robot-clicked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="robot-glow" aria-hidden="true" />

        <div className="robot-circle-frame" aria-hidden="true">
          {/* Tech lines background */}
          <svg className="robot-bg-lines" viewBox="0 0 100 100" fill="none">
            <path
              d="M10,65 L28,65 L36,73 L46,73"
              stroke="rgba(0, 240, 255, 0.22)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M85,55 L75,55 L68,62 L55,62"
              stroke="rgba(0, 240, 255, 0.18)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="46" cy="73" r="1.5" fill="rgba(0, 240, 255, 0.45)" />
            <circle cx="55" cy="62" r="1.5" fill="rgba(0, 240, 255, 0.35)" />
          </svg>

          {/* Robot character */}
          <div className="robot-avatar">
            {/* Antenna */}
            <div className="robot-new-antenna">
              <div className="antenna-stem" />
              <div className="antenna-tip-glow" />
            </div>

            {/* Side headphones/ears */}
            <div className="robot-new-ear ear-left" />
            <div className="robot-new-ear ear-right" />

            {/* Head */}
            <div className="robot-new-head">
              <div className="robot-new-face">
                {/* Smiley Eyes */}
                <div className="robot-new-eyes">
                  <span className="robot-new-eye left-eye">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path
                        d="M 4,12 Q 10,5 16,12"
                        stroke="#00f0ff"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="robot-new-eye right-eye">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path
                        d="M 4,12 Q 10,5 16,12"
                        stroke="#00f0ff"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Body / Torso */}
            <div className="robot-new-torso">
              {/* Chest logo (Forsa graduate/tickets symbol) */}
              <div className="robot-new-logo">
                <svg
                  viewBox="0 0 100 100"
                  className="chest-logo-svg"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Graduation Cap */}
                  <path d="M 40,24 L 52,18 L 64,24 L 52,30 Z" fill="#0080a4" />
                  <path d="M 52,30 L 52,35" stroke="#0080a4" strokeWidth="1.5" />
                  <circle cx="64" cy="27" r="1.5" fill="#00f0ff" />
                  {/* Head */}
                  <circle cx="52" cy="35" r="5" fill="#0080a4" />
                  {/* Reaching up limbs */}
                  <path
                    d="M 52,50 C 46,46 39,40 37,32"
                    stroke="#0080a4"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 52,50 C 58,54 66,62 70,72"
                    stroke="#0080a4"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 52,50 C 46,58 38,68 35,74"
                    stroke="#0080a4"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Tickets */}
                  <g transform="translate(29, 18) rotate(-15)">
                    <rect
                      x="0"
                      y="0"
                      width="6"
                      height="10"
                      rx="1"
                      fill="#00e5ff"
                      stroke="#0080a4"
                      strokeWidth="0.8"
                    />
                    <circle cx="3" cy="5" r="1" fill="#0080a4" />
                  </g>
                  <g transform="translate(34, 16) rotate(15)">
                    <rect
                      x="0"
                      y="0"
                      width="6"
                      height="10"
                      rx="1"
                      fill="#00e5ff"
                      stroke="#0080a4"
                      strokeWidth="0.8"
                    />
                    <circle cx="3" cy="5" r="1" fill="#0080a4" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Floating typing dots speech bubble */}
          <div className="robot-dot-bubble">
            <div className="dot-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>

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
