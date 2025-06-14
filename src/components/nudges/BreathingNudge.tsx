
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface BreathingNudgeProps {
  nudge: {
    nudge: string;
    duration?: number;
  };
  onComplete: () => void;
  onSkip?: () => void;
}

export default function BreathingNudge({ nudge, onComplete, onSkip }: BreathingNudgeProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const phases = [
    { name: "Inhale", duration: 4000, scale: 1.4 },
    { name: "Hold", duration: 3000, scale: 1.4 },
    { name: "Exhale", duration: 4000, scale: 1.0 }
  ];
  const totalCycles = nudge.duration || 3;

  // Enhanced sound effect function for breathing
  const playBreathingSound = (phase: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createBreathingTone = (startFreq: number, endFreq: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(endFreq, audioContext.currentTime + duration);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + duration - 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      switch (phase) {
        case 'Inhale':
          createBreathingTone(200, 400, 3.5); // Ascending tone
          break;
        case 'Exhale':
          createBreathingTone(400, 200, 3.5); // Descending tone
          break;
        case 'Hold':
          createBreathingTone(300, 300, 2.5); // Steady tone
          break;
      }
    } catch (error) {
      console.log('Audio not available:', error);
    }
  };
  
  useEffect(() => {
    const currentPhaseDuration = phases[currentPhase % 3].duration;
    const phaseData = phases[currentPhase % 3];
    
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
    <div className="space-y-6">
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
      
      <p className="text-joy-steel-blue font-lato mb-4 text-center">
        Cycle {currentCycle} of {totalCycles}
      </p>
      
      <div className="text-sm text-joy-steel-blue/70 font-lato text-center mb-4">
        Follow the gentle sounds and visual guide
      </div>

      {onSkip && (
        <div className="flex justify-center">
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
    </div>
  );
}
