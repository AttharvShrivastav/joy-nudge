
import { useState } from "react";
import TabNavigation from "@/components/TabNavigation";
import HomeScreen from "@/components/HomeScreen";
import DiscoverScreen from "@/components/DiscoverScreen";
import GardenScreen from "@/components/GardenScreen";
import SettingsScreen from "@/components/SettingsScreen";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');

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
