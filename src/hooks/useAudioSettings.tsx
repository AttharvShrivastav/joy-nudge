
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AudioSettings {
  masterVolume: number;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  musicEnabled: false, // Disabled by default since we're removing background music
  soundEffectsEnabled: true,
};

// --- Shared State Logic ---
const settingsEvents = new EventTarget();

let currentSettings: AudioSettings = DEFAULT_SETTINGS;

// Load initial guest settings from localStorage
try {
  const savedSettings = localStorage.getItem('joyNudgeAudioSettings');
  if (savedSettings) {
    currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
  }
} catch (e) {
  console.error("Failed to parse audio settings from localStorage", e);
}

const setSharedSettings = (newSettings: Partial<AudioSettings>) => {
  currentSettings = { ...currentSettings, ...newSettings };
  settingsEvents.dispatchEvent(new CustomEvent('settingsChange', { detail: currentSettings }));
};
// --- End Shared State Logic ---

export function useAudioSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AudioSettings>(currentSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<AudioSettings>;
      setSettings(customEvent.detail);
    };
    settingsEvents.addEventListener('settingsChange', handleSettingsChange);
    return () => {
      settingsEvents.removeEventListener('settingsChange', handleSettingsChange);
    };
  }, []);

  const loadUserSettings = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_audio_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      if (data) {
        setSharedSettings({
          masterVolume: parseFloat(data.master_volume.toString()),
          musicEnabled: data.music_enabled,
          soundEffectsEnabled: data.sound_effects_enabled,
        });
      } else {
        await createDefaultSettings(user.id);
        setSharedSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
      setSharedSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    } else {
      // For guests, settings are already loaded. Ensure state is consistent.
      setSharedSettings(currentSettings);
      setLoading(false);
    }
  }, [user, loadUserSettings]);

  const createDefaultSettings = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_audio_settings')
        .insert({
          user_id: userId,
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
    const updated = { ...currentSettings, ...newSettings };
    setSharedSettings(updated); // Optimistic update for immediate UI feedback

    if (user) {
      try {
        // Use upsert with onConflict to handle existing records properly
        const { error } = await supabase
          .from('user_audio_settings')
          .upsert({
            user_id: user.id,
            master_volume: updated.masterVolume,
            music_enabled: updated.musicEnabled,
            sound_effects_enabled: updated.soundEffectsEnabled,
          }, {
            onConflict: 'user_id'
          });

        if (error) {
          console.error('Error saving audio settings:', error);
          // Revert optimistic update on error
          setSharedSettings(currentSettings);
        } else {
          console.log('Audio settings saved successfully');
        }
      } catch (error) {
        console.error('Error saving audio settings:', error);
        // Revert optimistic update on error
        setSharedSettings(currentSettings);
      }
    } else {
      localStorage.setItem('joyNudgeAudioSettings', JSON.stringify(updated));
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    setMasterVolume: (volume: number) => updateSettings({ masterVolume: volume }),
    toggleMusic: () => updateSettings({ musicEnabled: !currentSettings.musicEnabled }),
    toggleSoundEffects: () => updateSettings({ soundEffectsEnabled: !currentSettings.soundEffectsEnabled }),
  };
}
