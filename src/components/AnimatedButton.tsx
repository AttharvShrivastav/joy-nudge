
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
    whileHover={{ scale: 1.06, boxShadow: "0 0 18px #FFFACD" }}
    whileTap={{ scale: 0.94 }}
    whileFocus={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 430, damping: 20 }}
    onClick={onClick}
    className={`bg-peach/90 font-nunito text-lg font-bold text-gray-900 px-7 py-3 ${rounded ? "rounded-full" : "rounded-2xl"} shadow-joy focus:ring-4 ring-lemon ring-opacity-60 outline-none
      active:opacity-95 cursor-pointer relative transition-all`}
    style={{
      animation: "button-glow 2.2s infinite",
    }}
  >
    {text}
  </motion.button>
);

export default AnimatedButton;
