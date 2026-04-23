import { motion } from "framer-motion";

const TICKETS_COUNT = 12;
const RADIUS = 60;

export default function TicketSpinner() {
  return (
    <div style={styles.container}>
      <motion.div
        style={styles.spinner}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        {Array.from({ length: TICKETS_COUNT }).map((_, i) => {
          const angle = (360 / TICKETS_COUNT) * i;

          return (
            <motion.img
              key={i}
              src="/ticket.svg"
              style={{
                ...styles.ticket,
                transform: `rotate(${angle}deg) translateY(-${RADIUS}px)`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          );
        })}
      </motion.div>
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
    background: "#0f172a",
  },

  spinner: {
    position: "relative" as const,
    width: "150px",
    height: "150px",
  },

  ticket: {
    position: "absolute" as const,
    width: "28px",
    left: "50%",
    top: "50%",
    transformOrigin: "center bottom",
  },
};