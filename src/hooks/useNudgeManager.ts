
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getRandomFallbackNudge } from "@/data/fallbackNudges";
import { prompts, breathingNudge } from "@/data/defaultNudges";
import { useNudgeLikes } from "./useNudgeLikes";

export const useNudgeManager = (user: any, currentMood: string) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { toast } = useToast();
  const { getNextQueuedNudge, removeFromQueue } = useNudgeLikes();

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
  }, [isFirstTime, getNextQueuedNudge]);

  const currentPrompt = isFirstTime ? breathingNudge : prompts[currentPromptIndex];

  const generateAiNudge = async (context: string, skipCategory?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-nudge', {
        body: {
          context,
          current_mood: currentMood,
          skip_category: skipCategory
        }
      });

      if (error) throw error;
      
      if (data?.nudge) {
        const aiPrompt = {
          id: data.nudge.id,
          nudge: data.nudge.title,
          description: data.nudge.description,
          affirmation: "Wonderful! Thank you for trying this personalized nudge.",
          type: data.nudge.interactive_type?.toLowerCase() || "reflective",
          interactive_type: data.nudge.interactive_type
        };
        
        const newIndex = prompts.length;
        prompts.push(aiPrompt);
        setCurrentPromptIndex(newIndex);
        return true;
      }
    } catch (error) {
      console.error('Error generating AI nudge:', error);
      return false;
    }
    return false;
  };

  const handleSkip = async () => {
    if (isFirstTime) {
      localStorage.setItem('hasSeenBreathingNudge', 'true');
      setIsFirstTime(false);
    }
    
    removeFromQueue(currentPrompt.id.toString());
    
    // Generate AI nudge when skipping
    const success = await generateAiNudge('user_skipped_nudge', currentPrompt.type);
    
    if (!success) {
      // Fallback to next nudge
      setCurrentPromptIndex(prev => (prev + 1) % prompts.length);
    }
  };

  const handleComplete = async () => {
    if (isFirstTime) {
      localStorage.setItem('hasSeenBreathingNudge', 'true');
      setIsFirstTime(false);
    }
    
    removeFromQueue(currentPrompt.id.toString());
    
    // Store nudge completion
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

        const existingCompletions = JSON.parse(localStorage.getItem('nudgeCompletions') || '[]');
        existingCompletions.push(completionData);
        localStorage.setItem('nudgeCompletions', JSON.stringify(existingCompletions));

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
  };

  return {
    currentPrompt,
    isFirstTime,
    handleSkip,
    handleComplete,
    setCurrentPromptIndex
  };
};
