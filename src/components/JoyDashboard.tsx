
import { useState } from "react";
import JoyIcon from "./JoyIcon";
import AnimatedButton from "./AnimatedButton";
import Celebration from "./Celebration";
import { motion, AnimatePresence } from "framer-motion";

const prompts = [
  { nudge: "Take 3 deep breaths 🌬️", affirmation: "Well done! Calm in, calm out." },
  { nudge: "List 1 thing you're grateful for 💛", affirmation: "Wonderful! Joy grows brighter." },
  { nudge: "Stretch for 1 minute 🤸", affirmation: "Nicely done! A gentle body, a joyful soul." },
  { nudge: "Send a kind text 📩", affirmation: "You made someone's day sweeter!" },
  { nudge: "Smile at a stranger 😊", affirmation: "Bravo! Your joy is contagious." }
];

export default function JoyDashboard() {
  const [celebrating, setCelebrating] = useState(false);
  const [affirm, setAffirm] = useState("");
  const [idx, setIdx] = useState(0);

  const completeNudge = () => {
    setCelebrating(true);
    setAffirm(prompts[idx].affirmation);
    setTimeout(() => {
      setCelebrating(false);
      setAffirm("");
      setIdx(i => (i+1) % prompts.length);
    }, 1700);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Celebration show={celebrating} />
      <AnimatePresence>
        {!celebrating && (
          <motion.div
            key={idx}
            initial={{ y: 30, opacity: 0.4 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 48 }}
            className="bg-white/90 px-6 py-10 rounded-3xl shadow-joy border border-peach/20 flex flex-col items-center"
          >
            <JoyIcon size={56} />
            <h2 className="font-nunito text-2xl mt-2 mb-4 text-heading font-semibold">
              {prompts[idx].nudge}
            </h2>
            <AnimatedButton onClick={completeNudge} text="Complete Nudge" rounded />
          </motion.div>
        )}
        {celebrating && (
          <motion.div
            key="affirm"
            initial={{ opacity: 0, scale: 0.91 }}
            animate={{ opacity: 1, scale: 1.03 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="absolute inset-0 flex flex-col justify-center items-center"
          >
            <div className="joy-script text-accent text-[2.2rem] drop-shadow text-center shadow-peach mt-10 animate-pulse">
              {affirm}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
