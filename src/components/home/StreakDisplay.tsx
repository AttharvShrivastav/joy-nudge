
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  streak: number;
}

export default function StreakDisplay({ streak }: StreakDisplayProps) {
  const getStreakDisplay = () => {
    if (streak >= 30) {
      return { emoji: "🏆", color: "from-joy-coral via-orange-400 to-red-500", message: "Streak Master!" };
    } else if (streak >= 14) {
      return { emoji: "🌟", color: "from-joy-coral via-orange-400 to-red-400", message: "Two Weeks Strong!" };
    } else if (streak >= 7) {
      return { emoji: "🔥", color: "from-joy-coral via-orange-400 to-red-500", message: "One Week!" };
    } else if (streak >= 3) {
      return { emoji: "⚡", color: "from-joy-coral via-orange-400 to-red-400", message: "Building momentum!" };
    }
    return { emoji: "🌱", color: "from-joy-coral via-orange-300 to-red-300", message: "Getting started!" };
  };

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
        
        <div className="text-2xl relative z-10">{streakDisplay.emoji}</div>
        <div className="text-center relative z-10">
          <div className="font-nunito font-bold text-2xl text-white drop-shadow-sm">{streak}</div>
          <div className="font-lato text-white text-xs opacity-90 drop-shadow-sm">{streakDisplay.message}</div>
        </div>
        <Flame className="text-white/90 relative z-10 drop-shadow-sm" size={22} />
      </div>
    </motion.div>
  );
}
