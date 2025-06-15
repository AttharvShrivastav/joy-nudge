
import { motion } from "framer-motion";
import PixelAvatar from "../PixelAvatar";

interface HomeHeaderProps {
  username: string;
  onAvatarClick?: () => void;
}

export default function HomeHeader({ username, onAvatarClick }: HomeHeaderProps) {
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
      {/* Header with only Avatar on the right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-start mb-6"
      >
        <div />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="z-30"
        >
          <PixelAvatar size="md" onClick={onAvatarClick} />
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
