import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useStreakData } from "@/hooks/useStreakData";
import { useTutorial } from "@/hooks/useTutorial";
import { useNudgeLikes } from "@/hooks/useNudgeLikes";
import { useGardenData } from "@/hooks/useGardenData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getRandomFallbackNudge } from "@/data/fallbackNudges";
import Tutorial from "./Tutorial";
import FocusMode from "./FocusMode";
import MoodSelector from "./MoodSelector";
import LoadingScreen from "./LoadingScreen";
import HomeHeader from "./home/HomeHeader";
import StreakDisplay from "./home/StreakDisplay";
import FocusModeButton from "./home/FocusModeButton";
import MainNudgeCard from "./home/MainNudgeCard";
import MoreNudgesSection from "./home/MoreNudgesSection";
import { useSoundEffects } from "./home/useSoundEffects";
import { useAudioManager } from "@/hooks/useAudioManager";

const prompts = [
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

const breathingNudge = {
  id: 1,
  nudge: "Take 3 deep breaths",
  description: "Center yourself with mindful breathing. Follow the gentle guide to inhale, hold, and exhale three times.",
  affirmation: "Beautiful! You've created a moment of calm.",
  type: "breathe",
  duration: 3
};

export default function HomeScreen() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isEngaged, setIsEngaged] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showMoreNudges, setShowMoreNudges] = useState(false);
  const [aiNudges, setAiNudges] = useState<any[]>([]);
  const [loadingAiNudges, setLoadingAiNudges] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>('open');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCelebrationText, setShowCelebrationText] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  
  const { user } = useAuth();
  const { streakData, updateStreak } = useStreakData();
  const { shouldShowTutorial, markTutorialComplete, loading: tutorialLoading } = useTutorial();
  const { toggleLike, isLiked, getNextQueuedNudge, removeFromQueue } = useNudgeLikes();
  const { gardenData } = useGardenData();
  const { toast } = useToast();
  const { playSound } = useSoundEffects();
  const { playBackgroundMusic, stopBackgroundMusic, initializeAudio } = useAudioManager();

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'there';

  // Check if this is the user's first time and show breathing nudge
  useEffect(() => {
    const hasSeenBreathingNudge = localStorage.getItem('hasSeenBreathingNudge');
    if (!hasSeenBreathingNudge && user) {
      setIsFirstTime(true);
    }
  }, [user]);

  // Check for queued nudges and use them instead of default prompts
  useEffect(() => {
    const queuedNudge = getNextQueuedNudge();
    if (queuedNudge && !isFirstTime) {
      const existingIndex = prompts.findIndex(p => p.id.toString() === queuedNudge.id.toString());
      
      if (existingIndex === -1) {
        prompts.unshift(queuedNudge);
        setCurrentPromptIndex(0);
      } else {
        setCurrentPromptIndex(existingIndex);
      }
    }
  }, [isFirstTime]);

  const currentPrompt = isFirstTime ? breathingNudge : prompts[currentPromptIndex];

  // Initialize app with loading screen and mood selector
  useEffect(() => {
    const initializeApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsInitialLoading(false);
      
      const lastMoodDate = localStorage.getItem('lastMoodDate');
      const today = new Date().toDateString();
      
      if (lastMoodDate !== today && !gardenData.todaysMood) {
        setTimeout(() => setShowMoodSelector(true), 500);
      }
    };

    if (user && !tutorialLoading) {
      initializeApp();
    }
  }, [user, tutorialLoading, gardenData.todaysMood]);

  // Initialize audio and start background music when component mounts
  useEffect(() => {
    const startAudio = async () => {
      await initializeAudio();
      // Start subtle background music for home screen
      setTimeout(() => {
        playBackgroundMusic('home', true);
      }, 1000);
    };

    if (user && !tutorialLoading && !isInitialLoading) {
      startAudio();
    }

    // Cleanup function to stop background music when component unmounts
    return () => {
      stopBackgroundMusic();
    };
  }, [user, tutorialLoading, isInitialLoading, initializeAudio, playBackgroundMusic, stopBackgroundMusic]);

  const handleMoodSelect = async (mood: string) => {
    playSound('mood_select');
    setCurrentMood(mood);
    setShowMoodSelector(false);
    localStorage.setItem('lastMoodDate', new Date().toDateString());
    localStorage.setItem('currentMood', mood);
    
    try {
      await supabase
        .from('mood_logs')
        .insert({
          user_id: user?.id,
          mood_value: mood,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing mood:', error);
    }
    
    toast({
      title: `Feeling ${mood} today`,
      description: "We'll tailor your nudges to match your mood! ✨"
    });
  };

  const handleEngage = () => {
    playSound('engage');
    setIsEngaged(true);
  };

  const handleSkip = () => {
    playSound('button_click');
    if (isFirstTime) {
      localStorage.setItem('hasSeenBreathingNudge', 'true');
      setIsFirstTime(false);
    }
    
    // Remove current nudge from queue if it's a queued nudge
    removeFromQueue(currentPrompt.id.toString());
    
    // Move to next nudge
    setCurrentPromptIndex(prev => (prev + 1) % prompts.length);
    setIsEngaged(false);
  };
  
  const handleSkipBreathing = () => {
    playSound('button_click');
    if (isFirstTime) {
      localStorage.setItem('hasSeenBreathingNudge', 'true');
      setIsFirstTime(false);
    }
    setIsEngaged(false);
  };
  
  const handleComplete = async () => {
    playSound('completion');
    setIsEngaged(false);
    setCelebrating(true);
    setShowCelebrationText(false);
    
    if (isFirstTime) {
      localStorage.setItem('hasSeenBreathingNudge', 'true');
      setIsFirstTime(false);
    }
    
    removeFromQueue(currentPrompt.id.toString());
    
    // Store nudge completion in backend
    try {
      if (user) {
        const completionData = {
          user_id: user.id,
          nudge_id: currentPrompt.id,
          nudge_title: currentPrompt.nudge,
          completed_at: new Date().toISOString(),
          duration_seconds: currentPrompt.duration || 0,
          mood_at_completion: currentMood
        };

        // Store in local storage for immediate UI updates
        const existingCompletions = JSON.parse(localStorage.getItem('nudgeCompletions') || '[]');
        existingCompletions.push(completionData);
        localStorage.setItem('nudgeCompletions', JSON.stringify(existingCompletions));

        // Store in Supabase
        await supabase
          .from('nudge_completions')
          .insert({
            user_id: user.id,
            user_nudge_id: currentPrompt.id.toString(),
            duration_seconds: currentPrompt.duration || 0,
            mood_at_completion: currentMood,
            completed_at: new Date().toISOString()
          });

        console.log('Nudge completion stored successfully');
      }
    } catch (error) {
      console.error('Error storing nudge completion:', error);
    }

    await updateStreak();
    
    setTimeout(() => {
      setShowCelebrationText(true);
    }, 800);
    
    setTimeout(() => {
      setCelebrating(false);
      setShowCelebrationText(false);
      setShowMoreNudges(true);
      generateMoreNudges();
    }, 2500);
  };

  const generateMoreNudges = async () => {
    if (loadingAiNudges) return;
    
    setLoadingAiNudges(true);
    try {
      const nudgePromises = Array.from({ length: 3 }, async () => {
        try {
          const { data, error } = await supabase.functions.invoke('generate-nudge', {
            body: {
              context: 'post-completion suggestions',
              current_mood: currentMood,
              requested_interactive_type: 'REFLECTIVE'
            }
          });

          if (error) throw error;
          return data?.nudge;
        } catch (error) {
          console.log('AI generation failed, using fallback');
          return getRandomFallbackNudge();
        }
      });

      const results = await Promise.all(nudgePromises);
      const validNudges = results.filter(Boolean);
      setAiNudges(validNudges);
    } catch (error) {
      console.error('Error generating nudges:', error);
      const fallbackNudges = Array.from({ length: 3 }, () => getRandomFallbackNudge());
      setAiNudges(fallbackNudges);
    } finally {
      setLoadingAiNudges(false);
    }
  };

  const handleTryAiNudge = (nudge: any) => {
    const aiPrompt = {
      id: nudge.id,
      nudge: nudge.title,
      description: nudge.description,
      affirmation: "Wonderful! Thank you for trying this personalized nudge.",
      type: nudge.interactive_type?.toLowerCase() || "reflective"
    };
    
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

  const handleNudgeLike = (nudge: any) => {
    playSound('like');
    toggleLike(nudge.id.toString(), nudge);
  };

  const displayStreak = streakData?.current_streak_days || 0;

  if (isInitialLoading) {
    return <LoadingScreen isLoading={true} />;
  }

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
        {/* Mood Selector */}
        <AnimatePresence>
          {showMoodSelector && (
            <MoodSelector 
              onMoodSelect={handleMoodSelect}
              onSkip={() => setShowMoodSelector(false)}
            />
          )}
        </AnimatePresence>

        <HomeHeader username={username} />
        <StreakDisplay streak={displayStreak} />
        <FocusModeButton 
          onFocusClick={() => setShowFocusMode(true)} 
          playSound={playSound}
        />

        {/* MAIN NUDGE CARD */}
        <AnimatePresence mode="wait">
          {showMoreNudges ? (
            <MoreNudgesSection
              loadingAiNudges={loadingAiNudges}
              aiNudges={aiNudges}
              onTryAiNudge={handleTryAiNudge}
              onTryAnother={handleTryAnother}
              onClose={() => setShowMoreNudges(false)}
              onNudgeLike={handleNudgeLike}
              isLiked={isLiked}
            />
          ) : (
            <MainNudgeCard
              currentPrompt={currentPrompt}
              isEngaged={isEngaged}
              celebrating={celebrating}
              showCelebrationText={showCelebrationText}
              isFirstTime={isFirstTime}
              onEngage={handleEngage}
              onComplete={handleComplete}
              onSkip={handleSkip}
              onNudgeLike={handleNudgeLike}
              isLiked={isLiked}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Tutorial Modal */}
      {shouldShowTutorial && (
        <div className="fixed inset-0 z-40">
          <Tutorial
            onComplete={() => markTutorialComplete()}
            onSkip={() => markTutorialComplete()}
          />
        </div>
      )}

      {/* Focus Mode Modal */}
      <AnimatePresence>
        {showFocusMode && (
          <FocusMode onClose={() => setShowFocusMode(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
