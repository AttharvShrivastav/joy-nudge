
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
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32
  };

  if (!user) return null;

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-joy-coral via-joy-steel-blue to-joy-dark-blue flex items-center justify-center hover:scale-105 transition-transform shadow-lg border-2 border-white`}
      style={{
        imageRendering: 'pixelated',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3)'
      }}
    >
      <User size={iconSize[size]} className="text-white drop-shadow-sm" />
    </button>
  );
}
