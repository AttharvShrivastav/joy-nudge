
import { useState, useEffect } from "react";
import { useStreakData } from "@/hooks/useStreakData";
import { useAudioManager } from "@/hooks/useAudioManager";
import { useAudioSettings } from "@/hooks/useAudioSettings";
import GardenTabs from "./garden/GardenTabs";
import GardenView from "./garden/GardenView";
import StatsView from "./garden/StatsView";
import AchievementsView from "./garden/AchievementsView";
import ReflectionsView from "./garden/ReflectionsView";

export default function GardenScreen() {
  const [activeTab, setActiveTab] = useState<'garden' | 'stats' | 'achievements' | 'reflections'>('garden');
  const [reflections, setReflections] = useState<any[]>([]);
  const { streakData, loading } = useStreakData();
  const { playBackgroundMusic, stopBackgroundMusic, initializeAudio } = useAudioManager();
  const { settings } = useAudioSettings();

  useEffect(() => {
    const savedReflections = JSON.parse(localStorage.getItem('joyReflections') || '[]');
    setReflections(savedReflections);
  }, []);

  // Start garden ambient sounds when component mounts, but only if music is enabled
  useEffect(() => {
    const startGardenAudio = async () => {
      console.log('GardenScreen mounted, music enabled:', settings.musicEnabled);
      
      if (!settings.musicEnabled) {
        console.log('Music disabled, not starting garden audio');
        return;
      }

      await initializeAudio();
      setTimeout(() => {
        // Double-check settings before starting music
        if (settings.musicEnabled) {
          console.log('Starting garden background music');
          playBackgroundMusic('garden', true);
        } else {
          console.log('Music was disabled before starting, skipping');
        }
      }, 500);
    };

    startGardenAudio();

    return () => {
      console.log('GardenScreen unmounting, stopping background music');
      stopBackgroundMusic();
    };
  }, [initializeAudio, playBackgroundMusic, stopBackgroundMusic, settings.musicEnabled]);

  // Stop music immediately if settings change while on this screen
  useEffect(() => {
    if (!settings.musicEnabled) {
      console.log('Music disabled while on garden screen, stopping background music');
      stopBackgroundMusic();
    }
  }, [settings.musicEnabled, stopBackgroundMusic]);

  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-8 text-center">
          Joy Garden
        </h1>

        <GardenTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'garden' && <GardenView />}
        {activeTab === 'stats' && (
          <StatsView streakData={streakData} loading={loading} />
        )}
        {activeTab === 'achievements' && <AchievementsView />}
        {activeTab === 'reflections' && <ReflectionsView reflections={reflections} />}
      </div>
    </div>
  );
}
