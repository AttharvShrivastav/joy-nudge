
import { useCallback, useRef, useEffect } from 'react';
import { useAudioSettings } from './useAudioSettings';

interface AudioContextType {
  context?: AudioContext;
  initialized: boolean;
}

export function useAudioManager() {
  const { settings } = useAudioSettings();
  const audioContextRef = useRef<AudioContextType>({ initialized: false });

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

  // Removed background music functionality entirely
  const playBackgroundMusic = useCallback(() => {
    console.log('Background music disabled - focusing on sound effects only');
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    console.log('Background music disabled - no music to stop');
  }, []);

  return {
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    initializeAudio,
  };
}
