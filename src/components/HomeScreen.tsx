
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Target, Flame, Play } from "lucide-react";
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
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
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
              <h1 className="text-xl font-fredoka font-bold text-joy-dark-blue mb-1">
                {greeting}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Friend'}!
              </h1>
              <p className="text-joy-steel-blue font-lato text-sm">
                {currentMood ? `Perfect for when you're feeling ${currentMood}` : 'Ready for your moment of joy?'}
              </p>
            </motion.div>

            {/* Streak Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-joy-white rounded-lg p-4 mb-4 shadow-lg border border-joy-light-blue/20"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="w-6 h-6 text-joy-coral" />
                </motion.div>
                <div>
                  <div className="text-lg font-fredoka font-bold text-joy-coral">
                    {streakData?.current_streak_days || 0} day streak
                  </div>
                  <div className="text-xs text-joy-steel-blue font-lato">
                    Keep it going!
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Current Nudge */}
            {currentNudge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-joy-white rounded-lg p-4 mb-4 shadow-lg border border-joy-light-blue/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="font-fredoka font-bold text-joy-dark-blue text-base mb-2">
                      {currentNudge.title}
                    </h2>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs bg-joy-sage/20 text-joy-sage px-2 py-1 rounded-full font-lato">
                        {currentNudge.category}
                      </span>
                      {currentNudge.is_ai_generated && (
                        <span className="text-xs bg-joy-coral/20 text-joy-coral px-2 py-1 rounded-full flex items-center font-lato">
                          <Sparkles size={8} className="mr-1" />
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                  <LikeButton nudgeId={currentNudge.id} nudgeData={currentNudge} size="md" />
                </div>
                
                <p className="text-joy-steel-blue font-lato text-sm mb-4">
                  {currentNudge.description}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTryNow}
                  className="w-full bg-joy-coral text-joy-white py-3 rounded-lg font-fredoka font-bold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Now</span>
                </motion.button>
              </motion.div>
            )}

            {/* Focus Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-joy-white rounded-lg p-4 mb-4 shadow-lg border border-joy-light-blue/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-fredoka font-bold text-joy-dark-blue text-sm mb-1">
                    Start Focus Session
                  </h3>
                  <p className="text-joy-steel-blue font-lato text-xs">
                    Deep focus time for productivity
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFocus(true)}
                  className="bg-joy-steel-blue text-joy-white px-4 py-2 rounded-lg font-fredoka font-semibold text-sm shadow-lg"
                >
                  <Target className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>

            {/* Get New Nudge Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleRefreshNudge}
                disabled={isGenerating}
                className="w-full bg-joy-white text-joy-dark-blue py-3 rounded-lg font-fredoka font-semibold border-2 border-joy-light-blue/30 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg"
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
