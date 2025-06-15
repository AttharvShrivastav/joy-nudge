
import { Volume2, VolumeX, Music, Volume1 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudioSettings } from '@/hooks/useAudioSettings';
import { useAudioManager } from '@/hooks/useAudioManager';

export default function AudioSettings() {
  const { settings, loading, setMasterVolume, toggleMusic, toggleSoundEffects } = useAudioSettings();
  const { playSound, stopBackgroundMusic } = useAudioManager();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setMasterVolume(volume);
    // Only play sound if sound effects are enabled
    if (settings.soundEffectsEnabled) {
      playSound('button_click');
    }
  };

  const handleMusicToggle = () => {
    toggleMusic();
    // Stop any playing background music when disabled
    if (settings.musicEnabled) {
      stopBackgroundMusic();
    }
    // Only play toggle sound if sound effects are enabled
    if (settings.soundEffectsEnabled) {
      playSound('toggle');
    }
  };

  const handleSoundEffectsToggle = () => {
    // Play the toggle sound before changing the setting (while still enabled)
    if (settings.soundEffectsEnabled) {
      playSound('toggle');
    }
    toggleSoundEffects();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-nunito font-semibold text-joy-dark-blue mb-4">
            Audio Settings
          </h3>
        </div>
        <div className="text-center text-joy-steel-blue">Loading audio settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-nunito font-semibold text-joy-dark-blue mb-4">
          Audio Settings
        </h3>
      </div>

      {/* Master Volume */}
      <div className="joy-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {settings.masterVolume === 0 ? (
              <VolumeX className="w-5 h-5 text-joy-steel-blue" />
            ) : settings.masterVolume < 0.5 ? (
              <Volume1 className="w-5 h-5 text-joy-steel-blue" />
            ) : (
              <Volume2 className="w-5 h-5 text-joy-steel-blue" />
            )}
            <span className="font-nunito font-medium text-joy-dark-blue">
              Master Volume
            </span>
          </div>
          <span className="text-sm text-joy-steel-blue">
            {Math.round(settings.masterVolume * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.masterVolume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-joy-light-blue/50 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #FFA07A 0%, #FFA07A ${settings.masterVolume * 100}%, #a8dadc ${settings.masterVolume * 100}%, #a8dadc 100%)`
          }}
        />
      </div>

      {/* Background Music Toggle */}
      <div className="joy-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-joy-steel-blue" />
            <div>
              <span className="font-nunito font-medium text-joy-dark-blue block">
                Background Music
              </span>
              <span className="text-xs text-joy-steel-blue">
                Ambient sounds for different screens
              </span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleMusicToggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.musicEnabled ? 'bg-joy-coral' : 'bg-gray-300'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5"
              animate={{
                x: settings.musicEnabled ? 26 : 2
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        </div>
      </div>

      {/* Sound Effects Toggle */}
      <div className="joy-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-joy-steel-blue" />
            <div>
              <span className="font-nunito font-medium text-joy-dark-blue block">
                Sound Effects
              </span>
              <span className="text-xs text-joy-steel-blue">
                Button clicks and interaction sounds
              </span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSoundEffectsToggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.soundEffectsEnabled ? 'bg-joy-coral' : 'bg-gray-300'
            }`}
          >
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow transform transition-transform absolute top-0.5"
              animate={{
                x: settings.soundEffectsEnabled ? 26 : 2
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        </div>
      </div>

      <div className="text-xs text-joy-steel-blue/70 text-center mt-4">
        Audio settings are saved automatically and apply across the entire app
      </div>
    </div>
  );
}
