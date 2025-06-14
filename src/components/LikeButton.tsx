
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useNudgeLikes } from "@/hooks/useNudgeLikes";

interface LikeButtonProps {
  nudgeId: string;
  nudgeData?: any;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LikeButton({ nudgeId, nudgeData, size = "md", className = "" }: LikeButtonProps) {
  const { toggleLike, isLiked, loading } = useNudgeLikes();
  const liked = isLiked(nudgeId);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10"
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loading) {
      toggleLike(nudgeId, nudgeData);
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      disabled={loading}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`
        ${sizeClasses[size]} 
        flex items-center justify-center rounded-full
        ${liked 
          ? 'bg-joy-coral/20 text-joy-coral' 
          : 'bg-joy-light-blue/10 text-joy-steel-blue hover:bg-joy-light-blue/20'
        }
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <motion.div
        animate={liked ? {
          scale: [1, 1.3, 1],
          rotate: [0, 15, -15, 0]
        } : {}}
        transition={{ duration: 0.6 }}
      >
        <Heart
          size={iconSizes[size]}
          className={`transition-all duration-300 ${
            liked ? 'fill-current' : 'fill-none'
          }`}
        />
      </motion.div>
    </motion.button>
  );
}
