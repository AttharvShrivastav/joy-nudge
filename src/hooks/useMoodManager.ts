
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useMoodManager = (user: any, playSound: (type: string) => void) => {
  const [currentMood, setCurrentMood] = useState<string>('open');
  const { toast } = useToast();

  const handleMoodSelect = async (mood: string) => {
    playSound('mood_select');
    setCurrentMood(mood);
    localStorage.setItem('lastMoodDate', new Date().toDateString());
    localStorage.setItem('currentMood', mood);
    
    try {
      await supabase
        .from('mood_logs')
        .insert({
          user_id: user?.id,
          mood_value: mood,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing mood:', error);
    }
    
    toast({
      title: `Feeling ${mood} today`,
      description: "We'll tailor your nudges to match your mood! ✨"
    });
  };

  return {
    currentMood,
    handleMoodSelect
  };
};
