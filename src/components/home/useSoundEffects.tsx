
import { useCallback } from 'react';

export function useSoundEffects() {
  const playSound = useCallback((type: string) => {
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
        case 'button_press':
          createTone(800, 0.1, 0.2);
          break;
        case 'celebration':
          createTone(523, 0.3, 0.3);
          setTimeout(() => createTone(659, 0.3, 0.3), 100);
          setTimeout(() => createTone(784, 0.4, 0.3), 200);
          break;
        case 'engage':
          createTone(440, 0.2, 0.25);
          setTimeout(() => createTone(554, 0.2, 0.25), 100);
          break;
        case 'like':
          createTone(880, 0.15, 0.2);
          setTimeout(() => createTone(1108, 0.15, 0.2), 50);
          break;
        case 'mood_select':
          createTone(660, 0.2, 0.25);
          break;
        case 'completion':
          createTone(523, 0.2, 0.3);
          setTimeout(() => createTone(659, 0.2, 0.3), 100);
          setTimeout(() => createTone(784, 0.2, 0.3), 200);
          setTimeout(() => createTone(1047, 0.3, 0.3), 300);
          break;
      }
    } catch (error) {
      console.log('Audio not available:', error);
    }
  }, []);

  return { playSound };
}
