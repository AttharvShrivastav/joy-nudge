import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Target, Flame, Play, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useStreakData } from "@/hooks/useStreakData";
import InteractiveNudge from "./InteractiveNudge";
import LikeButton from "./LikeButton";
import FocusMode from "./FocusMode";
import { fallbackNudges } from "@/data/fallbackNudges";

interface HomeScreenProps {
  currentMood?: string | null;
}

interface NudgeData {
  id: string;
  title: string;
  description: string;
  category: string;
  interactive_type: string;
  is_ai_generated?: boolean;
}

export default function HomeScreen({ currentMood }: HomeScreenProps) {
  const [currentNudge, setCurrentNudge] = useState<NudgeData | null>(null);
  const [showInteractive, setShowInteractive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedNudges, setSuggestedNudges] = useState<NudgeData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { streakData, updateStreak } = useStreakData();

  useEffect(() => {
    if (user) {
      loadTodaysNudge();
    }
  }, [user, currentMood]);

  const loadTodaysNudge = async () => {
    try {
      // First try to get an AI-generated nudge for today
      const today = new Date().toISOString().split('T')[0];
      
      const { data: aiNudges } = await supabase
        .from('nudges')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_ai_generated', true)
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (aiNudges && aiNudges.length > 0) {
        setCurrentNudge(aiNudges[0]);
        return;
      }

      // If no AI nudge for today, use breathing nudge (first in fallback array)
      const breathingNudge = fallbackNudges[0]; // First nudge is always breathing
      setCurrentNudge({
        id: `breathing-${Date.now()}`,
        ...breathingNudge
      });
    } catch (error) {
      console.error('Error loading nudge:', error);
      // Fallback to breathing nudge
      const breathingNudge = fallbackNudges[0];
      setCurrentNudge({
        id: `fallback-${Date.now()}`,
        ...breathingNudge
      });
    }
  };

  const generatePersonalizedNudge = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-nudge', {
        body: { 
          user_id: user.id,
          current_mood: currentMood 
        }
      });

      if (error) throw error;

      if (data && data.nudge) {
        setCurrentNudge(data.nudge);
      } else {
        throw new Error('No nudge generated');
      }
    } catch (error) {
      console.error('Error generating nudge:', error);
      // Fallback to breathing nudge
      const breathingNudge = fallbackNudges[0];
      setCurrentNudge({
        id: `fallback-${Date.now()}`,
        ...breathingNudge
      });
      
      toast({
        title: "Using curated nudge",
        description: "Our AI is taking a quick break, but here's something special for you!"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTryNow = async () => {
    setShowInteractive(true);
    // Update streak when user starts a nudge
    if (updateStreak) {
      await updateStreak();
    }
  };

  const handleNudgeComplete = async () => {
    setShowInteractive(false);
    
    // Load suggestions after completion
    setTimeout(() => {
      loadSuggestions();
      setShowSuggestions(true);
    }, 500);
  };

  const loadSuggestions = async () => {
    try {
      // Get a mix of fallback nudges
      const randomSuggestions = [...fallbackNudges]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((nudge, index) => ({
          id: `suggestion-${Date.now()}-${index}`,
          ...nudge
        }));
      
      setSuggestedNudges(randomSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleRefreshNudge = () => {
    generatePersonalizedNudge();
  };

  const handleTrySuggestion = (nudge: NudgeData) => {
    setCurrentNudge(nudge);
    setShowSuggestions(false);
    setShowInteractive(true);
  };

  if (showFocus) {
    return <FocusMode onClose={() => setShowFocus(false)} />;
  }

  if (showInteractive && currentNudge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-joy-white to-joy-light-blue/10 p-4">
        <InteractiveNudge
          nudge={{
            id: parseInt(currentNudge.id.replace(/\D/g, '') || '0'),
            nudge: currentNudge.title,
            description: currentNudge.description,
            affirmation: "You're doing great!",
            type: currentNudge.interactive_type?.toLowerCase() || 'reflective',
            interactive_type: currentNudge.interactive_type,
            title: currentNudge.title,
            category: currentNudge.category
          }}
          onComplete={handleNudgeComplete}
        />
      </div>
    );
  }

  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good Morning" : currentTime < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-joy-white via-joy-light-blue/5 to-joy-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-4 w-16 h-16 bg-joy-light-blue/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-8 w-12 h-12 bg-joy-coral/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-40 left-8 w-20 h-20 bg-joy-steel-blue/5 rounded-full blur-2xl"></div>
      </div>

      <AnimatePresence mode="wait">
        {showSuggestions ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 p-4 pt-16 pb-24"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-3xl mb-2"
              >
                ✨
              </motion.div>
              <h2 className="text-lg font-fredoka font-bold text-joy-dark-blue mb-1">
                Wonderful! Keep the momentum going
              </h2>
              <p className="text-joy-steel-blue font-lato text-xs">
                Here are some more nudges you might enjoy
              </p>
            </motion.div>

            <div className="space-y-2 mb-4">
              {suggestedNudges.map((nudge, index) => (
                <motion.div
                  key={nudge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-joy-white rounded-lg p-3 shadow-lg border border-joy-light-blue/20 cursor-pointer"
                  onClick={() => handleTrySuggestion(nudge)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h3 className="font-fredoka font-semibold text-joy-dark-blue text-sm mb-1">
                        {nudge.title}
                      </h3>
                      <span className="text-xs bg-joy-sage/20 text-joy-sage px-2 py-1 rounded-full">
                        {nudge.category}
                      </span>
                    </div>
                    <LikeButton nudgeId={nudge.id} nudgeData={nudge} size="sm" />
                  </div>
                  <p className="text-joy-steel-blue font-lato text-xs mb-2">
                    {nudge.description}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-joy-coral text-white py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                  >
                    Try This One
                  </motion.button>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSuggestions(false)}
                className="text-joy-steel-blue underline font-lato text-sm"
              >
                Back to today's nudge
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 p-4 pt-16 pb-24"
          >
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-4xl mb-3"
              >
                🌅
              </motion.div>
              <h1 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-2">
                {greeting}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'}!
              </h1>
              <p className="text-joy-steel-blue font-lato text-sm">
                {currentMood ? `Perfect for when you're feeling ${currentMood}` : 'Ready for your moment of joy?'}
              </p>
            </motion.div>

            {/* Garden-Style Central Layout */}
            <div className="relative min-h-[400px] bg-gradient-to-b from-joy-white to-joy-light-blue/10 rounded-3xl p-6 mb-6 border border-joy-light-blue/20">
              
              {/* Streak Visualization - Top Left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-4 left-4"
              >
                <div className="flex items-center space-x-2 bg-joy-white/80 backdrop-blur-sm rounded-full px-3 py-2 border border-joy-light-blue/30">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame className="w-4 h-4 text-joy-coral" />
                  </motion.div>
                  <div>
                    <div className="text-lg font-nunito font-bold text-joy-coral leading-none">
                      {streakData?.current_streak_days || 0}
                    </div>
                    <div className="text-xs text-joy-steel-blue font-lato">streak</div>
                  </div>
                </div>
              </motion.div>

              {/* Focus Button - Top Right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-4 right-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFocus(true)}
                  className="flex items-center space-x-2 bg-joy-steel-blue text-joy-white rounded-full px-4 py-2 font-nunito font-semibold text-sm shadow-lg"
                >
                  <Target className="w-4 h-4" />
                  <span>Focus</span>
                </motion.button>
              </motion.div>

              {/* Central Nudge Display */}
              {currentNudge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="absolute inset-x-6 top-1/2 transform -translate-y-1/2"
                >
                  <div className="text-center space-y-4">
                    {/* Nudge Icon/Visual */}
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-6xl mb-4"
                    >
                      🌸
                    </motion.div>

                    {/* Nudge Title */}
                    <h2 className="text-xl font-nunito font-bold text-joy-dark-blue leading-tight">
                      {currentNudge.title}
                    </h2>

                    {/* Nudge Description */}
                    <p className="text-joy-steel-blue font-lato text-sm leading-relaxed max-w-xs mx-auto">
                      {currentNudge.description}
                    </p>

                    {/* Category & AI Badge */}
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xs bg-joy-sage/20 text-joy-sage px-3 py-1 rounded-full font-lato">
                        {currentNudge.category}
                      </span>
                      {currentNudge.is_ai_generated && (
                        <span className="text-xs bg-joy-coral/20 text-joy-coral px-3 py-1 rounded-full flex items-center font-lato">
                          <Sparkles size={10} className="mr-1" />
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Like Button - Bottom Right of Nudge Area */}
              {currentNudge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="absolute bottom-4 right-4"
                >
                  <LikeButton nudgeId={currentNudge.id} nudgeData={currentNudge} size="lg" />
                </motion.div>
              )}

              {/* Decorative Elements */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute bottom-6 left-6 text-2xl opacity-30"
              >
                🦋
              </motion.div>
              
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                className="absolute top-16 right-16 text-xl opacity-20"
              >
                🍃
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              {/* Primary Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTryNow}
                className="w-full bg-joy-coral text-joy-white py-4 rounded-2xl font-nunito font-bold text-lg shadow-xl flex items-center justify-center space-x-3 relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Play className="w-5 h-5" />
                </motion.div>
                <span>Begin Your Journey</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨
                </motion.div>
              </motion.button>

              {/* Secondary Action Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleRefreshNudge}
                disabled={isGenerating}
                className="w-full bg-joy-white text-joy-dark-blue py-3 rounded-xl font-nunito font-semibold border-2 border-joy-light-blue/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <motion.div
                  animate={isGenerating ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isGenerating ? Infinity : 0 }}
                >
                  <RefreshCw size={16} />
                </motion.div>
                <span>{isGenerating ? 'Generating...' : 'Get New Nudge'}</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
