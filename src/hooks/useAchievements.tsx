
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchAchievements();
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Fetch user's streak and completion data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('current_streak_days, longest_streak_days')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }

      // Fetch focus sessions count
      const { data: focusData, error: focusError } = await supabase
        .from('focus_sessions')
        .select('id')
        .eq('user_id', user.id);

      if (focusError) {
        console.error('Error fetching focus sessions:', focusError);
      }

      // Fetch nudge completions count
      const { data: completionData, error: completionError } = await supabase
        .from('nudge_completions')
        .select('id')
        .eq('user_id', user.id);

      if (completionError) {
        console.error('Error fetching completions:', completionError);
      }

      const currentStreak = userData?.current_streak_days || 0;
      const longestStreak = userData?.longest_streak_days || 0;
      const focusSessionsCount = focusData?.length || 0;
      const nudgeCompletionsCount = completionData?.length || 0;

      // Calculate achievements based on real data
      const calculatedAchievements: Achievement[] = [
        {
          id: 'first-nudge',
          name: 'First Nudge',
          description: 'Complete your first joy nudge',
          earned: nudgeCompletionsCount > 0
        },
        {
          id: 'week-warrior',
          name: 'Week Warrior',
          description: '7-day streak',
          earned: currentStreak >= 7 || longestStreak >= 7
        },
        {
          id: 'focus-master',
          name: 'Focus Master',
          description: 'Complete 10 focus sessions',
          earned: focusSessionsCount >= 10
        },
        {
          id: 'mindful-master',
          name: 'Mindful Master',
          description: 'Complete 50 mindfulness nudges',
          earned: nudgeCompletionsCount >= 50
        },
        {
          id: 'streak-legend',
          name: 'Streak Legend',
          description: '30-day streak',
          earned: currentStreak >= 30 || longestStreak >= 30
        }
      ];

      setAchievements(calculatedAchievements);
    } catch (error) {
      console.error('Error calculating achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    achievements,
    loading,
    refreshAchievements: fetchAchievements
  };
}
