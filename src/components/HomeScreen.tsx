
import { useState } from "react";
import { Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStreakData } from "@/hooks/useStreakData";
import PixelAvatar from "./PixelAvatar";
import InteractiveNudge from "./InteractiveNudge";
import Celebration from "./Celebration";

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
  const { user } = useAuth();
  const { streakData, updateStreak } = useStreakData();

  const currentPrompt = prompts[currentPromptIndex];

  const handleEngage = () => setIsEngaged(true);
  
  const handleComplete = async () => {
    setIsEngaged(false);
    setCelebrating(true);
    
    // Update streak in database
    await updateStreak();
    
    setTimeout(() => {
      setCelebrating(false);
      setCurrentPromptIndex(prev => (prev + 1) % prompts.length);
    }, 2000);
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

  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4">
      <div className="max-w-md mx-auto pt-8 relative">
        {/* Pixelated Avatar in top right */}
        <div className="absolute top-0 right-0 z-10">
          <PixelAvatar size="md" />
        </div>
        
        {/* Top bar: greeting and streak */}
        <div className="flex justify-center items-center mb-6 pt-2">
          <div className="flex flex-col items-center">
            <span className="font-nunito text-xl font-semibold text-joy-dark-blue mb-1">
              {getGreeting()}
            </span>
            <div className="flex items-center mt-1 gap-1 bg-joy-light-blue px-3 py-1 rounded-full shadow border-[1.5px] border-joy-steel-blue">
              <Flame className="text-joy-coral" size={22} />
              <span className="font-nunito font-bold text-xl text-joy-dark-blue">{displayStreak}</span>
              <span className="font-lato text-joy-steel-blue text-sm ml-1">streak</span>
            </div>
          </div>
        </div>

        {/* MAIN NUDGE CARD */}
        <Celebration show={celebrating} />
        {!celebrating && (
          <div
            className="joy-card p-6 text-center animate-fade-in"
            style={{ minHeight: 340 }}
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
      </div>
    </div>
  );
}
