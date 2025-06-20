
import { useAuth } from "@/hooks/useAuth";
import { useUserAvatar } from "@/hooks/useUserAvatar";

interface PixelAvatarProps {
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function PixelAvatar({ onClick, size = "md" }: PixelAvatarProps) {
  const { user } = useAuth();
  const { avatarUrl } = useUserAvatar();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  if (!user) return null;

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} rounded-lg overflow-hidden
        flex items-center justify-center
        hover:scale-105 transition-all duration-200 relative
        border-2 border-joy-steel-blue/30
        bg-gradient-to-br from-joy-light-blue/30 to-joy-powder-blue/30 
        shadow-sm
      `}
      style={{
        imageRendering: "pixelated",
      }}
    >
      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(69,123,157,0.32) 1px, transparent 1px),
            linear-gradient(90deg, rgba(69,123,157,0.25) 1px, transparent 1px)
          `,
          backgroundSize: "3px 3px"
        }}
      />
      {/* User's Selected Avatar */}
      <img
        src={avatarUrl}
        alt="User avatar"
        className="w-full h-full object-cover relative z-10 select-none"
        draggable={false}
        style={{
          imageRendering: "pixelated",
        }}
        onError={(e) => {
          // Fallback to default plant image if the selected avatar fails to load
          const target = e.target as HTMLImageElement;
          target.src = "/lovable-uploads/136a06f0-73eb-4900-a90f-bbddb0f13d0c.png";
        }}
      />
    </button>
  );
}
