import React, { useLayoutEffect, useState } from 'react';

export interface ConcentricTicketLoaderProps {
  /** Whether the loader is active. Returns null if false. Default is true. */
  isLoading?: boolean;
  /** Optional loading message displayed beneath the spinner. */
  message?: string;
  /** Full-screen overlay mode (fixed at page center). Default is false for data components. */
  fullScreen?: boolean;
  /** Semi-transparent backdrop blur when in fullScreen mode. Default is true. */
  backdrop?: boolean;
  /** Additional custom class names. */
  className?: string;
}

/**
 * Concentric Ticket Loader Component
 * 
 * Geometry & Motion:
 * - Shared origin: Center of the page / loader canvas (60, 60).
 * - Ticket 1 origin distance = 0 (centered at origin, rotates Clockwise).
 * - Ticket 2 origin distance = 0 (centered at origin, rotates Counter-Clockwise).
 * - Line 1: Radius = 26px (farther than tickets).
 * - Line 2: Radius = 36px (farther than line 1).
 * - Line 3: Radius = 46px (farther than line 2).
 * - Line 4: Radius = 56px (farther than line 3).
 * 
 * Usage:
 * - Runs specifically when waiting for data responses or fetching page data.
 * - Does NOT trigger on every minor action or button click.
 */
export default function ConcentricTicketLoader({
  isLoading = false,
  message,
  fullScreen = false,
  backdrop = true,
  className = '',
}: ConcentricTicketLoaderProps) {
  if (!isLoading) return null;

  return (
    <div
      className={className}
      style={{
        ...(fullScreen ? styles.fullScreenWrapper : styles.inlineWrapper),
        ...(fullScreen && backdrop ? styles.backdrop : {}),
      }}
    >
      {/* Dynamic Keyframes for Shared Center Rotations */}
      <style>{`
        @keyframes rotateCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes rotateCCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }

        /* All revolving elements share origin at page/canvas center (60px 60px) */
        .ticket-cw,
        .ticket-ccw,
        .line-cw-x1,
        .line-ccw-x1,
        .line-cw-x2,
        .line-ccw-x2 {
          transform-origin: 60px 60px;
        }

        /* Ticket 1: Clockwise orbit (4s per rev) */
        .ticket-cw {
          animation: rotateCW 4s linear infinite;
        }

        /* Ticket 2: Counter-Clockwise orbit (4s per rev) */
        .ticket-ccw {
          animation: rotateCCW 4s linear infinite;
        }

        /* Line 1: Clockwise (2.5s) */
        .line-cw-x1 {
          animation: rotateCW 2.5s linear infinite;
        }

        /* Line 2: Counter-Clockwise (3.5s) */
        .line-ccw-x1 {
          animation: rotateCCW 3.5s linear infinite;
        }

        /* Line 3: Clockwise (4.5s) */
        .line-cw-x2 {
          animation: rotateCW 4.5s linear infinite;
        }

        /* Line 4: Counter-Clockwise (5.5s) */
        .line-ccw-x2 {
          animation: rotateCCW 5.5s linear infinite;
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.loaderCanvas}>
          <svg viewBox="0 0 120 120" style={styles.svgOverlay}>
            
            {/* ================= 4 CONCENTRIC ARCS (FARTHER OUTWARDS) ================= */}
            
            {/* Line 1: Radius = 26px (Farther than tickets at origin) */}
            <g className="line-cw-x1">
              <path
                d="M 60 34 A 26 26 0 0 1 86 60"
                fill="none"
                stroke="#75BBE2"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>

            {/* Line 2: Radius = 36px (Farther than line 1) */}
            <g className="line-ccw-x1">
              <path
                d="M 24 60 A 36 36 0 0 1 60 24"
                fill="none"
                stroke="#75BBE2"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>

            {/* Line 3: Radius = 46px (Farther than line 2) */}
            <g className="line-cw-x2">
              <path
                d="M 60 106 A 46 46 0 0 1 14 60"
                fill="none"
                stroke="#75BBE2"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />
            </g>

            {/* Line 4: Radius = 56px (Farther than line 3) */}
            <g className="line-ccw-x2">
              <path
                d="M 116 60 A 56 56 0 0 1 60 116"
                fill="none"
                stroke="#75BBE2"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.7"
              />
            </g>

            {/* ================= 2 MOVING TICKETS (ORIGIN DISTANCE = 0 AT CENTER) ================= */}
            
            {/* Ticket 1: Origin Distance = 0, Clockwise rotation */}
            <g className="ticket-cw">
              <g transform="translate(60, 60)">
                <g transform="translate(-13, -18)">
                  <CleanTicketSVG />
                </g>
              </g>
            </g>

            {/* Ticket 2: Origin Distance = 0, Counter-Clockwise rotation */}
            <g className="ticket-ccw">
              <g transform="translate(60, 60) rotate(90)">
                <g transform="translate(-13, -18)">
                  <CleanTicketSVG opacity={0.85} />
                </g>
              </g>
            </g>

          </svg>
        </div>

        {message && <p style={styles.messageText}>{message}</p>}
      </div>
    </div>
  );
}

export { ConcentricTicketLoader as LoadingPage, ConcentricTicketLoader as DataLoader, ConcentricTicketLoader as GlobalLoadingOverlay };

/**
 * Tracks all browser fetch requests made while the application is mounted.
 * A counter, rather than a boolean, keeps the overlay visible until concurrent
 * requests have all completed.
 */
export function GlobalRequestLoader() {
  const [pendingRequests, setPendingRequests] = useState(0);

  useLayoutEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = (...args) => {
      setPendingRequests((count) => count + 1);

      try {
        return originalFetch(...args).finally(() => {
          setPendingRequests((count) => Math.max(0, count - 1));
        });
      } catch (error) {
        setPendingRequests((count) => Math.max(0, count - 1));
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <ConcentricTicketLoader
      isLoading={pendingRequests > 0}
      fullScreen
      message="Loading..."
    />
  );
}

/* ---------------- Ticket SVG Component ---------------- */
function CleanTicketSVG({ opacity = 1 }: { opacity?: number }) {
  return (
    <svg
      width="26"
      height="36"
      viewBox="0 0 26 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        opacity,
        filter: 'drop-shadow(0px 2px 5px rgba(12, 53, 113, 0.4))',
      }}
    >
      {/* Main Ticket Shape in #0C3571 */}
      <path
        d="M 2 0 
           H 24 
           A 2 2 0 0 1 26 2 
           V 15 
           A 3 3 0 0 0 26 21 
           V 34 
           A 2 2 0 0 1 24 36 
           H 2 
           A 2 2 0 0 1 0 34 
           V 21 
           A 3 3 0 0 0 0 15 
           V 2 
           A 2 2 0 0 1 2 0 Z"
        fill="#0C3571"
      />

      {/* Dashed Separator Line in #75BBE2 */}
      <line
        x1="4"
        y1="18"
        x2="22"
        y2="18"
        stroke="#75BBE2"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />

      {/* Graphic Elements */}
      <circle cx="13" cy="9" r="3.5" fill="#75BBE2" opacity="0.35" />
      <rect x="8" y="24" width="10" height="2" rx="1" fill="#75BBE2" opacity="0.5" />
      <rect x="10" y="28" width="6" height="1.5" rx="0.75" fill="#75BBE2" opacity="0.3" />
    </svg>
  );
}

/* ---------------- Layout & Style Specs ---------------- */
const styles = {
  fullScreenWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
  },
  backdrop: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(4px)',
  },
  inlineWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    width: '100%',
  },
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  loaderCanvas: {
    position: 'relative' as const,
    width: '140px',
    height: '140px',
  },
  svgOverlay: {
    width: '100%',
    height: '100%',
    overflow: 'visible' as const,
  },
  messageText: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0C3571',
    letterSpacing: '0.02em',
    marginTop: '4px',
  },
};
