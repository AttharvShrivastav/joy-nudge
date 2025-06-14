
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
];

export default function HomeScreen() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isEngaged, setIsEngaged] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [streak, setStreak] = useState(7); // Example streak
  
  const currentPrompt = prompts[currentPromptIndex];
  
  const handleEngage = () => {
    setIsEngaged(true);
  };
  
  const handleComplete = () => {
    setIsEngaged(false);
    setCelebrating(true);
    
    setTimeout(() => {
      setCelebrating(false);
      setStreak(prev => prev + 1);
      setCurrentPromptIndex(prev => (prev + 1) % prompts.length);
    }, 2000);
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 17) return "Good Afternoon!";
    return "Good Evening!";
  };
  
  return (
    <div className="min-h-screen bg-joy-gradient pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-2">
            {getGreeting()}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 bg-joy-white/80 px-3 py-1 rounded-full">
              <span className="text-joy-coral text-lg">🔥</span>
              <span className="text-joy-dark-blue font-lato font-semibold">{streak} day streak</span>
            </div>
          </div>
        </div>
        
        <Celebration show={celebrating} />
        
        <AnimatePresence mode="wait">
          {!celebrating && (
            <motion.div
              key={currentPrompt.id + (isEngaged ? '-engaged' : '-idle')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!isEngaged ? (
                /* Nudge Card */
                <div className="joy-card p-6 text-center">
                  <div className="w-16 h-16 bg-joy-light-blue/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  
                  <h2 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-3">
                    {currentPrompt.nudge}
                  </h2>
                  
                  <p className="text-joy-steel-blue font-lato mb-6 leading-relaxed">
                    {currentPrompt.description}
                  </p>
                  
                  <button
                    onClick={handleEngage}
                    className="joy-button-primary w-full text-lg"
                  >
                    Engage
                  </button>
                </div>
              ) : (
                /* Interactive Element */
                <InteractiveNudge 
                  nudge={currentPrompt} 
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          )}
          
          {celebrating && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="joy-card p-8 text-center"
            >
              <div className="text-4xl mb-4">🌟</div>
              <div className="joy-script text-2xl">
                {currentPrompt.affirmation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
