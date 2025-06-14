
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface GardenData {
  todaysMood: string | null;
  todaysAiNudge: any | null;
  loading: boolean;
}

export function useGardenData() {
  const [gardenData, setGardenData] = useState<GardenData>({
    todaysMood: null,
    todaysAiNudge: null,
    loading: true
  });
  const { user } = useAuth();

  const fetchGardenData = async () => {
    if (!user) {
      setGardenData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's mood
      const { data: moodData, error: moodError } = await supabase
        .from('mood_logs')
        .select('mood_value')
        .eq('user_id', user.id)
        .gte('timestamp', `${today}T00:00:00`)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (moodError) {
        console.error('Error fetching mood data:', moodError);
      }

      // Fetch today's AI nudge
      const { data: nudgeData, error: nudgeError } = await supabase
        .from('nudges')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_ai_generated', true)
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (nudgeError) {
        console.error('Error fetching nudge data:', nudgeError);
      }

      setGardenData({
        todaysMood: moodData?.[0]?.mood_value || null,
        todaysAiNudge: nudgeData?.[0] || null,
        loading: false
      });
    } catch (error) {
      console.error('Error in fetchGardenData:', error);
      setGardenData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchGardenData();
  }, [user]);

  return {
    gardenData,
    refreshGardenData: fetchGardenData
  };
}
