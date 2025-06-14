
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface BreathingNudgeProps {
  nudge: {
    nudge: string;
    duration?: number;
  };
  onComplete: () => void;
}

export default function BreathingNudge({ nudge, onComplete }: BreathingNudgeProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const phases = [
    { name: "Inhale", duration: 4000, scale: 1.4 },
    { name: "Hold", duration: 3000, scale: 1.4 },
    { name: "Exhale", duration: 4000, scale: 1.0 }
  ];
  const totalCycles = nudge.duration || 3;

  // Sound effect function for breathing
  const playBreathingSound = (phase: string) => {
    try {
      const audio = new Audio();
      switch (phase) {
        case 'Inhale':
          // Ascending tone for inhale
          audio.src = 'data:audio/wav;base64,UklGRhwEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfgDAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj';
          break;
        case 'Exhale':
          // Descending tone for exhale
          audio.src = 'data:audio/wav;base64,UklGRiAEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfwDAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj';
          break;
        case 'Hold':
          // Neutral tone for hold
          audio.src = 'data:audio/wav;base64,UklGRhgEAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfQDAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj';
          break;
      }
      audio.volume = 0.2;
      audio.play().catch(() => {}); // Silently fail if audio can't play
    } catch (error) {
      // Silently handle audio errors
    }
  };
  
  useEffect(() => {
    const currentPhaseDuration = phases[currentPhase % 3].duration;
    const phaseData = phases[currentPhase % 3];
    
    // Play sound for current phase
    playBreathingSound(phaseData.name);
    
    const timer = setTimeout(() => {
      if (Math.floor(currentPhase / 3) >= totalCycles) {
        onComplete();
        return;
      }
      setCurrentPhase(prev => prev + 1);
    }, currentPhaseDuration);
    
    return () => clearTimeout(timer);
  }, [currentPhase, totalCycles, onComplete]);
  
  const currentCycle = Math.floor(currentPhase / 3) + 1;
  const phaseInCycle = currentPhase % 3;
  const currentPhaseData = phases[phaseInCycle];
  
  return (
    <div className="joy-card p-8 text-center">
      <h3 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-6">
        {nudge.nudge}
      </h3>
      
      <div className="mb-8">
        <motion.div
          className="w-32 h-32 mx-auto bg-gradient-to-br from-joy-coral/20 to-joy-steel-blue/20 rounded-full flex items-center justify-center border-4 border-joy-steel-blue/30"
          animate={{
            scale: currentPhaseData.scale,
          }}
          transition={{ 
            duration: currentPhaseData.duration / 1000, 
            ease: phaseInCycle === 1 ? "linear" : "easeInOut"
          }}
        >
          <span className="text-joy-steel-blue text-xl font-nunito font-semibold">
            {currentPhaseData.name}
          </span>
        </motion.div>
      </div>
      
      <p className="text-joy-steel-blue font-lato mb-4">
        Cycle {currentCycle} of {totalCycles}
      </p>
      
      <div className="text-sm text-joy-steel-blue/70 font-lato">
        Follow the gentle sounds and visual guide
      </div>
    </div>
  );
}
