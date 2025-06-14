
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Volume2, VolumeX, X, Check } from 'lucide-react';
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

  const circleCircumference = 2 * Math.PI * 90;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#a8dadc] via-joy-white to-[#a8dadc] z-50 overflow-hidden">
      {/* Ambient background animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-24 h-24 bg-white/10 rounded-full blur-xl"
          animate={{
            x: [10, 60, 10],
            y: [20, 80, 20],
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
          className="absolute w-20 h-20 bg-joy-coral/10 rounded-full blur-xl"
          animate={{
            x: [-10, 30, -10],
            y: [40, -10, 40],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '60%', right: '15%' }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-end items-center p-4 pt-8">
          <motion.button
            onClick={onClose}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/30 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5 text-joy-steel-blue" />
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <AnimatePresence mode="wait">
            {showConfig && !isActive ? (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-sm space-y-6"
              >
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
                    Focus Session
                  </h1>
                  <p className="text-joy-steel-blue font-lato text-lg">
                    Configure your session
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-joy-dark-blue mb-3">
                        Work Duration: {workDuration} minutes
                      </label>
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
                        className="w-full h-3 bg-joy-light-blue rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-nunito font-semibold text-joy-dark-blue mb-3">
                        Break Duration: {breakDuration} minutes
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                        className="w-full h-3 bg-joy-light-blue rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="flex items-center justify-center gap-3 w-full p-4 bg-joy-light-blue/30 rounded-xl hover:bg-joy-light-blue/40 transition-colors"
                    >
                      {soundEnabled ? <Volume2 className="w-5 h-5 text-joy-steel-blue" /> : <VolumeX className="w-5 h-5 text-joy-steel-blue" />}
                      <span className="font-nunito font-medium text-joy-dark-blue">
                        {soundEnabled ? 'Sound On' : 'Sound Off'}
                      </span>
                    </button>

                    <motion.button
                      onClick={handleStart}
                      className="w-full flex items-center justify-center gap-3 bg-joy-steel-blue text-white py-4 rounded-2xl font-nunito font-semibold text-lg hover:bg-joy-dark-blue transition-colors shadow-lg"
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Play className="w-6 h-6" />
                      Start Focus Session
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="timer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
                    {isBreak ? 'Break Time' : 'Focus Time'}
                  </h1>
                  <p className="text-joy-steel-blue font-lato text-lg">
                    {isBreak 
                      ? 'Rest and recharge your mind' 
                      : 'Deep work mode - stay present'
                    }
                  </p>
                </div>

                {/* Timer Circle */}
                <div className="relative mb-12">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-white/30"
                    />
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="90"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className={isBreak ? "text-joy-coral" : "text-joy-steel-blue"}
                      strokeLinecap="round"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={circleCircumference * (1 - progress / 100)}
                      transition={{ duration: 0.3 }}
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-nunito font-bold text-joy-dark-blue mb-2">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-sm font-lato text-joy-steel-blue">
                        {Math.round(progress)}% complete
                      </div>
                    </div>
                  </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
