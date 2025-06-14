
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useGardenData() {
  const { user } = useAuth();
  const [gardenData, setGardenData] = useState({
    totalNudges: 0,
    plantsUnlocked: 0,
    todaysMood: null as string | null,
    achievements: [] as any[],
    reflections: [] as any[],
    streakMilestones: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchGardenData = async () => {
      try {
        setLoading(true);

        // Fetch nudge completions count
        const { data: completions, error: completionsError } = await supabase
          .from('nudge_completions')
          .select('id')
          .eq('user_id', user.id);

        if (completionsError) throw completionsError;

        // Fetch today's mood
        const today = new Date().toISOString().split('T')[0];
        const { data: todayMood, error: moodError } = await supabase
          .from('mood_logs')
          .select('mood_value')
          .eq('user_id', user.id)
          .gte('timestamp', today)
          .order('timestamp', { ascending: false })
          .limit(1);

        if (moodError) throw moodError;

        // Fetch reflections
        const { data: reflections, error: reflectionsError } = await supabase
          .from('reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (reflectionsError) throw reflectionsError;

        // Calculate plants unlocked based on completions
        const totalNudges = completions?.length || 0;
        const plantsUnlocked = Math.min(Math.floor(totalNudges / 3) + 1, 6); // Unlock 1 plant per 3 nudges, max 6

        // Generate achievements based on actual data
        const achievements = [];
        if (totalNudges >= 1) achievements.push({ id: 1, title: "First Steps", description: "Completed your first nudge", unlocked: true });
        if (totalNudges >= 5) achievements.push({ id: 2, title: "Getting Started", description: "Completed 5 nudges", unlocked: true });
        if (totalNudges >= 10) achievements.push({ id: 3, title: "Building Momentum", description: "Completed 10 nudges", unlocked: true });
        if (totalNudges >= 25) achievements.push({ id: 4, title: "Joy Master", description: "Completed 25 nudges", unlocked: true });

        // Add locked achievements
        if (totalNudges < 50) achievements.push({ id: 5, title: "Zen Master", description: "Complete 50 nudges", unlocked: false });
        if (totalNudges < 100) achievements.push({ id: 6, title: "Joy Legend", description: "Complete 100 nudges", unlocked: false });

        setGardenData({
          totalNudges,
          plantsUnlocked,
          todaysMood: todayMood?.[0]?.mood_value || null,
          achievements,
          reflections: reflections || [],
          streakMilestones: [] // Will be populated from streak data
        });

      } catch (error) {
        console.error('Error fetching garden data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGardenData();
  }, [user]);

  return { gardenData, loading };
}
