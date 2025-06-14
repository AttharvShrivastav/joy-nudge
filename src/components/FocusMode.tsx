
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Settings, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface FocusModeProps {
  onClose: () => void;
}

export default function FocusMode({ onClose }: FocusModeProps) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    playSound('start');
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    setIsBreak(false);
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    playSound('complete');
    
    // Log the completed session
    if (user) {
      try {
        await supabase.from('focus_sessions').insert({
          user_id: user.id,
          duration_minutes: isBreak ? breakDuration : workDuration,
          break_duration_minutes: isBreak ? 0 : breakDuration,
          session_type: isBreak ? 'break' : 'work'
        });
      } catch (error) {
        console.error('Error logging focus session:', error);
      }
    }

    // Switch between work and break
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
    }
  };

  const playSound = (type: 'start' | 'complete') => {
    if (!soundEnabled) return;
    
    // Create a simple audio context for basic sounds
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'start') {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.1);
    } else {
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.2);
    }
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-joy-light-blue via-joy-white to-joy-light-blue z-50">
      {/* Ambient background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-40 h-40 bg-joy-steel-blue/10 rounded-full blur-xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-60 h-60 bg-joy-coral/10 rounded-full blur-xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-joy-steel-blue" />
          </motion.button>
          
          <motion.button
            onClick={onClose}
            className="px-4 py-2 bg-white/80 rounded-full font-nunito font-medium text-joy-steel-blue hover:bg-white transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            Exit Focus
          </motion.button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="absolute top-20 left-6 bg-white rounded-xl p-4 shadow-xl border border-joy-light-blue/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="space-y-4 min-w-[200px]">
                <div>
                  <label className="block text-sm font-nunito font-medium text-joy-dark-blue mb-1">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={workDuration}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setWorkDuration(value);
                      if (!isActive && !isBreak) {
                        setTimeLeft(value * 60);
                      }
                    }}
                    className="w-full px-3 py-2 border border-joy-light-blue rounded-lg focus:border-joy-steel-blue focus:outline-none"
                    min="1"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-nunito font-medium text-joy-dark-blue mb-1">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={breakDuration}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setBreakDuration(value);
                      if (!isActive && isBreak) {
                        setTimeLeft(value * 60);
                      }
                    }}
                    className="w-full px-3 py-2 border border-joy-light-blue rounded-lg focus:border-joy-steel-blue focus:outline-none"
                    min="1"
                    max="60"
                  />
                </div>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center gap-2 text-joy-steel-blue hover:text-joy-dark-blue transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="font-lato text-sm">
                    {soundEnabled ? 'Sound On' : 'Sound Off'}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Focus Interface */}
        <div className="text-center max-w-md w-full">
          {/* Session Type */}
          <motion.div
            className="mb-8"
            key={isBreak ? 'break' : 'work'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </h1>
            <p className="text-joy-steel-blue font-lato">
              {isBreak 
                ? 'Take a moment to rest and recharge' 
                : 'Deep work mode - stay focused and present'
              }
            </p>
          </motion.div>

          {/* Timer Circle */}
          <div className="relative mb-8">
            <motion.div
              className="w-64 h-64 mx-auto relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-joy-light-blue/30"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className={isBreak ? "text-joy-coral" : "text-joy-steel-blue"}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              
              {/* Timer Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="text-4xl font-nunito font-bold text-joy-dark-blue"
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <div className="text-sm font-lato text-joy-steel-blue mt-1">
                    {Math.round(progress)}% complete
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isActive ? (
              <motion.button
                onClick={handleStart}
                className="flex items-center gap-2 bg-joy-steel-blue text-white px-6 py-3 rounded-full font-nunito font-semibold hover:bg-joy-dark-blue transition-colors shadow-lg"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <Play className="w-5 h-5" />
                Start Session
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={handlePause}
                  className="flex items-center gap-2 bg-joy-coral text-white px-6 py-3 rounded-full font-nunito font-semibold hover:opacity-90 transition-opacity shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Pause className="w-5 h-5" />
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>
                
                <motion.button
                  onClick={handleStop}
                  className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-full font-nunito font-semibold hover:bg-gray-600 transition-colors shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Square className="w-5 h-5" />
                  Stop
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
