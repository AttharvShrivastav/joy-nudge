
import { motion } from "framer-motion";
import BreathingNudge from "./nudges/BreathingNudge";
import TimerNudge from "./nudges/TimerNudge";
import ObservationalNudge from "./nudges/ObservationalNudge";
import ReflectiveNudge from "./nudges/ReflectiveNudge";

interface NudgeData {
  id: number;
  nudge: string;
  description: string;
  affirmation: string;
  type: string;
  duration?: number;
  items?: string[];
  interactive_type?: string;
  title?: string;
  category?: string;
}

interface InteractiveNudgeProps {
  nudge: NudgeData;
  onComplete: () => void;
}

export default function InteractiveNudge({ nudge, onComplete }: InteractiveNudgeProps) {
  // Handle both old format (type) and new format (interactive_type)
  const nudgeType = nudge.type || nudge.interactive_type?.toLowerCase() || 'reflective';
  
  // Map database interactive_type to component types
  const typeMapping = {
    'BREATHING': 'breathing',
    'TIMED': 'timer', 
    'OBSERVATIONAL': 'observational',
    'REFLECTIVE': 'reflective',
    'NONE': 'simple' // Simple completion for NONE type
  };

  const componentType = typeMapping[nudge.interactive_type as keyof typeof typeMapping] || nudgeType;

  // Wrapper with consistent smooth animations
  const AnimatedWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ 
        duration: 0.5, 
        ease: "easeOut",
        type: "spring",
        stiffness: 200
      }}
    >
      {children}
    </motion.div>
  );

  switch (componentType) {
    case "breathing":
      return (
        <AnimatedWrapper>
          <BreathingNudge nudge={nudge} onComplete={onComplete} />
        </AnimatedWrapper>
      );
    
    case "timer":
    case "timed":
      return (
        <AnimatedWrapper>
          <TimerNudge nudge={nudge} onComplete={onComplete} />
        </AnimatedWrapper>
      );
    
    case "observational":
      return (
        <AnimatedWrapper>
          <ObservationalNudge nudge={nudge} onComplete={onComplete} />
        </AnimatedWrapper>
      );
    
    case "reflective":
      return (
        <AnimatedWrapper>
          <ReflectiveNudge nudge={nudge} onComplete={onComplete} />
        </AnimatedWrapper>
      );
    
    case "simple":
    default:
      return (
        <AnimatedWrapper>
          <ReflectiveNudge nudge={nudge} onComplete={onComplete} />
        </AnimatedWrapper>
      );
  }
}
