import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "../ui/textarea";

interface ReflectiveNudgeProps {
  nudge: {
    nudge: string;
    description?: string;
  };
  onComplete: () => void;
  onSkip?: () => void;
}

export default function ReflectiveNudge({ nudge, onComplete, onSkip }: ReflectiveNudgeProps) {
  const [reflection, setReflection] = useState("");
  const [wordCount, setWordCount] = useState(0);
  
  const saveReflection = (text: string) => {
    const reflections = JSON.parse(localStorage.getItem('joyReflections') || '[]');
    reflections.push({
      id: Date.now(),
      nudgeTitle: nudge.nudge,
      reflection: text,
      date: new Date().toISOString(),
      wordCount: text.trim().split(/\s+/).length
    });
    localStorage.setItem('joyReflections', JSON.stringify(reflections));
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReflection(text);
    
    // Count words (split by whitespace and filter empty strings)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };
  
  const handleSave = () => {
    if (reflection.trim()) {
      saveReflection(reflection.trim());
      onComplete();
    }
  };
  
  const minWords = 10;
  const hasEnoughWords = wordCount >= minWords;
  
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <div className="text-sm text-joy-steel-blue font-lato mb-2">
          {nudge.description || "Take your time to reflect and write from the heart..."}
        </div>
        <div className="text-xs text-joy-steel-blue">
          {wordCount} words {!hasEnoughWords && `(${minWords - wordCount} more to continue)`}
        </div>
      </div>
      
      <Textarea
        value={reflection}
        onChange={handleTextChange}
        placeholder="Let your thoughts flow freely here... What's on your mind? How are you feeling? What are you grateful for?"
        className="w-full h-40 p-4 bg-joy-white border-2 border-joy-light-blue rounded-xl font-lato text-joy-dark-blue placeholder-joy-steel-blue/60 resize-none focus:border-joy-steel-blue focus:outline-none transition-colors text-base leading-relaxed"
        style={{
          fontFamily: 'Lato, sans-serif',
          lineHeight: '1.6'
        }}
      />
      
      <button
        onClick={handleSave}
        disabled={!hasEnoughWords}
        className={`w-full mt-4 py-3 rounded-xl font-nunito font-semibold transition-all ${
          hasEnoughWords
            ? 'joy-button-primary'
            : 'bg-joy-light-blue/50 text-joy-steel-blue/50 cursor-not-allowed'
        }`}
      >
        {hasEnoughWords ? 'Save Reflection' : `Write ${minWords - wordCount} more words`}
      </button>
      
      {onSkip && (
        <div className="flex justify-center mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSkip}
            className="joy-button-secondary text-sm px-4 py-2"
          >
            Skip
          </motion.button>
        </div>
      )}
      
      {reflection.length > 100 && (
        <div className="mt-3 text-center">
          <div className="text-sm text-joy-steel-blue font-lato italic">
            "Every word you write is a step toward greater self-awareness 💫"
          </div>
        </div>
      )}
    </div>
  );
}
