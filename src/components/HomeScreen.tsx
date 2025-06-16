
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useStreakData } from "@/hooks/useStreakData";
import { useTutorial } from "@/hooks/useTutorial";
import { useNudgeLikes } from "@/hooks/useNudgeLikes";
import { useGardenData } from "@/hooks/useGardenData";
import { useAudioManager } from "@/hooks/useAudioManager";
import { useNudgeManager } from "@/hooks/useNudgeManager";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useAiNudges } from "@/hooks/useAiNudges";
import { useMoodManager } from "@/hooks/useMoodManager";
import { prompts } from "@/data/defaultNudges";
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

export default function HomeScreen({ onAvatarClick }: { onAvatarClick?: () => void }) {
  const [isEngaged, setIsEngaged] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showMoreNudges, setShowMoreNudges] = useState(false);
  const [showCelebrationText, setShowCelebrationText] = useState(false);
  
  const { user } = useAuth();
  const { streakData, updateStreak } = useStreakData();
  const { shouldShowTutorial, markTutorialComplete, loading: tutorialLoading } = useTutorial();
  const { toggleLike, isLiked } = useNudgeLikes();
  const { gardenData } = useGardenData();
  const { playSound } = useSoundEffects();
  const { initializeAudio } = useAudioManager();

  const { isInitialLoading, showMoodSelector, setShowMoodSelector } = useAppInitialization(user, tutorialLoading, gardenData);
  const { currentMood, handleMoodSelect } = useMoodManager(user, playSound);
  const { currentPrompt, isFirstTime, handleSkip, handleComplete, setCurrentPromptIndex } = useNudgeManager(user, currentMood);
  const { aiNudges, loadingAiNudges, generateMoreNudges } = useAiNudges(currentMood);

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'there';

  // Initialize audio context without background music
  useEffect(() => {
    const startAudio = async () => {
      await initializeAudio();
      console.log('Audio context initialized for sound effects');
    };

    if (user && !tutorialLoading && !isInitialLoading) {
      startAudio();
    }
  }, [user, tutorialLoading, isInitialLoading, initializeAudio]);

  const handleMoodSelectWithClose = async (mood: string) => {
    await handleMoodSelect(mood);
    setShowMoodSelector(false);
  };

  const handleEngage = () => {
    playSound('engage');
    setIsEngaged(true);
  };

  const handleSkipWithSound = async () => {
    playSound('button_click');
    await handleSkip();
    setIsEngaged(false);
  };

  const handleCompleteWithCelebration = async () => {
    playSound('completion');
    setIsEngaged(false);
    setCelebrating(true);
    setShowCelebrationText(false);
    
    await handleComplete();
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
              onMoodSelect={handleMoodSelectWithClose}
              onSkip={() => setShowMoodSelector(false)}
            />
          )}
        </AnimatePresence>

        <HomeHeader username={username} onAvatarClick={onAvatarClick} />
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
              onComplete={handleCompleteWithCelebration}
              onSkip={handleSkipWithSound}
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
