
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import TabNavigation from "@/components/TabNavigation";
import HomeScreen from "@/components/HomeScreen";
import DiscoverScreen from "@/components/DiscoverScreen";
import GardenScreen from "@/components/GardenScreen";
import SettingsScreen from "@/components/SettingsScreen";
import LoadingScreen from "@/components/LoadingScreen";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && !loading) {
      // Simulate app initialization
      const timer = setTimeout(() => {
        setIsAppLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  if (loading || !user) {
    return <LoadingScreen isLoading={true} />;
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
      <AnimatePresence>
        {isAppLoading && <LoadingScreen isLoading={true} />}
      </AnimatePresence>
      
      {!isAppLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {renderActiveScreen()}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>
      )}
    </div>
  );
};

export default Index;
