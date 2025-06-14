
import { useState } from "react";
import Onboarding from "@/components/Onboarding";
import TabNavigation from "@/components/TabNavigation";
import HomeScreen from "@/components/HomeScreen";
import DiscoverScreen from "@/components/DiscoverScreen";
import GardenScreen from "@/components/GardenScreen";
import SettingsScreen from "@/components/SettingsScreen";

const Index = () => {
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  if (!onboarded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-joy-white transition-all duration-300">
        <Onboarding onDone={() => setOnboarded(true)} />
      </div>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'discover':
        return <DiscoverScreen />;
      case 'garden':
        return <GardenScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-joy-white">
      {renderActiveScreen()}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
