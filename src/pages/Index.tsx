
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TabNavigation from "@/components/TabNavigation";
import HomeScreen from "@/components/HomeScreen";
import DiscoverScreen from "@/components/DiscoverScreen";
import GardenScreen from "@/components/GardenScreen";
import SettingsScreen from "@/components/SettingsScreen";
import PixelAvatar from "@/components/PixelAvatar";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-joy-white flex items-center justify-center">
        <div className="text-joy-steel-blue font-nunito">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
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

  const handleAvatarClick = () => {
    setActiveTab('settings');
  };

  return (
    <div className="min-h-screen w-full bg-joy-white">
      {/* Pixel Avatar in top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <PixelAvatar onClick={handleAvatarClick} />
      </div>
      
      {renderActiveScreen()}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
