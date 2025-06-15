
import { useAudioManager } from '@/hooks/useAudioManager';
import { useAudioSettings } from '@/hooks/useAudioSettings';

export function useSoundEffects() {
  const { playSound } = useAudioManager();
  const { settings } = useAudioSettings();

  // Wrapper function that checks settings before playing sound
  const playSoundIfEnabled = (soundType: string, customVolume?: number) => {
    if (!settings.soundEffectsEnabled) {
      console.log('Sound effects disabled, not playing:', soundType);
      return;
    }
    playSound(soundType, customVolume);
  };

  return { 
    playSound: playSoundIfEnabled,
    soundEffectsEnabled: settings.soundEffectsEnabled
  };
}
