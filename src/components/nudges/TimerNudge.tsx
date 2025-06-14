
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
  const [hasStarted, setHasStarted] = useState(false);
  
  // Play timer sounds
  const playTimerSound = (type: string) => {
    try {
      const audio = new Audio();
      switch (type) {
        case 'start':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj';
          break;
        case 'end':
          audio.src = 'data:audio/wav;base64,UklGRpAGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YWwGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj';
          break;
      }
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Silently fail if audio can't play
    } catch (error) {
      // Silently handle audio errors
    }
  };

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      playTimerSound('start');
    }
  }, []);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      playTimerSound('end');
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
      
      <div className="text-sm text-joy-steel-blue/70 font-lato mt-2">
        🔊 Listen for the gentle completion chime
      </div>
    </div>
  );
}
