
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

// Default avatar URLs from our Supabase storage
const DEFAULT_AVATARS = [
  "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_1.png",
  "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_2.png", 
  "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_3.png",
  "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_4.png",
  "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_5.png",
  "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_6.png",
  "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_7.png",
  "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_8.png"
];

interface AvatarSelectorProps {
  onClose?: () => void;
  inSettings?: boolean;
}

export default function AvatarSelector({ onClose, inSettings = false }: AvatarSelectorProps) {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [currentAvatar, setCurrentAvatar] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentAvatar = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('selected_avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        const avatarUrl = data?.selected_avatar_url || DEFAULT_AVATARS[0];
        setCurrentAvatar(avatarUrl);
        setSelectedAvatar(avatarUrl);
      } catch (error) {
        console.error('Error fetching current avatar:', error);
        setCurrentAvatar(DEFAULT_AVATARS[0]);
        setSelectedAvatar(DEFAULT_AVATARS[0]);
      }
    };

    fetchCurrentAvatar();
  }, [user]);

  const handleSaveAvatar = async () => {
    if (!user || !selectedAvatar) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ selected_avatar_url: selectedAvatar })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setCurrentAvatar(selectedAvatar);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = selectedAvatar !== currentAvatar;

  if (inSettings) {
    return (
      <div className="joy-card p-6 mb-6">
        <h3 className="font-nunito font-semibold text-joy-dark-blue text-lg mb-4">
          Choose Your Avatar
        </h3>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          {DEFAULT_AVATARS.map((avatarUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedAvatar(avatarUrl)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                selectedAvatar === avatarUrl
                  ? 'border-joy-steel-blue bg-joy-light-blue/20 scale-105'
                  : 'border-joy-light-blue/30 hover:border-joy-steel-blue/50'
              }`}
              style={{ imageRendering: 'pixelated' }}
            >
              <img
                src={avatarUrl}
                alt={`Avatar ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full bg-joy-light-blue/30 flex items-center justify-center text-joy-steel-blue font-bold">${index + 1}</div>`;
                  }
                }}
              />
              {selectedAvatar === avatarUrl && (
                <div className="absolute inset-0 bg-joy-steel-blue/20 flex items-center justify-center">
                  <Check className="text-joy-steel-blue" size={20} />
                </div>
              )}
            </button>
          ))}
        </div>
        
        {hasChanges && (
          <Button
            onClick={handleSaveAvatar}
            disabled={loading}
            className="joy-button-primary w-full"
          >
            {loading ? 'Saving...' : 'Save Avatar'}
          </Button>
        )}
      </div>
    );
  }

  // Modal version for other contexts
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="joy-card w-full max-w-md p-6">
        <h2 className="font-nunito font-bold text-joy-dark-blue text-xl mb-4 text-center">
          Choose Your Avatar
        </h2>
        
        <div className="grid grid-cols-4 gap-3 mb-6">
          {DEFAULT_AVATARS.map((avatarUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedAvatar(avatarUrl)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                selectedAvatar === avatarUrl
                  ? 'border-joy-steel-blue bg-joy-light-blue/20 scale-105'
                  : 'border-joy-light-blue/30 hover:border-joy-steel-blue/50'
              }`}
              style={{ imageRendering: 'pixelated' }}
            >
              <img
                src={avatarUrl}
                alt={`Avatar ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full bg-joy-light-blue/30 flex items-center justify-center text-joy-steel-blue font-bold">${index + 1}</div>`;
                  }
                }}
              />
              {selectedAvatar === avatarUrl && (
                <div className="absolute inset-0 bg-joy-steel-blue/20 flex items-center justify-center">
                  <Check className="text-joy-steel-blue" size={20} />
                </div>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAvatar}
            disabled={loading || !hasChanges}
            className="joy-button-primary flex-1"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
