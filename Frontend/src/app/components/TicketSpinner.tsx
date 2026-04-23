import { motion } from "motion/react";

const TICKETS_COUNT = 12;
const RADIUS = 45;

export default function TicketSpinner() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}>
        {Array.from({ length: TICKETS_COUNT }).map((_, i) => {
          // Normalize timeline to a 0-1 range for the building effect
          // Tickets appear sequentially over the first 70% of the cycle
          const appearAt = (i / TICKETS_COUNT) * 0.7;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                // Rotate the container to point each ticket in the right direction
                transform: `rotate(${i * 30}deg)`,
                width: 0,
                height: 0,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 0 }}
                animate={{
                  opacity: [0, 0, 1, 1, 0],
                  scale: [0, 0, 1.1, 1, 0.5],
                  y: [0, 0, -RADIUS, -RADIUS, -RADIUS - 10],
                }}
                transition={{
                  duration: 1,
                  times: [0, appearAt, appearAt + 0.08, 0.85, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
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
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                  }}
                />
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
    width: "120px",
    height: "120px",
  },
};

