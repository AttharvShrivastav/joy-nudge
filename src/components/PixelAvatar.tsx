
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PixelAvatarProps {
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function PixelAvatar({ onClick, size = "md" }: PixelAvatarProps) {
  const { user } = useAuth();
  
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

  if (!user) return null;

  // Create a pixelated character based on user ID
  const getPixelCharacter = () => {
    if (!user?.id) return "👤";
    
    const characters = ["🟦", "🟩", "🟨", "🟪", "🟫", "🟧", "⬜", "🔷"];
    const index = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % characters.length;
    return characters[index];
  };

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
      
      {/* Character or fallback icon */}
      <div className="relative z-10 text-center">
        {user?.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Avatar"
            className="w-full h-full object-cover rounded-md"
            style={{ imageRendering: 'pixelated', filter: 'contrast(1.1) saturate(1.2)' }}
          />
        ) : (
          <div className="text-sm font-bold text-joy-steel-blue">
            {getPixelCharacter()}
          </div>
        )}
      </div>
    </button>
  );
}
