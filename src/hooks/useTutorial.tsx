
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useTutorial() {
  const { user } = useAuth();
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkTutorialStatus() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('tutorial_seen')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking tutorial status:', error);
          setLoading(false);
          return;
        }

        // Show tutorial if user hasn't seen it yet
        setShouldShowTutorial(!data?.tutorial_seen);
      } catch (error) {
        console.error('Error in checkTutorialStatus:', error);
      } finally {
        setLoading(false);
      }
    }

    checkTutorialStatus();
  }, [user]);

  const markTutorialComplete = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ tutorial_seen: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error marking tutorial complete:', error);
        return;
      }

      setShouldShowTutorial(false);
    } catch (error) {
      console.error('Error in markTutorialComplete:', error);
    }
  };

  return {
    shouldShowTutorial,
    markTutorialComplete,
    loading
  };
}
