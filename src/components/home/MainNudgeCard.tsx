
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import InteractiveNudge from "../InteractiveNudge";
import Celebration from "../Celebration";

interface NudgeData {
  id: number;
  nudge: string;
  description: string;
  affirmation: string;
  type: string;
  duration?: number;
  items?: string[];
  interactive_type?: string;
}

interface MainNudgeCardProps {
  currentPrompt: NudgeData;
  isEngaged: boolean;
  celebrating: boolean;
  showCelebrationText: boolean;
  isFirstTime: boolean;
  onEngage: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onNudgeLike: (nudge: NudgeData) => void;
  isLiked: (id: string) => boolean;
}

export default function MainNudgeCard({
  currentPrompt,
  isEngaged,
  celebrating,
  showCelebrationText,
  isFirstTime,
  onEngage,
  onComplete,
  onSkip,
  onNudgeLike,
  isLiked
}: MainNudgeCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`relative ${isEngaged ? 'fixed inset-0 z-[9999] bg-joy-white/95 backdrop-blur-sm flex items-center justify-center p-4' : 'z-10'}`}
    >
      <Celebration show={celebrating} />
      
      <motion.div
        key="main-nudge"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={isEngaged ? 'w-full max-w-md' : ''}
      >
        {!celebrating && (
          <div
            className="joy-card p-6 text-center animate-fade-in"
            style={{ minHeight: 340 }}
            data-tutorial="current-nudge"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-2">
                  {currentPrompt.nudge}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNudgeLike(currentPrompt)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked(currentPrompt.id.toString()) 
                    ? 'text-red-500' 
                    : 'text-joy-steel-blue hover:text-red-400'
                }`}
              >
                <Heart size={20} fill={isLiked(currentPrompt.id.toString()) ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
            
            <p className="text-joy-steel-blue font-lato mb-6 leading-relaxed">
              {currentPrompt.description}
            </p>
            
            <AnimatePresence mode="wait">
              {!isEngaged ? (
                <div className="space-y-3">
                  <motion.button
                    key="engage-button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onEngage}
                    className="joy-button-primary w-full text-lg"
                  >
                    Engage
                  </motion.button>
                  
                  {isFirstTime && currentPrompt.type === 'breathe' && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onSkip}
                      className="joy-button-secondary w-full text-sm"
                    >
                      Skip for now
                    </motion.button>
                  )}
                </div>
              ) : (
                <motion.div
                  key="interactive-nudge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <InteractiveNudge
                    nudge={currentPrompt}
                    onComplete={onComplete}
                    onSkip={currentPrompt.type === 'breathe' ? onSkip : undefined}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {celebrating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="joy-card p-8 text-center animate-fade-in"
          >
            <AnimatePresence>
              {showCelebrationText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="joy-script text-2xl">
                    {currentPrompt.affirmation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
