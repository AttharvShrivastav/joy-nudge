
import { motion } from "framer-motion";
import { Focus } from "lucide-react";

interface FocusModeButtonProps {
  onFocusClick: () => void;
  playSound: (type: string) => void;
}

export default function FocusModeButton({ onFocusClick, playSound }: FocusModeButtonProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          playSound('button_press');
          onFocusClick();
        }}
        className="w-full bg-gradient-to-r from-joy-steel-blue to-joy-dark-blue text-white rounded-xl p-4 flex items-center justify-center gap-3 hover:from-joy-dark-blue hover:to-joy-steel-blue transition-all duration-200 shadow-lg"
      >
        <Focus className="w-6 h-6" />
        <div className="text-left">
          <div className="font-nunito font-semibold text-lg">Start Focus Time</div>
          <div className="font-lato text-sm opacity-90">Deep work with joy</div>
        </div>
      </motion.button>
    </motion.div>
  );
}
