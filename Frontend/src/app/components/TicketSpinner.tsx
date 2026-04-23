import { motion } from "motion/react";

const TICKETS_COUNT = 12;
const ANGLE_STEP = 360 / TICKETS_COUNT; // 30 degrees
const RADIUS = 80;
const TOTAL_DURATION = 3; // seconds

export default function TicketSpinner() {
  // Each ticket sweeps exactly 30° from the previous ticket's position.
  // Ticket 0: appears at 0° (no sweep)
  // Ticket 1: starts at 0°, sweeps to 30°
  // Ticket 2: starts at 30°, sweeps to 60°
  // ...
  // Ticket i: starts at (i-1)*30°, sweeps to i*30°

  const SWEEP_FRACTION = 0.7 / TICKETS_COUNT; // fraction of total duration per sweep

  return (
    <div style={styles.container}>
      <div style={styles.spinner}>
        {Array.from({ length: TICKETS_COUNT }).map((_, i) => {
          // Start angle: where the previous ticket ended
          const startAngle = i === 0 ? 0 : (i - 1) * ANGLE_STEP;
          // End angle: this ticket's final position
          const endAngle = i * ANGLE_STEP;

          // When this ticket appears in the timeline (0–1)
          const appearAt = i * SWEEP_FRACTION;
          // When it finishes sweeping
          const sweepEnd = appearAt + SWEEP_FRACTION;
          // Hold until this point, then fade
          const holdEnd = 0.85;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 0,
                height: 0,
              }}
            >
              {/* Handles the circular sweep from startAngle to endAngle */}
              <motion.div
                animate={{
                  rotate: [startAngle, startAngle, endAngle, endAngle, endAngle],
                  opacity: [0, 0, 1, 1, 0],
                }}
                transition={{
                  duration: TOTAL_DURATION,
                  times: [0, appearAt, sweepEnd, holdEnd, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  // Rotation pivot = center of spinner (where this div sits)
                  transformOrigin: "0 0",
                  width: 0,
                  height: 0,
                  position: "absolute",
                }}
              >
                {/* Ticket placed at RADIUS along y+ axis, pointing outward */}
                <div
                  style={{
                    position: "absolute",
                    transform: `translateY(-${RADIUS}px)`,
                    transformOrigin: "center bottom",
                    width: "32px",
                    marginLeft: "-16px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src="/blackTicket.svg"
                    alt="Ticket"
                    style={{
                      width: "100%",
                      height: "auto",
                      filter: "drop-shadow(0 2px 4px rgba(46, 123, 117, 0.4))",
                    }}
                  />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "var(--background)",
    overflow: "hidden",
  },
  spinner: {
    position: "relative" as const,
    width: "200px",
    height: "200px",
  },
};

