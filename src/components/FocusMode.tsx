import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Volume2, VolumeX, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useAudioManager } from '@/hooks/useAudioManager';

interface FocusModeProps {
  onClose: () => void;
}

export default function FocusMode({ onClose }: FocusModeProps) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const { playSound: playAudioSound, playBackgroundMusic, stopBackgroundMusic, initializeAudio } = useAudioManager();

  const handleSessionComplete = async () => {
    setIsActive(false);
    playAudioSound('focus_end');
    stopBackgroundMusic();
    
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
    playAudioSound('focus_start');
    
    // Start focus background ambient sounds
    initializeAudio().then(() => {
      setTimeout(() => {
        playBackgroundMusic();
      }, 500);
    });
    
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    playAudioSound('button_click');
    
    if (isPaused) {
      // Resume background music
      playBackgroundMusic();
    } else {
      // Pause background music
      stopBackgroundMusic();
    }
  };

  const handleStop = () => {
    if (sessionStartTime && isActive) {
      logSession(false);
    }
    stopBackgroundMusic();
    resetSession();
  };

  const resetSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(isBreak ? breakDuration * 60 : workDuration * 60);
    setIsBreak(false);
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
    
    // Use the new audio manager instead of creating audio context here
    switch (type) {
      case 'start':
        playAudioSound('focus_start');
        break;
      case 'pause':
        playAudioSound('button_click');
        break;
      case 'complete':
        playAudioSound('focus_end');
        break;
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

  return (
    <div className="fixed inset-0 bg-[#a8dadc] z-50">
      <div className="h-full w-full max-w-sm mx-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 pt-8">
          <h1 className="text-lg font-nunito font-bold text-joy-dark-blue">
            {isBreak ? 'Break Time' : 'Focus Time'}
          </h1>
          <button
            onClick={onClose}
            className="p-2 bg-white/80 rounded-full shadow-md"
          >
            <X className="w-5 h-5 text-joy-steel-blue" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 pb-8 flex flex-col justify-center">
          {!isActive ? (
            /* Settings */
            <div className="space-y-6 mb-8">
              <div className="bg-white/90 rounded-xl p-4 shadow-md">
                <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
                  Work Duration: {workDuration} min
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
                  className="w-full h-2 bg-joy-light-blue/50 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div className="bg-white/90 rounded-xl p-4 shadow-md">
                <label className="block text-joy-dark-blue font-nunito font-semibold mb-2">
                  Break Duration: {breakDuration} min
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-joy-light-blue/50 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div className="bg-white/90 rounded-xl p-4 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-joy-steel-blue" /> : <VolumeX className="w-5 h-5 text-joy-steel-blue" />}
                  <span className="font-nunito font-medium text-joy-dark-blue">Sound</span>
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
          ) : (
            /* Timer Display */
            <div className="text-center mb-8">
              <div className="bg-white/90 rounded-2xl p-8 shadow-lg mb-6">
                <div className="text-5xl font-nunito font-bold text-joy-dark-blue mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-joy-steel-blue">
                  {Math.round(progress)}% complete
                </div>
                <div className="w-full bg-joy-light-blue/30 rounded-full h-2 mt-4">
                  <div 
                    className="bg-joy-coral h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-4">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="w-full bg-joy-coral text-white py-4 rounded-xl font-nunito font-bold text-lg shadow-lg flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                Start Session
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handlePause}
                  className="flex-1 bg-joy-coral text-white py-4 rounded-xl font-nunito font-semibold flex items-center justify-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                
                <button
                  onClick={handleStop}
                  className="bg-gray-500 text-white p-4 rounded-xl flex items-center justify-center"
                >
                  <Square className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {isActive && isPaused && (
            <div className="text-center mt-4">
              <div className="text-sm text-joy-steel-blue">Session paused</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
