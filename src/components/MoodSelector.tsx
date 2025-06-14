
import { useState } from "react";
import { motion } from "framer-motion";

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
  onSkip: () => void;
}

const moods = [
  { emoji: "😊", name: "Happy", value: "happy" },
  { emoji: "😌", name: "Calm", value: "calm" },
  { emoji: "😴", name: "Tired", value: "tired" },
  { emoji: "😤", name: "Stressed", value: "stressed" },
  { emoji: "🤔", name: "Thoughtful", value: "thoughtful" },
  { emoji: "😔", name: "Low", value: "low" },
  { emoji: "⚡", name: "Energetic", value: "energetic" },
  { emoji: "🌟", name: "Inspired", value: "inspired" }
];

export default function MoodSelector({ onMoodSelect, onSkip }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodClick = (mood: string) => {
    setSelectedMood(mood);
    setTimeout(() => onMoodSelect(mood), 300);
  };

  return (
    <div className="fixed inset-0 bg-joy-white z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="joy-card p-6 w-full max-w-md"
      >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-nunito font-bold text-joy-dark-blue mb-3 text-center"
        >
          How are you feeling?
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-joy-steel-blue font-lato text-center mb-6"
        >
          This helps us suggest the perfect nudge for you right now
        </motion.p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {moods.map((mood, index) => (
            <motion.button
              key={mood.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => handleMoodClick(mood.value)}
              className={`joy-card p-4 text-center transition-all duration-200 hover:scale-105 ${
                selectedMood === mood.value ? 'ring-2 ring-joy-coral bg-joy-coral/10' : ''
              }`}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="font-nunito font-medium text-joy-dark-blue text-sm">{mood.name}</div>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onSkip}
          className="w-full joy-button-secondary text-sm"
        >
          Skip for now
        </motion.button>
      </motion.div>
    </div>
  );
}
