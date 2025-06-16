
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getRandomFallbackNudge } from "@/data/fallbackNudges";

export const useAiNudges = (currentMood: string) => {
  const [aiNudges, setAiNudges] = useState<any[]>([]);
  const [loadingAiNudges, setLoadingAiNudges] = useState(false);

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

  return {
    aiNudges,
    loadingAiNudges,
    generateMoreNudges
  };
};
