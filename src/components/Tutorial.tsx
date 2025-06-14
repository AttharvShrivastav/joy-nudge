
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useTutorial } from '@/hooks/useTutorial';
import JoyIcon from './JoyIcon';

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  spotlightElement?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Joy Nudge!',
    description: "Let's find your daily dose of happy together. This quick tour will show you around!",
  },
  {
    id: 'home',
    title: 'Your Daily Nudge',
    description: 'This is your daily nudge! Complete it to grow your streak and boost your happiness.',
    targetElement: '[data-tutorial="current-nudge"]',
    spotlightElement: '[data-tutorial="current-nudge"]',
  },
  {
    id: 'discover',
    title: 'Discover New Nudges',
    description: 'Tap here to find new nudges, or let our AI suggest fresh ideas tailored just for you!',
    targetElement: '[data-tab="discover"]',
    spotlightElement: '[data-tab="discover"]',
  },
  {
    id: 'garden',
    title: 'Your Joy Garden',
    description: 'Watch your progress bloom and reflect on your mindfulness journey in your personal Joy Garden.',
    targetElement: '[data-tab="garden"]',
    spotlightElement: '[data-tab="garden"]',
  },
  {
    id: 'ready',
    title: 'Ready to Start?',
    description: "You're all set! Let's begin your journey to daily joy and mindfulness.",
  },
];

export default function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const getSpotlightPosition = () => {
    if (!currentStepData.spotlightElement) return null;
    
    const element = document.querySelector(currentStepData.spotlightElement);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  };

  const spotlightPosition = getSpotlightPosition();

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.3, type: "spring", stiffness: 300 }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Dark overlay with spotlight cutout */}
        <div className="absolute inset-0 bg-black bg-opacity-60">
          {spotlightPosition && (
            <div
              className="absolute bg-white bg-opacity-10 rounded-xl border-2 border-joy-light-blue shadow-2xl"
              style={{
                top: spotlightPosition.top - 8,
                left: spotlightPosition.left - 8,
                width: spotlightPosition.width + 16,
                height: spotlightPosition.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 30px rgba(168, 218, 220, 0.5)',
              }}
            />
          )}
        </div>

        {/* Tutorial Modal */}
        <div className="flex items-center justify-center min-h-screen p-6">
          <motion.div
            className="joy-card max-w-md w-full p-6 relative"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close button */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 text-joy-steel-blue hover:text-joy-dark-blue transition-colors"
            >
              <X size={20} />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center"
              >
                {currentStep === 0 && (
                  <div className="flex justify-center mb-4">
                    <JoyIcon size={48} />
                  </div>
                )}

                <h2 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-3">
                  {currentStepData.title}
                </h2>
                
                <p className="text-joy-steel-blue font-lato mb-6 leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Progress indicators */}
                <div className="flex justify-center space-x-2 mb-6">
                  {tutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentStep
                          ? 'bg-joy-coral w-6'
                          : index < currentStep
                          ? 'bg-joy-steel-blue'
                          : 'bg-joy-light-blue'
                      }`}
                    />
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onSkip}
                    className="flex-1 px-4 py-2 text-joy-steel-blue font-nunito font-medium hover:text-joy-dark-blue transition-colors"
                  >
                    Skip Tour
                  </button>
                  
                  <button
                    onClick={handleNext}
                    className="flex-1 joy-button-primary py-2 font-nunito font-semibold flex items-center justify-center gap-2"
                  >
                    {isLastStep ? 'Get Started!' : 'Next'}
                    {!isLastStep && <ChevronRight size={16} />}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
