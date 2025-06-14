
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerNudgeProps {
  nudge: {
    nudge: string;
    duration?: number;
  };
  onComplete: () => void;
}

export default function TimerNudge({ nudge, onComplete }: TimerNudgeProps) {
  const totalDuration = (nudge.duration || 60) * 1000;
  const [timeLeft, setTimeLeft] = useState(totalDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sound effects
  const playTimerSound = (type: 'start' | 'end' | 'tick') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createTone = (frequency: number, duration: number, volume: number = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      switch (type) {
        case 'start':
          createTone(523, 0.2, 0.25); // C5
          break;
        case 'end':
          // Peaceful completion chime
          createTone(523, 0.3, 0.3);
          setTimeout(() => createTone(659, 0.3, 0.3), 100);
          setTimeout(() => createTone(784, 0.4, 0.3), 200);
          break;
        case 'tick':
          createTone(800, 0.05, 0.1);
          break;
      }
    } catch (error) {
      console.log('Audio not available:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            setIsRunning(false);
            setIsCompleted(true);
            playTimerSound('end');
            setTimeout(() => onComplete(), 1000);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    playTimerSound('start');
    setIsRunning(true);
  };

  const handlePause = () => {
    playTimerSound('tick');
    setIsRunning(false);
  };

  const handleReset = () => {
    playTimerSound('tick');
    setIsRunning(false);
    setTimeLeft(totalDuration);
    setIsCompleted(false);
  };

  const progressPercentage = ((totalDuration - timeLeft) / totalDuration) * 100;

  if (isCompleted) {
    return (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-4"
        >
          ✨
        </motion.div>
        <h3 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-2">
          Time's up!
        </h3>
        <p className="text-joy-steel-blue font-lato">
          Great job completing your {nudge.duration} {nudge.duration === 1 ? 'minute' : 'minutes'} of mindful activity!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      {/* Timer Display */}
      <div className="relative">
        <motion.div
          className="w-40 h-40 mx-auto rounded-full border-8 border-joy-light-blue/30 flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
        >
          {/* Progress Circle */}
          <motion.div
            className="absolute inset-0 rounded-full border-8 border-joy-coral"
            style={{
              background: `conic-gradient(#FFA07A ${progressPercentage * 3.6}deg, transparent 0deg)`
            }}
            initial={{ rotate: -90 }}
            animate={{ rotate: -90 }}
          />
          
          {/* Time Display */}
          <div className="text-3xl font-nunito font-bold text-joy-dark-blue z-10">
            {formatTime(timeLeft)}
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-4">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStart}
            className="bg-joy-coral text-white p-4 rounded-full shadow-lg hover:bg-joy-coral/80 transition-colors"
          >
            <Play size={24} fill="currentColor" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePause}
            className="bg-joy-steel-blue text-white p-4 rounded-full shadow-lg hover:bg-joy-steel-blue/80 transition-colors"
          >
            <Pause size={24} fill="currentColor" />
          </motion.button>
        )}
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleReset}
          className="bg-joy-light-blue text-joy-dark-blue p-3 rounded-full shadow-lg hover:bg-joy-light-blue/80 transition-colors"
        >
          <RotateCcw size={20} />
        </motion.button>
      </div>

      <p className="text-sm text-joy-steel-blue/70 font-lato">
        Take your time and be present in the moment
      </p>
    </div>
  );
}
