
import { useCallback, useRef, useEffect } from 'react';
import { useAudioSettings } from './useAudioSettings';

interface AudioContextType {
  context?: AudioContext;
  initialized: boolean;
}

export function useAudioManager() {
  const { settings } = useAudioSettings();
  const audioContextRef = useRef<AudioContextType>({ initialized: false });
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context on first user interaction
  const initializeAudio = useCallback(async () => {
    if (audioContextRef.current.initialized) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current.context = new AudioContext();
        audioContextRef.current.initialized = true;
        console.log('Audio context initialized');
      }
    } catch (error) {
      console.log('Audio context initialization failed:', error);
    }
  }, []);

  // Play sound effects with proper settings check
  const playSound = useCallback((type: string, customVolume?: number) => {
    // Always check if sound effects are enabled before playing any sound
    if (!settings.soundEffectsEnabled) {
      console.log('Sound effects disabled, skipping sound:', type);
      return;
    }
    
    initializeAudio();
    
    const audioContext = audioContextRef.current.context;
    if (!audioContext) {
      console.log('Audio context not available');
      return;
    }

    try {
      const volume = (customVolume ?? 1) * settings.masterVolume;
      console.log(`Playing sound: ${type}, volume: ${volume}, effects enabled: ${settings.soundEffectsEnabled}`);
      
      const createTone = (frequency: number, duration: number, waveType: OscillatorType = 'sine') => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = waveType;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      switch (type) {
        case 'welcome':
          createTone(523, 0.3, 'sine'); // C5
          setTimeout(() => createTone(659, 0.3, 'sine'), 150); // E5
          setTimeout(() => createTone(784, 0.4, 'sine'), 300); // G5
          break;
        
        case 'button_click':
        case 'button_press':
          createTone(800, 0.08, 'sine');
          break;
        
        case 'toggle':
          createTone(660, 0.12, 'sine');
          break;
        
        case 'error':
          createTone(220, 0.2, 'sine');
          setTimeout(() => createTone(196, 0.2, 'sine'), 100);
          break;
        
        case 'success':
          createTone(523, 0.2, 'sine');
          setTimeout(() => createTone(659, 0.2, 'sine'), 100);
          setTimeout(() => createTone(784, 0.3, 'sine'), 200);
          break;
        
        case 'focus_start':
          createTone(440, 0.3, 'sine');
          setTimeout(() => createTone(554, 0.3, 'sine'), 150);
          break;
        
        case 'focus_end':
          createTone(784, 0.3, 'sine');
          setTimeout(() => createTone(659, 0.3, 'sine'), 150);
          setTimeout(() => createTone(523, 0.4, 'sine'), 300);
          break;
        
        case 'celebration':
        case 'completion':
          createTone(523, 0.3, 'sine');
          setTimeout(() => createTone(659, 0.3, 'sine'), 100);
          setTimeout(() => createTone(784, 0.4, 'sine'), 200);
          break;
        
        case 'engage':
          createTone(440, 0.2, 'sine');
          setTimeout(() => createTone(554, 0.2, 'sine'), 100);
          break;
        
        case 'like':
          createTone(880, 0.15, 'sine');
          setTimeout(() => createTone(1108, 0.15, 'sine'), 50);
          break;
        
        case 'mood_select':
          createTone(660, 0.2, 'sine');
          break;
      }
    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  }, [settings.soundEffectsEnabled, settings.masterVolume, initializeAudio]);

  // Background music management with proper settings check
  const playBackgroundMusic = useCallback((track: 'home' | 'garden' | 'focus', loop: boolean = true) => {
    // Always check if background music is enabled before starting
    if (!settings.musicEnabled) {
      console.log('Background music disabled, not playing:', track);
      return;
    }

    console.log(`Starting background music: ${track}, music enabled: ${settings.musicEnabled}`);

    // Stop any existing background music first
    stopBackgroundMusic();

    const playAmbientTones = () => {
      // Double-check music is still enabled during playback
      if (!settings.musicEnabled) {
        console.log('Background music disabled during playback, stopping');
        return;
      }
      
      const audioContext = audioContextRef.current.context;
      if (!audioContext) return;

      const volume = settings.masterVolume * 0.1; // Very low volume for ambient

      const createAmbientTone = (frequency: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 2);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + duration - 2);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };

      switch (track) {
        case 'home':
          createAmbientTone(220, 8);
          setTimeout(() => createAmbientTone(277, 6), 2000);
          setTimeout(() => createAmbientTone(330, 7), 4000);
          break;
        
        case 'garden':
          createAmbientTone(196, 10);
          setTimeout(() => createAmbientTone(247, 8), 3000);
          setTimeout(() => createAmbientTone(294, 6), 6000);
          break;
        
        case 'focus':
          createAmbientTone(110, 12);
          setTimeout(() => createAmbientTone(138, 10), 4000);
          break;
      }

      // Only schedule next iteration if music is still enabled and loop is true
      if (loop && settings.musicEnabled) {
        ambientIntervalRef.current = setTimeout(() => playAmbientTones(), 15000);
      }
    };

    initializeAudio().then(() => {
      // Add a small delay and check again before starting
      setTimeout(() => {
        if (settings.musicEnabled) {
          playAmbientTones();
        }
      }, 1000);
    });
  }, [settings.musicEnabled, settings.masterVolume, initializeAudio]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current = null;
    }
    
    // Clear any ambient tone intervals
    if (ambientIntervalRef.current) {
      clearTimeout(ambientIntervalRef.current);
      ambientIntervalRef.current = null;
    }
    
    console.log('Background music stopped');
  }, []);

  // Stop background music immediately when music is disabled
  useEffect(() => {
    if (!settings.musicEnabled) {
      console.log('Music disabled via settings, stopping all background music');
      stopBackgroundMusic();
    }
  }, [settings.musicEnabled, stopBackgroundMusic]);

  // Handle app visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopBackgroundMusic();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stopBackgroundMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  return {
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    initializeAudio,
  };
}
