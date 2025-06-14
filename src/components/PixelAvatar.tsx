
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PixelAvatarProps {
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const DEFAULT_AVATAR = "https://huowfziyvqqnoozdsuaw.supabase.co/storage/v1/object/public/default_avatars/avatar_1.png";

export default function PixelAvatar({ onClick, size = "md" }: PixelAvatarProps) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(true);
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  };

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('selected_avatar_url')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setAvatarUrl(data?.selected_avatar_url || DEFAULT_AVATAR);
      } catch (error) {
        console.error('Error fetching user avatar:', error);
        setAvatarUrl(DEFAULT_AVATAR);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAvatar();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center bg-joy-light-blue/20 border-2 border-joy-steel-blue/30 animate-pulse`}
      />
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center hover:scale-105 transition-all duration-200 relative overflow-hidden border-2 border-joy-steel-blue/30 bg-white shadow-sm`}
      style={{
        imageRendering: 'pixelated',
      }}
    >
      {/* Pixelated grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(69,123,157,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(69,123,157,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '3px 3px'
        }}
      />
      
      {/* Avatar image or fallback icon */}
      <div className="relative z-10 w-full h-full">
        <img 
          src={avatarUrl}
          alt="User Avatar"
          className="w-full h-full object-cover rounded-md"
          style={{ imageRendering: 'pixelated', filter: 'contrast(1.1) saturate(1.2)' }}
          onError={() => {
            // Fallback to icon if image fails to load
            setAvatarUrl("");
          }}
        />
        {!avatarUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="text-joy-steel-blue" size={iconSize[size]} />
          </div>
        )}
      </div>
    </button>
  );
}
