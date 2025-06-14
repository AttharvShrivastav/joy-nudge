
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, User, Home, Eye, Flower2, Sparkles } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Joy Nudge!',
    subtitle: "Let's find your daily dose of happy.",
    icon: Sparkles,
    content: 'Joy Nudge helps you cultivate micro-moments of joy and self-kindness every day.',
    showNext: true
  },
  {
    id: 'home',
    title: 'Your Daily Nudge',
    subtitle: 'Complete it to grow your streak',
    icon: Home,
    content: 'This is your daily nudge card and streak counter. Each completed nudge helps build your mindfulness habit.',
    target: '.joy-card',
    showNext: true
  },
  {
    id: 'discover',
    title: 'Discover New Nudges',
    subtitle: 'Find fresh inspiration',
    icon: Eye,
    content: 'Tap here to explore new nudges or let our AI suggest personalized ideas just for you!',
    target: '[data-tab="discover"]',
    showNext: true
  },
  {
    id: 'garden',
    title: 'Your Joy Garden',
    subtitle: 'Watch your progress bloom',
    icon: Flower2,
    content: 'Your personal garden grows with each completed nudge. Reflect on your journey and celebrate your progress.',
    target: '[data-tab="garden"]',
    showNext: true
  },
  {
    id: 'ready',
    title: 'Ready to start your joy journey?',
    subtitle: 'Your first moment of mindfulness awaits',
    icon: Play,
    content: 'You\'re all set! Remember, small moments of joy can create big changes in your life.',
    showNext: false
  }
];

export default function Tutorial({ onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  const spotlightVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 200
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const getTargetPosition = () => {
    if (!step.target) return null;
    
    const element = document.querySelector(step.target);
    if (!element) return null;
    
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    };
  };

  const targetPosition = getTargetPosition();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Spotlight effect for targeted elements */}
        {targetPosition && (
          <motion.div
            className="absolute bg-white/20 rounded-xl border-2 border-joy-light-blue shadow-[0_0_0_4px_rgba(168,218,220,0.3)]"
            style={{
              top: targetPosition.top - 8,
              left: targetPosition.left - 8,
              width: targetPosition.width + 16,
              height: targetPosition.height + 16,
            }}
            variants={spotlightVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}

        {/* Tutorial card */}
        <motion.div
          className="joy-card max-w-md w-full p-6 text-center relative"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          key={step.id}
        >
          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentStep ? 'bg-joy-coral' : 
                  index < currentStep ? 'bg-joy-steel-blue' : 'bg-joy-light-blue'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-16 h-16 bg-joy-light-blue rounded-full flex items-center justify-center">
              <step.icon className="w-8 h-8 text-joy-steel-blue" />
            </div>
          </motion.div>

          {/* Content */}
          <h2 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-2">
            {step.title}
          </h2>
          <p className="text-joy-coral font-nunito font-medium mb-3">
            {step.subtitle}
          </p>
          <p className="text-joy-steel-blue font-lato mb-6 leading-relaxed">
            {step.content}
          </p>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            {step.showNext ? (
              <button
                onClick={handleNext}
                className="joy-button-primary w-full py-3 font-nunito font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="joy-button-primary w-full py-3 font-nunito font-semibold hover:scale-105 transition-transform"
              >
                Start My Journey
              </button>
            )}
            
            <button
              onClick={onSkip}
              className="text-joy-steel-blue font-lato hover:text-joy-dark-blue transition-colors text-sm"
            >
              Skip tutorial
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
