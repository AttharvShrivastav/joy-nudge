
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useNudgeLikes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likedNudges, setLikedNudges] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load liked nudges from localStorage
    const stored = localStorage.getItem('likedNudges');
    if (stored) {
      setLikedNudges(new Set(JSON.parse(stored)));
    }
  }, []);

  const toggleLike = async (nudgeId: string, nudgeData?: any) => {
    const isCurrentlyLiked = likedNudges.has(nudgeId);
    const newLikedNudges = new Set(likedNudges);

    if (isCurrentlyLiked) {
      newLikedNudges.delete(nudgeId);
      toast({
        title: "Removed from favorites",
        description: "We'll adjust future recommendations accordingly."
      });
    } else {
      newLikedNudges.add(nudgeId);
      toast({
        title: "Added to favorites! ❤️",
        description: "We'll suggest more nudges like this one."
      });

      // Store preference data for AI learning
      if (user && nudgeData) {
        try {
          const preferenceData = {
            user_id: user.id,
            nudge_id: nudgeData.id,
            category: nudgeData.category,
            interactive_type: nudgeData.interactive_type,
            liked_at: new Date().toISOString(),
            context: {
              time_of_day: new Date().getHours(),
              title: nudgeData.title,
              description: nudgeData.description
            }
          };

          // Store in localStorage for immediate use
          const existingPreferences = JSON.parse(localStorage.getItem('nudgePreferences') || '[]');
          existingPreferences.push(preferenceData);
          localStorage.setItem('nudgePreferences', JSON.stringify(existingPreferences));

          console.log('Stored nudge preference:', preferenceData);
        } catch (error) {
          console.error('Error storing nudge preference:', error);
        }
      }
    }

    setLikedNudges(newLikedNudges);
    localStorage.setItem('likedNudges', JSON.stringify([...newLikedNudges]));
  };

  const isLiked = (nudgeId: string) => likedNudges.has(nudgeId);

  return { toggleLike, isLiked, likedNudges };
}
