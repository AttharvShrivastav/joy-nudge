
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Settings, Volume2, VolumeX, X } from 'lucide-react';
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
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
    setSessionStartTime(new Date());
    playSound('start');
    
    // Request notification permission and disable app notifications
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    playSound('pause');
  };

  const handleStop = () => {
    if (sessionStartTime && isActive) {
      logSession(false); // Log as incomplete
    }
    resetSession();
  };

  const resetSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    setIsBreak(false);
    setSessionStartTime(null);
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    playSound('complete');
    
    // Log the completed session
    if (sessionStartTime) {
      await logSession(true);
    }

    // Show completion notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = isBreak ? 'Break time is over! Ready to focus?' : 'Focus session complete! Time for a break.';
      new Notification('Joy Nudge Focus', {
        body: message,
        icon: '/favicon.ico'
      });
    }

    // Switch between work and break
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
    }
    
    setSessionStartTime(null);
  };

  const logSession = async (isCompleted: boolean) => {
    if (!user || !sessionStartTime) return;
    
    try {
      const endTime = new Date();
      const actualDuration = Math.floor((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60);
      
      await supabase.from('focus_sessions').insert({
        user_id: user.id,
        duration_minutes: isCompleted ? (isBreak ? breakDuration : workDuration) : actualDuration,
        break_duration_minutes: isBreak ? 0 : breakDuration,
        session_type: isBreak ? 'break' : 'work',
        completed_at: isCompleted ? endTime.toISOString() : null
      });
    } catch (error) {
      console.error('Error logging focus session:', error);
    }
  };

  const playSound = (type: 'start' | 'pause' | 'complete') => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'start':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.1);
          break;
        case 'pause':
          oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
          break;
        case 'complete':
          // Three ascending tones for completion
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15); // E
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3); // G
          break;
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Audio playback failed:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((workDuration * 60 - timeLeft) / (workDuration * 60)) * 100;

  const circleCircumference = 2 * Math.PI * 120; // radius of 120

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#a8dadc] via-joy-white to-[#a8dadc] z-50 overflow-hidden">
      {/* Ambient background animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 bg-white/10 rounded-full blur-xl"
          animate={{
            x: [20, 80, 20],
            y: [30, 100, 30],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-24 h-24 bg-joy-coral/10 rounded-full blur-xl"
          animate={{
            x: [-20, 40, -20],
            y: [50, -20, 50],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '60%', right: '15%' }}
        />
        <motion.div
          className="absolute w-20 h-20 bg-joy-steel-blue/10 rounded-full blur-xl"
          animate={{
            x: [0, -30, 0],
            y: [-10, 40, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '40%', left: '70%' }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 pt-8">
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/30 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-joy-steel-blue" />
          </motion.button>
          
          <motion.button
            onClick={onClose}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/30 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5 text-joy-steel-blue" />
          </motion.button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="absolute top-20 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 z-20"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-nunito font-semibold text-joy-dark-blue mb-2">
                    Work Duration (minutes)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={workDuration}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setWorkDuration(value);
                      if (!isActive && !isBreak) {
                        setTimeLeft(value * 60);
                      }
                    }}
                    className="w-full h-2 bg-joy-light-blue rounded-lg appearance-none cursor-pointer"
                    disabled={isActive}
                  />
                  <div className="text-center mt-1 font-nunito text-joy-steel-blue">{workDuration} min</div>
                </div>
                
                <div>
                  <label className="block text-sm font-nunito font-semibold text-joy-dark-blue mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={breakDuration}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setBreakDuration(value);
                      if (!isActive && isBreak) {
                        setTimeLeft(value * 60);
                      }
                    }}
                    className="w-full h-2 bg-joy-light-blue rounded-lg appearance-none cursor-pointer"
                    disabled={isActive}
                  />
                  <div className="text-center mt-1 font-nunito text-joy-steel-blue">{breakDuration} min</div>
                </div>

                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center justify-center gap-3 w-full p-3 bg-joy-light-blue/30 rounded-xl hover:bg-joy-light-blue/40 transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-joy-steel-blue" /> : <VolumeX className="w-5 h-5 text-joy-steel-blue" />}
                  <span className="font-nunito font-medium text-joy-dark-blue">
                    {soundEnabled ? 'Sound On' : 'Sound Off'}
                  </span>
                </button>

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full p-3 bg-joy-steel-blue text-white rounded-xl font-nunito font-semibold hover:bg-joy-dark-blue transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          {/* Session Type */}
          <motion.div
            className="text-center mb-8"
            key={isBreak ? 'break' : 'work'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
              {isBreak ? 'Break Time' : 'Focus Time'}
            </h1>
            <p className="text-joy-steel-blue font-lato text-lg">
              {isBreak 
                ? 'Rest and recharge your mind' 
                : 'Deep work mode - stay present'
              }
            </p>
          </motion.div>

          {/* Timer Circle */}
          <div className="relative mb-12">
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <svg className="w-72 h-72 transform -rotate-90" viewBox="0 0 260 260">
                {/* Background Circle */}
                <circle
                  cx="130"
                  cy="130"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-white/30"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="130"
                  cy="130"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className={isBreak ? "text-joy-coral" : "text-joy-steel-blue"}
                  strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleCircumference * (1 - progress / 100)}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              
              {/* Timer Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="text-5xl font-nunito font-bold text-joy-dark-blue mb-2"
                    key={timeLeft}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <div className="text-lg font-lato text-joy-steel-blue">
                    {Math.round(progress)}% complete
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 w-full max-w-sm">
            {!isActive ? (
              <motion.button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-3 bg-joy-steel-blue text-white py-4 rounded-2xl font-nunito font-semibold text-lg hover:bg-joy-dark-blue transition-colors shadow-lg"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
              >
                <Play className="w-6 h-6" />
                Start
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={handlePause}
                  className="flex-1 flex items-center justify-center gap-2 bg-joy-coral text-white py-4 rounded-2xl font-nunito font-semibold hover:opacity-90 transition-opacity shadow-lg"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Pause className="w-5 h-5" />
                  {isPaused ? 'Resume' : 'Pause'}
                </motion.button>
                
                <motion.button
                  onClick={handleStop}
                  className="flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-4 rounded-2xl font-nunito font-semibold hover:bg-gray-600 transition-colors shadow-lg"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Square className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>

          {/* Status indicator */}
          {isActive && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`text-sm font-lato ${isPaused ? 'text-joy-coral' : 'text-joy-steel-blue'}`}>
                {isPaused ? 'Session paused' : 'Session active'}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
