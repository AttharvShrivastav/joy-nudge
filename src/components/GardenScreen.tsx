
import { useState, useEffect } from "react";
import { useStreakData } from "@/hooks/useStreakData";
import { useAudioManager } from "@/hooks/useAudioManager";
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

  useEffect(() => {
    const savedReflections = JSON.parse(localStorage.getItem('joyReflections') || '[]');
    setReflections(savedReflections);
  }, []);

  // Start garden ambient sounds when component mounts
  useEffect(() => {
    const startGardenAudio = async () => {
      await initializeAudio();
      setTimeout(() => {
        playBackgroundMusic('garden', true);
      }, 500);
    };

    startGardenAudio();

    return () => {
      stopBackgroundMusic();
    };
  }, [initializeAudio, playBackgroundMusic, stopBackgroundMusic]);

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
