
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
}

interface InteractiveNudgeProps {
  nudge: NudgeData;
  onComplete: () => void;
}

export default function InteractiveNudge({ nudge, onComplete }: InteractiveNudgeProps) {
  switch (nudge.type) {
    case "breathe":
      return <BreathingNudge nudge={nudge} onComplete={onComplete} />;
    
    case "timer":
      return <TimerNudge nudge={nudge} onComplete={onComplete} />;
    
    case "observational":
      return <ObservationalNudge nudge={nudge} onComplete={onComplete} />;
    
    case "reflective":
      return <ReflectiveNudge nudge={nudge} onComplete={onComplete} />;
    
    default:
      return null;
  }
}
