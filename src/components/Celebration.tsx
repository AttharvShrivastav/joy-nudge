
import { motion } from "framer-motion";

const SPARKLES = [
  { x: 0, y: 0, c: "#FFDDAA" },
  { x: -32, y: 4, c: "#B0E0E6" },
  { x: 26, y: -8, c: "#CDEAC0" },
  { x: -16, y: -28, c: "#FFD6EB" },
  { x: 18, y: 22, c: "#FFFACD" }
];

export default function Celebration({ show }: { show: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex justify-center items-center z-50">
      {show && (
        <div className="relative">
          {/* Confetti sparkles */}
          <svg width={90} height={90} className="absolute inset-0">
            {SPARKLES.map((s, i) => (
              <motion.circle
                key={i}
                cx={45 + s.x}
                cy={45 + s.y}
                r="7"
                fill={s.c}
                initial={{ scale: 0, opacity: 0.2 }}
                animate={{ scale: [1.1, 1.6, 0.7], opacity: [0.95, 1, 0] }}
                transition={{
                  duration: 1.1,
                  delay: i * 0.07,
                  ease: [0.2, 0.6, 0.4, 1]
                }}
              />
            ))}
          </svg>
          
          {/* Joy Nudge logo in the center */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            transition={{
              duration: 1.2,
              delay: 0.3,
              ease: [0.2, 0.6, 0.4, 1]
            }}
            className="flex items-center justify-center"
          >
            <img 
              src="/lovable-uploads/424186e2-de89-4a2a-a690-1d1d0f47bbe8.png" 
              alt="Joy Nudge" 
              className="w-12 h-12 rounded-full"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
