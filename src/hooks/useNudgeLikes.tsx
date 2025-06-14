
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useNudgeLikes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likedNudges, setLikedNudges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserLikes();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserLikes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_nudge_likes')
        .select('nudge_id')
        .eq('user_id', user.id)
        .eq('is_liked', true);

      if (error) throw error;

      const likedSet = new Set(data?.map(like => like.nudge_id) || []);
      setLikedNudges(likedSet);
    } catch (error) {
      console.error('Error loading user likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (nudgeId: string, nudgeData?: any) => {
    if (!user) return;

    const isCurrentlyLiked = likedNudges.has(nudgeId);
    const newLikedNudges = new Set(likedNudges);

    if (isCurrentlyLiked) {
      newLikedNudges.delete(nudgeId);
    } else {
      newLikedNudges.add(nudgeId);
    }

    // Optimistic update
    setLikedNudges(newLikedNudges);

    try {
      if (isCurrentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('user_nudge_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('nudge_id', nudgeId);

        if (error) throw error;

        toast({
          title: "Removed from favorites",
          description: "We'll adjust future recommendations accordingly."
        });
      } else {
        // Add like
        const { error } = await supabase
          .from('user_nudge_likes')
          .upsert({
            user_id: user.id,
            nudge_id: nudgeId,
            is_liked: true
          });

        if (error) throw error;

        toast({
          title: "Added to favorites! ❤️",
          description: "We'll suggest more nudges like this one."
        });

        // Store preference data for AI learning
        if (nudgeData) {
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

            // Store in localStorage for immediate use by AI
            const existingPreferences = JSON.parse(localStorage.getItem('nudgePreferences') || '[]');
            existingPreferences.push(preferenceData);
            localStorage.setItem('nudgePreferences', JSON.stringify(existingPreferences));

            console.log('Stored nudge preference:', preferenceData);
          } catch (error) {
            console.error('Error storing nudge preference:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLikedNudges(isCurrentlyLiked ? new Set([...newLikedNudges, nudgeId]) : new Set([...newLikedNudges].filter(id => id !== nudgeId)));
      
      toast({
        title: "Oops!",
        description: "Couldn't update your preference. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isLiked = (nudgeId: string) => likedNudges.has(nudgeId);

  return { toggleLike, isLiked, likedNudges, loading };
}
