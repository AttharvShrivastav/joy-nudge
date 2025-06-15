
import { useState, useEffect } from 'react';

interface AudioSettings {
  masterVolume: number;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  musicEnabled: true,
  soundEffectsEnabled: true,
};

export function useAudioSettings() {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const savedSettings = localStorage.getItem('joyNudgeAudioSettings');
    if (savedSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
    }
  }, []);

  const updateSettings = (newSettings: Partial<AudioSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('joyNudgeAudioSettings', JSON.stringify(updated));
  };

  return {
    settings,
    updateSettings,
    setMasterVolume: (volume: number) => updateSettings({ masterVolume: volume }),
    toggleMusic: () => updateSettings({ musicEnabled: !settings.musicEnabled }),
    toggleSoundEffects: () => updateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled }),
  };
}
