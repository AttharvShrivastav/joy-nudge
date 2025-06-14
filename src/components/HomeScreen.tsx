
import { useState } from "react";
import { Flame, Focus, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStreakData } from "@/hooks/useStreakData";
import { useTutorial } from "@/hooks/useTutorial";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import PixelAvatar from "./PixelAvatar";
import InteractiveNudge from "./InteractiveNudge";
import Celebration from "./Celebration";
import Tutorial from "./Tutorial";
import FocusMode from "./FocusMode";

const prompts = [
  {
    id: 1,
    nudge: "Take 3 deep breaths",
    description: "Center yourself with mindful breathing. Follow the gentle guide to inhale, hold, and exhale three times.",
    affirmation: "Beautiful! You've created a moment of calm.",
    type: "breathe",
    duration: 3
  },
  {
    id: 2,
    nudge: "Stretch for 1 minute",
    description: "Give your body some love with gentle movement. Any stretch that feels good to you.",
    affirmation: "Wonderful! Your body thanks you.",
    type: "timer",
    duration: 60
  },
  {
    id: 3,
    nudge: "Notice 5 things you can see",
    description: "Ground yourself in the present moment by observing your surroundings with curiosity.",
    affirmation: "Perfect! You've anchored yourself in the now.",
    type: "observational",
    items: ["Something colorful", "Something textured", "Something moving", "Something still", "Something that makes you smile"]
  },
  {
    id: 4,
    nudge: "Write one thing you're grateful for",
    description: "Take a moment to acknowledge something positive in your life, no matter how small.",
    affirmation: "Thank you for sharing your gratitude!",
    type: "reflective"
  },
  {
    id: 5,
    nudge: "Journal your thoughts",
    description: "Take a few minutes to write down what's on your mind. Let your thoughts flow freely onto the page.",
    affirmation: "Beautiful reflection! Your thoughts matter.",
    type: "reflective"
  },
  {
    id: 6,
    nudge: "What made you smile today?",
    description: "Reflect on a moment that brought joy to your day, however small it might have been.",
    affirmation: "Thank you for sharing that beautiful moment!",
    type: "reflective"
  }
];

