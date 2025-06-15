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

  // Initialize audio context on first user interaction
  const initializeAudio = useCallback(async () => {
    if (audioContextRef.current.initialized) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current.context = new AudioContext();
        audioContextRef.current.initialized = true;
      }
    } catch (error) {
      console.log('Audio context initialization failed:', error);
    }
  }, []);

  // Play sound effects
  const playSound = useCallback((type: string, customVolume?: number) => {
    if (!settings.soundEffectsEnabled) return;
    
    initializeAudio();
    
    const audioContext = audioContextRef.current.context;
    if (!audioContext) return;

    try {
      const volume = (customVolume ?? 1) * settings.masterVolume;
      
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
          // Soft, welcoming chime for login/signup
          createTone(523, 0.3, 'sine'); // C5
          setTimeout(() => createTone(659, 0.3, 'sine'), 150); // E5
          setTimeout(() => createTone(784, 0.4, 'sine'), 300); // G5
          break;
        
        case 'button_click':
          // Gentle button click
          createTone(800, 0.08, 'sine');
          break;
        
        case 'toggle':
          // Soft toggle sound
          createTone(660, 0.12, 'sine');
          break;
        
        case 'error':
          // Very soft, non-alarming error sound
          createTone(220, 0.2, 'sine');
          setTimeout(() => createTone(196, 0.2, 'sine'), 100);
          break;
        
        case 'success':
          // Delightful success chime
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
        
        // Keep existing sound effects for backward compatibility
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

  // Background music management
  const playBackgroundMusic = useCallback((track: 'home' | 'garden' | 'focus', loop: boolean = true) => {
    if (!settings.musicEnabled) return;

    // For now, we'll create ambient tones instead of loading external files
    // In production, you would load actual audio files here
    const playAmbientTones = () => {
      if (!settings.musicEnabled) return;
      
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
          // Gentle, uplifting ambient tones
          createAmbientTone(220, 8);
          setTimeout(() => createAmbientTone(277, 6), 2000);
          setTimeout(() => createAmbientTone(330, 7), 4000);
          break;
        
        case 'garden':
          // Nature-inspired ambient tones
          createAmbientTone(196, 10);
          setTimeout(() => createAmbientTone(247, 8), 3000);
          setTimeout(() => createAmbientTone(294, 6), 6000);
          break;
        
        case 'focus':
          // Concentration-enhancing tones
          createAmbientTone(110, 12);
          setTimeout(() => createAmbientTone(138, 10), 4000);
          break;
      }

      if (loop) {
        setTimeout(() => playAmbientTones(), 15000);
      }
    };

    initializeAudio().then(() => {
      setTimeout(playAmbientTones, 1000);
    });
  }, [settings.musicEnabled, settings.masterVolume, initializeAudio]);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current = null;
    }
  }, []);

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

  return {
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    initializeAudio,
  };
}
