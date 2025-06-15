
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
  completionsNeeded: number;
  currentCompletions: number;
  requirements: {
    nudgeCompletions: number;
    streakDays?: number;
    focusSessions?: number;
  };
}

export function useGardenAchievements() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<PlantData[]>([]);
  const [totalCompletions, setTotalCompletions] = useState(0);
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

        setTotalCompletions(totalNudges);

        // Enhanced plant definitions that scale with completed nudges
        const plantDefinitions: PlantData[] = [
          {
            id: 1,
            name: "Mindfulness Seedling",
            emoji: "🌱",
            x: 20,
            y: 60,
            unlocked: false,
            progress: 0,
            level: 0,
            completionsNeeded: 1,
            currentCompletions: totalNudges,
            requirements: { nudgeCompletions: 1 }
          },
          {
            id: 2,
            name: "Gratitude Sprout",
            emoji: "🌿",
            x: 40,
            y: 80,
            unlocked: false,
            progress: 0,
            level: 0,
            completionsNeeded: 3,
            currentCompletions: totalNudges,
            requirements: { nudgeCompletions: 3 }
          },
          {
            id: 3,
            name: "Joy Bud",
            emoji: "🌸",
            x: 70,
            y: 50,
            unlocked: false,
            progress: 0,
            level: 0,
            completionsNeeded: 5,
            currentCompletions: totalNudges,
            requirements: { nudgeCompletions: 5, streakDays: 3 }
          },
          {
            id: 4,
            name: "Calm Flower",
            emoji: "🌼",
            x: 30,
            y: 30,
            unlocked: false,
            progress: 0,
            level: 0,
            completionsNeeded: 8,
            currentCompletions: totalNudges,
            requirements: { nudgeCompletions: 8, focusSessions: 3 }
          },
          {
            id: 5,
            name: "Wisdom Bloom",
            emoji: "🌺",
            x: 60,
            y: 20,
            unlocked: false,
            progress: 0,
            level: 0,
            completionsNeeded: 12,
            currentCompletions: totalNudges,
            requirements: { nudgeCompletions: 12, streakDays: 5 }
          },
          {
            id: 6,
            name: "Energy Tree",
            emoji: "🌳",
            x: 80,
            y: 75,
            unlocked: false,
            progress: 0,
            level: 0,
            completionsNeeded: 15,
            currentCompletions: totalNudges,
            requirements: { nudgeCompletions: 15, streakDays: 7 }
          },
          {
            id: 7,
            name: "Peace Garden",
            emoji: "🌻",
            x: 50,
            y: 10,
            unlocked: false,
            progress: 0,
            level: 0,
            completionsNeeded: 20,
            currentCompletions: totalNudges,
            requirements: { nudgeCompletions: 20, streakDays: 10, focusSessions: 8 }
          },
          {
            id: 8,
            name: "Harmony Grove",
            emoji: "🌴",
            x: 15,
            y: 45,
            unlocked: false,
            progress: 0,
            level: 0,
            completionsNeeded: 25,
            currentCompletions: totalNudges,
            requirements: { nudgeCompletions: 25, streakDays: 14, focusSessions: 12 }
          }
        ];

        // Calculate unlock status and progress for each plant
        const updatedPlants = plantDefinitions.map(plant => {
          const meetsNudgeReq = totalNudges >= plant.requirements.nudgeCompletions;
          const meetsStreakReq = !plant.requirements.streakDays || Math.max(currentStreak, longestStreak) >= plant.requirements.streakDays;
          const meetsFocusReq = !plant.requirements.focusSessions || focusSessions >= plant.requirements.focusSessions;
          
          const unlocked = meetsNudgeReq && meetsStreakReq && meetsFocusReq;
          
          // Calculate progress and level based on total completions beyond requirements
          let progress = 0;
          let level = 0;
          
          if (unlocked) {
            const excessNudges = Math.max(0, totalNudges - plant.requirements.nudgeCompletions);
            level = Math.floor(excessNudges / 5) + 1; // Level up every 5 completions
            progress = ((excessNudges % 5) / 5) * 100;
          } else if (totalNudges > 0) {
            // Show progress toward unlocking
            progress = Math.min((totalNudges / plant.requirements.nudgeCompletions) * 100, 95);
          }

          return {
            ...plant,
            unlocked,
            progress,
            level: Math.min(level, 10) // Max level 10
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
  const totalPlantLevels = plants.reduce((sum, plant) => sum + plant.level, 0);

  return {
    plants,
    unlockedPlantsCount,
    totalCompletions,
    totalPlantLevels,
    loading
  };
}