export default function HomeScreen() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isEngaged, setIsEngaged] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showMoreNudges, setShowMoreNudges] = useState(false);
  const [aiNudges, setAiNudges] = useState<any[]>([]);
  const [loadingAiNudges, setLoadingAiNudges] = useState(false);
  const { user } = useAuth();
  const { streakData, updateStreak } = useStreakData();
  const { shouldShowTutorial, markTutorialComplete, loading: tutorialLoading } = useTutorial();
  const { toast } = useToast();

  const currentPrompt = prompts[currentPromptIndex];

  const handleEngage = () => setIsEngaged(true);
  
  const handleComplete = async () => {
    setIsEngaged(false);
    setCelebrating(true);
    
    // Update streak in database
    await updateStreak();
    
    setTimeout(() => {
      setCelebrating(false);
      setShowMoreNudges(true);
      generateMoreNudges();
    }, 2000);
  };

  const generateMoreNudges = async () => {
    if (loadingAiNudges) return;
    
    setLoadingAiNudges(true);
    try {
      const nudgePromises = Array.from({ length: 3 }, async () => {
        const { data, error } = await supabase.functions.invoke('generate-nudge', {
          body: {
            context: 'post-completion suggestions',
            current_mood: 'accomplished',
            requested_interactive_type: Math.random() > 0.5 ? 'REFLECTIVE' : undefined
          }
        });

        if (error) {
          console.error('Error generating nudge:', error);
          return null;
        }

        return data?.nudge;
      });

      const results = await Promise.all(nudgePromises);
      const validNudges = results.filter(Boolean);
      setAiNudges(validNudges);
      
      if (validNudges.length === 0) {
        toast({
          title: "Something went wrong",
          description: "Couldn't generate new nudges. Try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating multiple nudges:', error);
      toast({
        title: "Generation Error", 
        description: "Couldn't create new nudges. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingAiNudges(false);
    }
  };

  const handleTryAiNudge = (nudge: any) => {
    // Convert AI nudge to our prompt format
    const aiPrompt = {
      id: nudge.id,
      nudge: nudge.title,
      description: nudge.description,
      affirmation: "Wonderful! Thank you for trying this personalized nudge.",
      type: nudge.interactive_type?.toLowerCase() || "reflective"
    };
    
    // Add to prompts array and switch to it
    const newIndex = prompts.length;
    prompts.push(aiPrompt);
    setCurrentPromptIndex(newIndex);
    setShowMoreNudges(false);
    setIsEngaged(false);
  };

  const handleTryAnother = () => {
    setCurrentPromptIndex(prev => (prev + 1) % prompts.length);
    setShowMoreNudges(false);
    setIsEngaged(false);
  };

  const handleTutorialComplete = () => {
    markTutorialComplete();
  };

  const handleTutorialSkip = () => {
    markTutorialComplete();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'there';
    
    let timeGreeting = '';
    if (hour < 12) timeGreeting = "Good Morning";
    else if (hour < 17) timeGreeting = "Good Afternoon";
    else timeGreeting = "Good Evening";
    
    return `${timeGreeting}, ${username}!`;
  };

  const displayStreak = streakData?.current_streak_days || 0;

  // Enhanced streak display with milestone celebration
  const getStreakDisplay = () => {
    const streak = displayStreak;
    if (streak >= 30) {
      return { emoji: "🏆", color: "from-yellow-400 to-orange-500", message: "Streak Master!" };
    } else if (streak >= 14) {
      return { emoji: "🌟", color: "from-purple-400 to-pink-500", message: "Two Weeks Strong!" };
    } else if (streak >= 7) {
      return { emoji: "🔥", color: "from-red-400 to-orange-500", message: "One Week!" };
    } else if (streak >= 3) {
      return { emoji: "⚡", color: "from-blue-400 to-purple-500", message: "Building momentum!" };
    }
    return { emoji: "🌱", color: "from-green-400 to-blue-500", message: "Getting started!" };
  };

  const streakDisplay = getStreakDisplay();

  if (tutorialLoading) {
    return (
      <div className="min-h-screen bg-joy-white flex items-center justify-center">
        <div className="text-joy-steel-blue font-nunito">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4 relative">
      <div className="max-w-md mx-auto pt-8 relative">
        {/* Pixelated Avatar in top right */}
        <div className="absolute top-0 right-0 z-30">
          <PixelAvatar size="md" />
        </div>
        
        {/* Top bar: greeting and enhanced streak */}
        <div className="flex justify-center items-center mb-6 pt-2">
          <div className="flex flex-col items-center">
            <span className="font-nunito text-xl font-semibold text-joy-dark-blue mb-1">
              {getGreeting()}
            </span>
            
            {/* Enhanced streak display */}
            <div className={`flex items-center mt-1 gap-2 bg-gradient-to-r ${streakDisplay.color} px-4 py-2 rounded-full shadow-lg border-2 border-white/50`}>
              <span className="text-2xl">{streakDisplay.emoji}</span>
              <div className="text-center">
                <div className="font-nunito font-bold text-xl text-white">{displayStreak}</div>
                <div className="font-lato text-white text-xs opacity-90">{streakDisplay.message}</div>
              </div>
              <Flame className="text-white/80" size={20} />
            </div>
          </div>
        </div>

        {/* Focus Mode Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowFocusMode(true)}
            className="w-full bg-gradient-to-r from-joy-steel-blue to-joy-dark-blue text-white rounded-xl p-4 flex items-center justify-center gap-3 hover:from-joy-dark-blue hover:to-joy-steel-blue transition-all duration-200 shadow-lg"
          >
            <Focus className="w-6 h-6" />
            <div className="text-left">
              <div className="font-nunito font-semibold text-lg">Start Focus Time</div>
              <div className="font-lato text-sm opacity-90">Deep work with joy</div>
            </div>
          </button>
        </div>

        {/* MAIN NUDGE CARD OR MORE NUDGES */}
        <div className="relative z-10">
          <Celebration show={celebrating} />
          
          {showMoreNudges ? (
            <div className="joy-card p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-2">
                  What's next?
                </h2>
                <p className="text-joy-steel-blue font-lato">
                  Try another nudge to keep the momentum going!
                </p>
              </div>

              {/* AI Generated Nudges */}
              {loadingAiNudges ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="animate-spin text-joy-coral mr-2" size={20} />
                  <span className="text-joy-steel-blue font-lato">Creating personalized nudges...</span>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {aiNudges.map((nudge, index) => (
                    <div key={nudge.id || index} className="border border-joy-light-blue/30 rounded-lg p-4 hover:bg-joy-light-blue/5 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-joy-coral" size={16} />
                        <h3 className="font-nunito font-semibold text-joy-dark-blue">{nudge.title}</h3>
                      </div>
                      <p className="text-joy-steel-blue font-lato text-sm mb-3">{nudge.description}</p>
                      <button
                        onClick={() => handleTryAiNudge(nudge)}
                        className="joy-button-primary text-sm px-4 py-2"
                      >
                        Try This Nudge
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleTryAnother}
                  className="joy-button-secondary flex-1"
                >
                  Try Another Classic
                </button>
                <button
                  onClick={() => setShowMoreNudges(false)}
                  className="joy-button-primary flex-1"
                >
                  I'm Done for Now
                </button>
              </div>
            </div>
          ) : (
            <>
              {!celebrating && (
                <div
                  className="joy-card p-6 text-center animate-fade-in"
                  style={{ minHeight: 340 }}
                  data-tutorial="current-nudge"
                >
                  <h2 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-2">
                    {currentPrompt.nudge}
                  </h2>
                  <p className="text-joy-steel-blue font-lato mb-6 leading-relaxed">
                    {currentPrompt.description}
                  </p>
                  {!isEngaged ? (
                    <button
                      onClick={handleEngage}
                      className="joy-button-primary w-full text-lg mt-3"
                    >
                      Engage
                    </button>
                  ) : (
                    <InteractiveNudge
                      nudge={currentPrompt}
                      onComplete={handleComplete}
                    />
                  )}
                </div>
              )}
              {celebrating && (
                <div className="joy-card p-8 text-center animate-fade-in">
                  <div className="text-4xl mb-4">🌟</div>
                  <div className="joy-script text-2xl">
                    {currentPrompt.affirmation}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tutorial Modal */}
      {shouldShowTutorial && (
        <div className="fixed inset-0 z-40">
          <Tutorial
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
          />
        </div>
      )}

      {/* Focus Mode Modal */}
      {showFocusMode && (
        <FocusMode onClose={() => setShowFocusMode(false)} />
      )}
    </div>
  );
}
