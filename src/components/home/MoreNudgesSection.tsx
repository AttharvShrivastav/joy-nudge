
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Sparkles, Heart } from "lucide-react";

interface MoreNudgesSectionProps {
  loadingAiNudges: boolean;
  aiNudges: any[];
  onTryAiNudge: (nudge: any) => void;
  onTryAnother: () => void;
  onClose: () => void;
  onNudgeLike: (nudge: any) => void;
  isLiked: (id: string) => boolean;
}

export default function MoreNudgesSection({
  loadingAiNudges,
  aiNudges,
  onTryAiNudge,
  onTryAnother,
  onClose,
  onNudgeLike,
  isLiked
}: MoreNudgesSectionProps) {
  return (
    <motion.div
      key="more-nudges"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="joy-card p-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-2">
          What's next?
        </h2>
        <p className="text-joy-steel-blue font-lato">
          Try another nudge to keep the momentum going!
        </p>
      </div>

      <AnimatePresence>
        {loadingAiNudges ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <RefreshCw className="animate-spin text-joy-coral mr-2" size={20} />
            <span className="text-joy-steel-blue font-lato">Creating personalized nudges...</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 mb-6"
          >
            {aiNudges.map((nudge, index) => (
              <motion.div
                key={nudge.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-joy-light-blue/30 rounded-lg p-4 hover:bg-joy-light-blue/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-joy-coral" size={16} />
                    <h3 className="font-nunito font-semibold text-joy-dark-blue">{nudge.title}</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onNudgeLike(nudge)}
                    className={`p-1 rounded-full transition-colors ${
                      isLiked(nudge.id?.toString()) 
                        ? 'text-red-500' 
                        : 'text-joy-steel-blue hover:text-red-400'
                    }`}
                  >
                    <Heart size={16} fill={isLiked(nudge.id?.toString()) ? 'currentColor' : 'none'} />
                  </motion.button>
                </div>
                <p className="text-joy-steel-blue font-lato text-sm mb-3">{nudge.description}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTryAiNudge(nudge)}
                  className="joy-button-primary text-sm px-4 py-2"
                >
                  Try This Nudge
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTryAnother}
          className="joy-button-secondary flex-1"
        >
          Try Another Classic
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="joy-button-primary flex-1"
        >
          I'm Done for Now
        </motion.button>
      </div>
    </motion.div>
  );
}
