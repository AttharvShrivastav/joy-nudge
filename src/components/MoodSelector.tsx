
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface MoodSelectorProps {
  onMoodSelected: (mood: string) => void;
  isVisible: boolean;
}

const moodOptions = [
  { value: "energetic", emoji: "⚡", label: "Energetic", color: "from-yellow-400 to-orange-400" },
  { value: "calm", emoji: "🌊", label: "Calm", color: "from-blue-400 to-cyan-400" },
  { value: "happy", emoji: "😊", label: "Happy", color: "from-green-400 to-emerald-400" },
  { value: "focused", emoji: "🎯", label: "Focused", color: "from-purple-400 to-violet-400" },
  { value: "stressed", emoji: "😰", label: "Stressed", color: "from-red-400 to-pink-400" },
  { value: "tired", emoji: "😴", label: "Tired", color: "from-gray-400 to-slate-400" },
  { value: "creative", emoji: "🎨", label: "Creative", color: "from-pink-400 to-rose-400" },
  { value: "grateful", emoji: "🙏", label: "Grateful", color: "from-amber-400 to-orange-400" },
];

export default function MoodSelector({ onMoodSelected, isVisible }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleMoodSelect = async (mood: string) => {
    if (!user || isSubmitting) return;
    
    setSelectedMood(mood);
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('mood_logs')
        .insert({
          user_id: user.id,
          mood_value: mood,
        });

      if (error) throw error;

      // Smooth transition before closing
      setTimeout(() => {
        onMoodSelected(mood);
      }, 800);

      toast({
        title: "Mood recorded! ✨",
        description: `We'll tailor your experience for when you're feeling ${mood}.`
      });
    } catch (error) {
      console.error('Error saving mood:', error);
      toast({
        title: "Oops!",
        description: "Couldn't save your mood. Let's try again.",
        variant: "destructive"
      });
      setSelectedMood(null);
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 bg-joy-dark-blue/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            type: "spring",
            stiffness: 200
          }}
          className="bg-joy-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-joy-light-blue/20"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-2">
              How are you feeling?
            </h2>
            <p className="text-joy-steel-blue font-lato">
              This helps us personalize your nudges perfectly
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {moodOptions.map((mood, index) => (
              <motion.button
                key={mood.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.1 * index,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
                onClick={() => handleMoodSelect(mood.value)}
                disabled={isSubmitting}
                className={`
                  relative overflow-hidden rounded-2xl p-4 h-20 
                  ${selectedMood === mood.value 
                    ? `bg-gradient-to-br ${mood.color} text-white shadow-lg scale-105` 
                    : 'bg-joy-light-blue/10 hover:bg-joy-light-blue/20 text-joy-dark-blue'
                  }
                  transition-all duration-300 ease-out
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border border-joy-light-blue/20 hover:border-joy-light-blue/40
                `}
              >
                <AnimatePresence>
                  {selectedMood === mood.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                    />
                  )}
                </AnimatePresence>
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <motion.span 
                    animate={selectedMood === mood.value ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-2xl mb-1"
                  >
                    {mood.emoji}
                  </motion.span>
                  <span className="text-sm font-medium font-lato">
                    {mood.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block text-joy-coral text-xl mb-2"
              >
                ⭐
              </motion.div>
              <p className="text-joy-steel-blue font-lato text-sm">
                Creating your perfect nudge experience...
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
