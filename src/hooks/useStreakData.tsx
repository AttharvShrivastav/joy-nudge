
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface StreakData {
  current_streak_days: number;
  longest_streak_days: number;
  last_streak_update_date: string | null;
}

export function useStreakData() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStreakData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('current_streak_days, longest_streak_days, last_streak_update_date')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching streak data:', error);
      } else {
        setStreakData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreakData();
  }, [user]);

  const updateStreak = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('update-streak');
      
      if (error) {
        console.error('Error updating streak:', error);
        return null;
      }

      // Refresh streak data after update
      await fetchStreakData();
      
      return data;
    } catch (error) {
      console.error('Error invoking update-streak function:', error);
      return null;
    }
  };

  return {
    streakData,
    loading,
    updateStreak,
    refreshStreakData: fetchStreakData
  };
}
