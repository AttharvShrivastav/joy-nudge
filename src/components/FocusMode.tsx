
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Volume2, VolumeX, X, Settings, Clock, Target } from 'lucide-react';
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showConfig, setShowConfig] = useState(true);
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
    setShowConfig(false);
    playSound('start');
    
    // Request notification permission
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
      logSession(false);
    }
    resetSession();
  };

  const resetSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    setIsBreak(false);
    setSessionStartTime(null);
    setShowConfig(true);
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    playSound('complete');
    
    if (sessionStartTime) {
      await logSession(true);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      const message = isBreak ? 'Break time is over! Ready to focus?' : 'Focus session complete! Time for a break.';
      new Notification('Joy Nudge Focus', {
        body: message,
        icon: '/favicon.ico'
      });
    }

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
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3);
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

  const circleCircumference = 2 * Math.PI * 85;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#a8dadc] via-joy-white to-[#a8dadc] z-50">
      {/* Mobile-first container */}
      <div className="h-full w-full max-w-sm mx-auto flex flex-col relative">
        {/* Header - Mobile optimized */}
        <div className="flex justify-between items-center p-4 pt-8 px-6">
          <h1 className="text-lg font-nunito font-bold text-joy-dark-blue">
            {showConfig ? 'Focus Setup' : isBreak ? 'Break Time' : 'Focus Time'}
          </h1>
          <button
            onClick={onClose}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white/90 transition-colors"
          >
            <X className="w-5 h-5 text-joy-steel-blue" />
          </button>
        </div>

        {/* Main Content - Mobile-first layout */}
        <div className="flex-1 px-6 pb-8 flex flex-col">
          <AnimatePresence mode="wait">
            {showConfig && !isActive ? (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col"
              >
                {/* Configuration card - Mobile optimized */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 mb-6">
                  <div className="space-y-6">
                    {/* Work Duration */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Target className="w-5 h-5 text-joy-coral" />
                        <label className="font-nunito font-semibold text-joy-dark-blue">
                          Focus Time: {workDuration} minutes
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="5"
                          max="60"
                          value={workDuration}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setWorkDuration(value);
                            setTimeLeft(value * 60);
                          }}
                          className="w-full h-3 bg-joy-light-blue/50 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-joy-coral"
                          style={{
                            background: `linear-gradient(to right, #f28b82 0%, #f28b82 ${(workDuration - 5) / 55 * 100}%, #a8dadc ${(workDuration - 5) / 55 * 100}%, #a8dadc 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-joy-steel-blue mt-1">
                          <span>5 min</span>
                          <span>60 min</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Break Duration */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-5 h-5 text-joy-steel-blue" />
                        <label className="font-nunito font-semibold text-joy-dark-blue">
                          Break Time: {breakDuration} minutes
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={breakDuration}
                          onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                          className="w-full h-3 bg-joy-light-blue/50 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-joy-steel-blue"
                          style={{
                            background: `linear-gradient(to right, #457b9d 0%, #457b9d ${(breakDuration - 1) / 14 * 100}%, #a8dadc ${(breakDuration - 1) / 14 * 100}%, #a8dadc 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-joy-steel-blue mt-1">
                          <span>1 min</span>
                          <span>15 min</span>
                        </div>
                      </div>
                    </div>

                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between p-4 bg-joy-light-blue/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        {soundEnabled ? <Volume2 className="w-5 h-5 text-joy-steel-blue" /> : <VolumeX className="w-5 h-5 text-joy-steel-blue" />}
                        <span className="font-nunito font-medium text-joy-dark-blue">
                          Sound Notifications
                        </span>
                      </div>
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          soundEnabled ? 'bg-joy-coral' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                          soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Start Button - Mobile optimized */}
                <motion.button
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-joy-coral to-joy-steel-blue text-white py-4 rounded-2xl font-nunito font-bold text-lg shadow-lg flex items-center justify-center gap-3 mt-auto"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Play className="w-6 h-6" />
                  Start Focus Session
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="timer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                {/* Timer Circle - Mobile optimized */}
                <div className="relative mb-8">
                  <svg className="w-64 h-64" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-white/40"
                    />
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="85"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className={isBreak ? "text-joy-steel-blue" : "text-joy-coral"}
                      strokeLinecap="round"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={circleCircumference * (1 - progress / 100)}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
                      transition={{ duration: 0.3 }}
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-nunito font-bold text-joy-dark-blue mb-1">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-sm font-lato text-joy-steel-blue">
                        {Math.round(progress)}% complete
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls - Mobile optimized */}
                <div className="w-full space-y-4">
                  {!isActive ? (
                    <motion.button
                      onClick={handleStart}
                      className="w-full bg-gradient-to-r from-joy-coral to-joy-steel-blue text-white py-4 rounded-2xl font-nunito font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play className="w-6 h-6" />
                      Start
                    </motion.button>
                  ) : (
                    <div className="flex gap-3">
                      <motion.button
                        onClick={handlePause}
                        className="flex-1 bg-joy-coral text-white py-4 rounded-2xl font-nunito font-semibold text-lg shadow-lg flex items-center justify-center gap-2"
                        whileTap={{ scale: 0.98 }}
                      >
                        <Pause className="w-5 h-5" />
                        {isPaused ? 'Resume' : 'Pause'}
                      </motion.button>
                      
                      <motion.button
                        onClick={handleStop}
                        className="bg-gray-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-center"
                        whileTap={{ scale: 0.98 }}
                      >
                        <Square className="w-5 h-5" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                {isActive && (
                  <motion.div
                    className="mt-4 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className={`text-sm font-lato ${isPaused ? 'text-joy-coral' : 'text-joy-steel-blue'}`}>
                      {isPaused ? 'Session paused' : 'Stay focused, you\'re doing great!'}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
