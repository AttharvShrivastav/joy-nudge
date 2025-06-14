
import { motion } from "framer-motion";

const AnimatedButton = ({
  onClick,
  text,
  rounded = false,
}: {
  onClick?: () => void;
  text: string;
  rounded?: boolean;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    onClick={onClick}
    className={`w-full bg-joy-coral text-white py-2.5 px-4 ${rounded ? "rounded-full" : "rounded-lg"} font-fredoka font-semibold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-sm`}
  >
    {text}
  </motion.button>
);

export default AnimatedButton;
