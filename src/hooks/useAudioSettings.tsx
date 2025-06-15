
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  const { user } = useAuth();
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    } else {
      // Load from localStorage for non-authenticated users
      const savedSettings = localStorage.getItem('joyNudgeAudioSettings');
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
      setLoading(false);
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_audio_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading audio settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } else if (data) {
        setSettings({
          masterVolume: parseFloat(data.master_volume.toString()),
          musicEnabled: data.music_enabled,
          soundEffectsEnabled: data.sound_effects_enabled,
        });
      } else {
        // No settings found, create default settings
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_audio_settings')
        .insert({
          user_id: user.id,
          master_volume: DEFAULT_SETTINGS.masterVolume,
          music_enabled: DEFAULT_SETTINGS.musicEnabled,
          sound_effects_enabled: DEFAULT_SETTINGS.soundEffectsEnabled,
        });

      if (error) {
        console.error('Error creating default audio settings:', error);
      }
    } catch (error) {
      console.error('Error creating default audio settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AudioSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (user) {
      // Save to Supabase
      try {
        const { error } = await supabase
          .from('user_audio_settings')
          .upsert({
            user_id: user.id,
            master_volume: updated.masterVolume,
            music_enabled: updated.musicEnabled,
            sound_effects_enabled: updated.soundEffectsEnabled,
          });

        if (error) {
          console.error('Error saving audio settings:', error);
        }
      } catch (error) {
        console.error('Error saving audio settings:', error);
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('joyNudgeAudioSettings', JSON.stringify(updated));
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    setMasterVolume: (volume: number) => updateSettings({ masterVolume: volume }),
    toggleMusic: () => updateSettings({ musicEnabled: !settings.musicEnabled }),
    toggleSoundEffects: () => updateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled }),
  };
}
