
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PixelAvatarProps {
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function PixelAvatar({ onClick, size = "md" }: PixelAvatarProps) {
  const { user } = useAuth();
  
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const iconSize = {
    sm: 20,
    md: 24,
    lg: 32
  };

  if (!user) return null;

  // Create a pixelated character based on user ID
  const getPixelCharacter = () => {
    if (!user?.id) return "😊";
    
    const characters = ["😊", "🌟", "🎨", "🌸", "🦋", "🍀", "💎", "🌈"];
    const index = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % characters.length;
    return characters[index];
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-lg border-2 border-white/50 relative overflow-hidden`}
      style={{
        background: `
          conic-gradient(from 45deg, #f28b82, #a8dadc, #457b9d, #f28b82),
          linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.1) 100%)
        `,
        imageRendering: 'pixelated',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3)'
      }}
    >
      {/* Pixelated grid overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '4px 4px'
        }}
      />
      
      {/* Character or fallback icon */}
      <div className="relative z-10 text-center">
        {user?.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Avatar"
            className="w-full h-full object-cover rounded-md"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : user?.user_metadata?.username ? (
          <span className="text-lg font-bold text-white drop-shadow-sm">
            {getPixelCharacter()}
          </span>
        ) : (
          <User size={iconSize[size]} className="text-white drop-shadow-sm" />
        )}
      </div>
      
      {/* Pixelated border effect */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 3px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.1) 2px,
              rgba(255,255,255,0.1) 3px
            )
          `
        }}
      />
    </button>
  );
}
