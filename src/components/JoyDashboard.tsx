
import { useState } from "react";
import JoyIcon from "./JoyIcon";
import AnimatedButton from "./AnimatedButton";
import Celebration from "./Celebration";
import { motion, AnimatePresence } from "framer-motion";
import NudgeTimer from "./NudgeTimer";
import BreatheGuide from "./BreatheGuide";

// Updated prompts with types, descriptions, and interactivity
const prompts = [
  {
    nudge: "Take 3 deep breaths 🌬️",
    description: "Relax your mind and body. Follow the animated breathing guide below – inhale, hold, and exhale three times.",
    affirmation: "Well done! Calm in, calm out.",
    type: "breathe"
  },
  {
    nudge: "List 1 thing you're grateful for 💛",
    description: "Pause and notice something positive in your life. Let gratitude warm your heart!",
    affirmation: "Wonderful! Joy grows brighter.",
    type: "none"
  },
  {
    nudge: "Stretch for 1 minute 🤸",
    description: "Do gentle stretches – touch your toes, reach for the sky, or any movement that feels good. The 1 minute timer will keep you on track.",
    affirmation: "Nicely done! A gentle body, a joyful soul.",
    type: "timer"
  },
  {
    nudge: "Send a kind text 📩",
    description: "Think of someone who could use a bit of encouragement or gratitude. Send them a sweet message.",
    affirmation: "You made someone's day sweeter!",
    type: "none"
  },
  {
    nudge: "Smile at a stranger 😊",
    description: "Share a genuine smile with someone you don't know. Notice how this small act can lift both your spirits!",
    affirmation: "Bravo! Your joy is contagious.",
    type: "none"
  },
];

type NudgeType = "breathe" | "timer" | "none";

export default function JoyDashboard() {
  const [celebrating, setCelebrating] = useState(false);
  const [affirm, setAffirm] = useState("");
  const [idx, setIdx] = useState(0);
  const [doing, setDoing] = useState(false);

  const current = prompts[idx];

  // Main button: triggers "do" state for interactive nudges, otherwise completes immediately
  const startNudge = () => {
    if (current.type === "breathe" || current.type === "timer") {
      setDoing(true);
    } else {
      completeNudge();
    }
  };

  // When an interactive nudge is completed
  const interactiveDone = () => {
    setDoing(false);
    setTimeout(() => completeNudge(), 500);
  };

  // Once nudge is complete (including interaction if relevant)
  const completeNudge = () => {
    setCelebrating(true);
    setAffirm(current.affirmation);
    setTimeout(() => {
      setCelebrating(false);
      setAffirm("");
      setIdx(i => (i + 1) % prompts.length);
      setDoing(false);
    }, 1700);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Celebration show={celebrating} />
      <AnimatePresence>
        {!celebrating && (
          <motion.div
            key={idx + ":" + (doing ? "do" : "idle")}
            initial={{ y: 30, opacity: 0.4 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 48 }}
            className="bg-white/90 px-6 py-10 rounded-3xl shadow-joy border border-peach/20 flex flex-col items-center"
          >
            <JoyIcon size={56} />
            <h2 className="font-nunito text-2xl mt-2 mb-3 text-heading font-semibold text-center">
              {current.nudge}
            </h2>
            <div className="mb-6 text-gray-800 font-lato text-center">{current.description}</div>
            {!doing ? (
              <AnimatedButton onClick={startNudge} text="Complete Nudge" rounded />
            ) : (
              <div className="w-full flex flex-col items-center">
                {current.type === "timer" && <NudgeTimer duration={60} onComplete={interactiveDone} />}
                {current.type === "breathe" && <BreatheGuide onComplete={interactiveDone} />}
              </div>
            )}
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
