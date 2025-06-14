
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Target, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useStreakData } from "@/hooks/useStreakData";
import InteractiveNudge from "./InteractiveNudge";
import AnimatedButton from "./AnimatedButton";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-joy-white to-joy-light-blue/10">
      <AnimatePresence mode="wait">
        {showSuggestions ? (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="p-4 pt-16 pb-24"
          >
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
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-4xl mb-3"
              >
                ✨
              </motion.div>
              <h2 className="text-xl font-fredoka font-bold text-joy-dark-blue mb-2">
                Wonderful! Keep the momentum going
              </h2>
              <p className="text-joy-steel-blue font-lato text-sm">
                Here are some more nudges you might enjoy
              </p>
            </motion.div>

            <div className="space-y-3 mb-6">
              {suggestedNudges.map((nudge, index) => (
                <motion.div
                  key={nudge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-joy-white rounded-xl p-4 shadow-lg border border-joy-light-blue/20 cursor-pointer"
                  onClick={() => handleTrySuggestion(nudge)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-nunito font-semibold text-joy-dark-blue text-base mb-1">
                        {nudge.title}
                      </h3>
                      <span className="text-xs bg-joy-sage/20 text-joy-sage px-2 py-1 rounded-full">
                        {nudge.category}
                      </span>
                    </div>
                    <LikeButton nudgeId={nudge.id} nudgeData={nudge} size="sm" />
                  </div>
                  <p className="text-joy-steel-blue font-lato text-sm mb-3">
                    {nudge.description}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-joy-coral text-white py-2 rounded-xl font-medium transition-all duration-200"
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
                className="text-joy-steel-blue underline font-lato"
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
            className="p-4 pt-16 pb-24"
          >
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
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-4xl mb-3"
              >
                🌟
              </motion.div>
              <h1 className="text-2xl font-fredoka font-bold text-joy-dark-blue mb-2">
                Your Joy Nudge
              </h1>
              <p className="text-joy-steel-blue font-lato text-sm">
                {currentMood ? `Perfect for when you're feeling ${currentMood}` : 'A moment of mindfulness, just for you'}
              </p>
            </motion.div>

            {/* Streak & Focus Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-joy-white rounded-xl p-4 shadow-lg border border-joy-light-blue/20"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Flame className="w-4 h-4 text-joy-coral" />
                  <span className="text-sm font-nunito font-semibold text-joy-dark-blue">Streak</span>
                </div>
                <div className="text-2xl font-fredoka font-bold text-joy-coral">
                  {streakData?.current_streak_days || 0}
                </div>
                <div className="text-xs text-joy-steel-blue">days</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFocus(true)}
                className="bg-joy-white rounded-xl p-4 shadow-lg border border-joy-light-blue/20 cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="w-4 h-4 text-joy-steel-blue" />
                  <span className="text-sm font-nunito font-semibold text-joy-dark-blue">Focus</span>
                </div>
                <div className="text-lg font-fredoka font-bold text-joy-steel-blue">
                  Start
                </div>
                <div className="text-xs text-joy-steel-blue">session</div>
              </motion.div>
            </motion.div>

            {currentNudge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-joy-white rounded-2xl p-5 shadow-xl border border-joy-light-blue/20 mb-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-nunito font-bold text-joy-dark-blue mb-2">
                      {currentNudge.title}
                    </h2>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xs bg-joy-sage/20 text-joy-sage px-2 py-1 rounded-full">
                        {currentNudge.category}
                      </span>
                      {currentNudge.is_ai_generated && (
                        <span className="text-xs bg-joy-coral/20 text-joy-coral px-2 py-1 rounded-full flex items-center">
                          <Sparkles size={10} className="mr-1" />
                          AI Generated
                        </span>
                      )}
                    </div>
                  </div>
                  <LikeButton nudgeId={currentNudge.id} nudgeData={currentNudge} />
                </div>
                
                <p className="text-joy-steel-blue font-lato mb-5 leading-relaxed text-sm">
                  {currentNudge.description}
                </p>

                <div className="space-y-3">
                  <AnimatedButton
                    onClick={handleTryNow}
                    text="Try Now ✨"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRefreshNudge}
                    disabled={isGenerating}
                    className="w-full bg-joy-light-blue/10 text-joy-dark-blue py-3 rounded-xl font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <motion.div
                      animate={isGenerating ? { rotate: 360 } : {}}
                      transition={{ duration: 1, repeat: isGenerating ? Infinity : 0 }}
                    >
                      <RefreshCw size={16} />
                    </motion.div>
                    <span>{isGenerating ? 'Generating...' : 'Get New Nudge'}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
