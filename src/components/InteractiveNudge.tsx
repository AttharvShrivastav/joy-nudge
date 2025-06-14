
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
}

interface InteractiveNudgeProps {
  nudge: NudgeData;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function InteractiveNudge({ nudge, onComplete, onSkip }: InteractiveNudgeProps) {
  const nudgeType = nudge.type || nudge.interactive_type?.toLowerCase() || 'reflective';
  
  const typeMapping = {
    'BREATHING': 'breathe',
    'TIMED': 'timer', 
    'OBSERVATIONAL': 'observational',
    'REFLECTIVE': 'reflective',
    'NONE': 'reflective'
  };

  const componentType = typeMapping[nudge.interactive_type as keyof typeof typeMapping] || nudgeType;

  switch (componentType) {
    case "breathe":
    case "breathing":
      return <BreathingNudge nudge={nudge} onComplete={onComplete} onSkip={onSkip} />;
    
    case "timer":
    case "timed":
      return <TimerNudge nudge={nudge} onComplete={onComplete} onSkip={onSkip} />;
    
    case "observational":
      return <ObservationalNudge nudge={nudge} onComplete={onComplete} onSkip={onSkip} />;
    
    case "reflective":
    default:
      return <ReflectiveNudge nudge={nudge} onComplete={onComplete} onSkip={onSkip} />;
  }
}
