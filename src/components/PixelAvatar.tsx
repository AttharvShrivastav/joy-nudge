
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

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center hover:scale-105 transition-all duration-200 relative overflow-hidden border-2 border-joy-steel-blue/30 bg-gradient-to-br from-joy-light-blue/30 to-joy-powder-blue/30 shadow-sm`}
      style={{
        imageRendering: 'pixelated',
      }}
    >
      {/* Pixelated grid overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(69,123,157,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(69,123,157,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '3px 3px'
        }}
      />
      
      {/* Placeholder avatar content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <User className="text-joy-steel-blue" size={iconSize[size]} />
      </div>
    </button>
  );
}
