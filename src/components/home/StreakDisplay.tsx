
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  streak: number;
}

/** A simple SVG plant icon, styled for the StreakDisplay */
function PlantIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      width={28}
      height={28}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 29V14M16 14C16 14 17.508 7.629 23.5 7.984C29.492 8.34 27.843 16.009 22.36 17.686C16.876 19.363 16 14 16 14ZM16 14C16 14 14.492 7.629 8.5 7.984C2.508 8.34 4.157 16.009 9.64 17.686C15.124 19.363 16 14 16 14Z" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="16" cy="23.5" rx="3" ry="2.5" fill="#53C270"/>
    </svg>
  );
}

export default function StreakDisplay({ streak }: StreakDisplayProps) {
  const getStreakDisplay = () => {
    if (streak >= 30) {
      return { icon: <span role="img" aria-label="trophy">🏆</span>, color: "from-joy-coral via-orange-400 to-red-500", message: "Streak Master!" };
    } else if (streak >= 14) {
      return { icon: <span role="img" aria-label="star">🌟</span>, color: "from-joy-coral via-orange-400 to-red-400", message: "Two Weeks Strong!" };
    } else if (streak >= 7) {
      return { icon: <span role="img" aria-label="fire">🔥</span>, color: "from-joy-coral via-orange-400 to-red-500", message: "One Week!" };
    } else if (streak >= 3) {
      return { icon: <span role="img" aria-label="bolt">⚡</span>, color: "from-joy-coral via-orange-400 to-red-400", message: "Building momentum!" };
    }
    // SVG Plant icon for "Getting started!"
    return { icon: <PlantIcon />, color: "from-joy-coral via-orange-300 to-red-300", message: "Getting started!" };
  };

  // Display actual streak value from backend
  const streakDisplayNumber = streak || 0;
  const streakDisplay = getStreakDisplay();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex justify-center items-center mb-6"
    >
      <div className="flex items-center gap-3 bg-joy-coral px-6 py-3 rounded-full shadow-lg border-2 border-white/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
        <div className="text-2xl relative z-10 flex items-center">
          {streakDisplay.icon}
        </div>
        <div className="text-center relative z-10">
          <div className="font-nunito font-bold text-2xl text-white drop-shadow-sm">{streakDisplayNumber}</div>
          <div className="font-lato text-white text-xs opacity-90 drop-shadow-sm">{streakDisplay.message}</div>
        </div>
        <Flame className="text-white/90 relative z-10 drop-shadow-sm" size={22} />
      </div>
    </motion.div>
  );
}
