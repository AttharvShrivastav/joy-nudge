
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import TabNavigation from "@/components/TabNavigation";
import HomeScreen from "@/components/HomeScreen";
import DiscoverScreen from "@/components/DiscoverScreen";
import GardenScreen from "@/components/GardenScreen";
import SettingsScreen from "@/components/SettingsScreen";
import PixelAvatar from "@/components/PixelAvatar";
import LoadingScreen from "@/components/LoadingScreen";
import MoodSelector from "@/components/MoodSelector";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && !loading) {
      initializeApp();
    }
  }, [user, loading]);

  const initializeApp = async () => {
    try {
      // Check if user has logged mood today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMood } = await supabase
        .from('mood_logs')
        .select('mood_value')
        .eq('user_id', user!.id)
        .gte('timestamp', `${today}T00:00:00`)
        .order('timestamp', { ascending: false })
        .limit(1);

      // Simulate app initialization with proper loading time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsAppLoading(false);
      
      // Show mood selector if no mood logged today
      if (!todayMood || todayMood.length === 0) {
        setTimeout(() => setShowMoodSelector(true), 800);
      } else {
        setCurrentMood(todayMood[0].mood_value);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsAppLoading(false);
    }
  };

  const handleMoodSelected = (mood: string) => {
    setCurrentMood(mood);
    setShowMoodSelector(false);
  };

  if (loading || !user) {
    return <LoadingScreen isLoading={true} />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen currentMood={currentMood} />;
      case 'discover':
        return <DiscoverScreen currentMood={currentMood} />;
      case 'garden':
        return <GardenScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen currentMood={currentMood} />;
    }
  };

  const handleAvatarClick = () => {
    setActiveTab('settings');
  };

  return (
    <div className="min-h-screen w-full bg-joy-white overflow-hidden">
      <AnimatePresence mode="wait">
        {isAppLoading && <LoadingScreen isLoading={true} />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showMoodSelector && (
          <MoodSelector
            isVisible={showMoodSelector}
            onMoodSelected={handleMoodSelected}
          />
        )}
      </AnimatePresence>
      
      {!isAppLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full"
        >
          {/* Pixel Avatar with enhanced animations */}
          <motion.div 
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ 
              delay: 0.3,
              duration: 0.5,
              type: "spring",
              stiffness: 200
            }}
            className="absolute top-4 right-4 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <PixelAvatar onClick={handleAvatarClick} />
            </motion.div>
          </motion.div>
          
          {/* Screen content with smooth transitions */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.4,
              ease: "easeOut"
            }}
          >
            {renderActiveScreen()}
          </motion.div>
          
          {/* Enhanced tab navigation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.2,
              duration: 0.5,
              ease: "easeOut"
            }}
          >
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
