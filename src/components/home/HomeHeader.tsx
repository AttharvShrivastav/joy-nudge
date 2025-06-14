
import { motion } from "framer-motion";
import PixelAvatar from "../PixelAvatar";

interface HomeHeaderProps {
  username: string;
}

export default function HomeHeader({ username }: HomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    let timeGreeting = '';
    if (hour < 12) timeGreeting = "Good Morning";
    else if (hour < 17) timeGreeting = "Good Afternoon";
    else timeGreeting = "Good Evening";
    
    return `${timeGreeting}, ${username}!`;
  };

  return (
    <>
      {/* Header with Logo and Avatar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-start mb-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          <img 
            src="/lovable-uploads/424186e2-de89-4a2a-a690-1d1d0f47bbe8.png" 
            alt="Joy Nudge" 
            className="w-8 h-8 rounded-full"
          />
          <span className="font-nunito text-lg font-semibold text-joy-dark-blue">
            Joy Nudge
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="z-30"
        >
          <PixelAvatar size="md" />
        </motion.div>
      </motion.div>
      
      {/* Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center items-center mb-6"
      >
        <span className="font-nunito text-xl font-semibold text-joy-dark-blue">
          {getGreeting()}
        </span>
      </motion.div>
    </>
  );
}
