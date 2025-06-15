
import { useAudioManager } from '@/hooks/useAudioManager';

export function useSoundEffects() {
  const { playSound } = useAudioManager();

  return { playSound };
}
