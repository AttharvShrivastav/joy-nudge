
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PlantData {
  id: number;
  name: string;
  emoji: string;
  unlocked: boolean;
  progress: number;
  x: number;
  y: number;
  level: number;
  requirements: {
    nudgeCompletions: number;
    streakDays?: number;
    focusSessions?: number;
  };
}

export function useGardenAchievements() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAchievementData = async () => {
      try {
        setLoading(true);

        // Fetch nudge completions count
        const { data: completions, error: completionsError } = await supabase
          .from('nudge_completions')
          .select('id')
          .eq('user_id', user.id);

        if (completionsError) throw completionsError;

        // Fetch user streak data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('current_streak_days, longest_streak_days')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        // Fetch focus sessions count
        const { data: focusData, error: focusError } = await supabase
          .from('focus_sessions')
          .select('id')
          .eq('user_id', user.id);

        if (focusError) throw focusError;

        const totalNudges = completions?.length || 0;
        const currentStreak = userData?.current_streak_days || 0;
        const longestStreak = userData?.longest_streak_days || 0;
        const focusSessions = focusData?.length || 0;

        // Define plants with their unlock requirements
        const plantDefinitions: PlantData[] = [
          {
            id: 1,
            name: "Mindfulness Moss",
            emoji: "🌱",
            x: 20,
            y: 60,
            unlocked: false,
            progress: 0,
            level: 0,
            requirements: { nudgeCompletions: 1 }
          },
          {
            id: 2,
            name: "Gratitude Grass",
            emoji: "🌿",
            x: 40,
            y: 80,
            unlocked: false,
            progress: 0,
            level: 0,
            requirements: { nudgeCompletions: 5 }
          },
          {
            id: 3,
            name: "Joy Jasmine",
            emoji: "🌸",
            x: 70,
            y: 50,
            unlocked: false,
            progress: 0,
            level: 0,
            requirements: { nudgeCompletions: 10, streakDays: 3 }
          },
          {
            id: 4,
            name: "Calm Chrysanthemum",
            emoji: "🌼",
            x: 30,
            y: 30,
            unlocked: false,
            progress: 0,
            level: 0,
            requirements: { nudgeCompletions: 15, focusSessions: 5 }
          },
          {
            id: 5,
            name: "Energy Eucalyptus",
            emoji: "🌳",
            x: 80,
            y: 75,
            unlocked: false,
            progress: 0,
            level: 0,
            requirements: { nudgeCompletions: 25, streakDays: 7 }
          },
          {
            id: 6,
            name: "Peace Peony",
            emoji: "🌺",
            x: 60,
            y: 20,
            unlocked: false,
            progress: 0,
            level: 0,
            requirements: { nudgeCompletions: 50, streakDays: 14, focusSessions: 10 }
          },
        ];

        // Calculate unlock status and progress for each plant
        const updatedPlants = plantDefinitions.map(plant => {
          const meetsNudgeReq = totalNudges >= plant.requirements.nudgeCompletions;
          const meetsStreakReq = !plant.requirements.streakDays || Math.max(currentStreak, longestStreak) >= plant.requirements.streakDays;
          const meetsFocusReq = !plant.requirements.focusSessions || focusSessions >= plant.requirements.focusSessions;
          
          const unlocked = meetsNudgeReq && meetsStreakReq && meetsFocusReq;
          
          // Calculate progress towards next level
          const excessNudges = Math.max(0, totalNudges - plant.requirements.nudgeCompletions);
          const level = unlocked ? Math.floor(excessNudges / 10) + 1 : 0; // Level up every 10 completions
          const progress = unlocked ? ((excessNudges % 10) / 10) * 100 : 0;

          return {
            ...plant,
            unlocked,
            progress,
            level: Math.min(level, 5) // Max level 5
          };
        });

        setPlants(updatedPlants);

      } catch (error) {
        console.error('Error fetching garden achievement data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievementData();
  }, [user]);

  const unlockedPlantsCount = plants.filter(plant => plant.unlocked).length;
  const totalNudgesCompleted = plants.reduce((sum, plant) => 
    plant.unlocked ? plant.requirements.nudgeCompletions : 0, 0
  );

  return {
    plants,
    unlockedPlantsCount,
    totalNudgesCompleted,
    loading
  };
}
