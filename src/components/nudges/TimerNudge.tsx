
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TimerNudgeProps {
  nudge: {
    nudge: string;
    duration?: number;
  };
  onComplete: () => void;
}

export default function TimerNudge({ nudge, onComplete }: TimerNudgeProps) {
  const [timeLeft, setTimeLeft] = useState(nudge.duration || 60);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((nudge.duration! - timeLeft) / nudge.duration!) * 100;
  
  return (
    <div className="joy-card p-8 text-center">
      <h3 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-6">
        {nudge.nudge}
      </h3>
      
      <div className="mb-8">
        <div className="text-4xl font-nunito font-bold text-joy-steel-blue mb-4">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        <div className="w-full bg-joy-light-blue/30 rounded-full h-3">
          <motion.div
            className="h-3 bg-joy-coral rounded-full"
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <p className="text-joy-steel-blue font-lato">
        Keep going, you're doing great!
      </p>
    </div>
  );
}
