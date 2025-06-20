
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useUserAvatar() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchUserAvatar = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('selected_avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      const userAvatarUrl = data?.selected_avatar_url;
      if (userAvatarUrl) {
        setAvatarUrl(userAvatarUrl);
      } else {
        // Fallback to default plant image if no avatar is selected
        setAvatarUrl("/lovable-uploads/136a06f0-73eb-4900-a90f-bbddb0f13d0c.png");
      }
    } catch (error) {
      console.error('Error fetching user avatar:', error);
      // Fallback to default plant image on error
      setAvatarUrl("/lovable-uploads/136a06f0-73eb-4900-a90f-bbddb0f13d0c.png");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserAvatar();
  }, [fetchUserAvatar]);

  const updateAvatar = useCallback((newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  }, []);

  return {
    avatarUrl,
    loading,
    refreshAvatar: fetchUserAvatar,
    updateAvatar
  };
}
