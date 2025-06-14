
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

  if (!user) return null;

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-joy-coral to-joy-steel-blue flex items-center justify-center hover:scale-105 transition-transform pixelated-border`}
      style={{
        imageRendering: 'pixelated'
      }}
    >
      <User size={size === "sm" ? 16 : size === "md" ? 20 : 24} className="text-white" />
    </button>
  );
}
