
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import JoyIcon from "./JoyIcon";
import AnimatedButton from "./AnimatedButton";

const steps = [
  {
    title: "Welcome to Joy Nudge!",
    desc: "Cultivate micro-moments of joy and self-kindness, every day.",
  },
  {
    title: "What kind of joy do you seek?",
    desc: "Pick your focus – you can change anytime.",
    choices: [
      { label: "Calm", color: "mint" },
      { label: "Energy", color: "lemon" },
      { label: "Connection", color: "powder" },
      { label: "Focus", color: "peach" },
      { label: "Gratitude", color: "lavender" }
    ]
  },
  {
    title: "Pick your starter nudge",
    desc: "Which tiny action would bring a smile today?",
    choices: [
      { label: "Take 3 deep breaths", icon: "🌬️" },
      { label: "List 1 thing you're grateful for", icon: "💛" },
      { label: "Stretch for 1 minute", icon: "🤸" },
      { label: "Send a kind text", icon: "📩" },
      { label: "Smile at a stranger", icon: "😊" }
    ]
  },
  {
    title: "Enable gentle reminders?",
    desc: "Let Joy Nudge whisper encouragement, never pressure.",
    choices: [
      { label: "Yes", color: "mint" }, { label: "Maybe later", color: "peach" }
    ]
  },
  {
    title: "Ready for your first moment of joy?",
    desc: "Let’s begin – you can always add/edit nudges later. 🌱"
  }
];

const spring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 32
};

const chipVariants = {
  rest: { scale: 1, opacity: 0.92 },
  hover: { scale: 1.08, opacity: 1, boxShadow: "0 2px 8px 0 rgba(0,0,0,.09)" },
  tap: { scale: 0.95 }
};

const Onboarding = ({ onDone }: { onDone: () => void }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  const current = steps[stepIdx];

  const handleSelect = (val: string) => {
    setAnswers((a: any) => ({ ...a, [stepIdx]: val }));
    setTimeout(() => setStepIdx(idx => idx+1), 400);
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl px-6 py-7 bg-white/80 shadow-joy backdrop-blur-md border border-peach/30 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIdx}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={spring}
        >
          <div className="flex flex-col items-center gap-2 mb-2">
            {stepIdx === 0 && (
              <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} className="mb-2">
                <JoyIcon size={64} />
              </motion.div>
            )}
            <h1 className="text-3xl font-nunito font-bold text-heading drop-shadow-sm mb-1">
              {current.title}
            </h1>
            <p className="text-lg font-lato mb-4 text-gray-800">{current.desc}</p>
          </div>
          {/* Step choices */}
          {current.choices && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {current.choices.map((choice: any) => (
                <motion.button
                  key={choice.label}
                  whileHover="hover"
                  whileTap="tap"
                  variants={chipVariants}
                  initial="rest"
                  animate="rest"
                  className={`rounded-xl px-4 py-2 bg-${choice.color ?? "lemon"}/90 border-2 border-white font-semibold font-nunito text-lg transition-all shadow group text-gray-900`}
                  onClick={() => handleSelect(choice.label)}
                  type="button"
                  style={choice.icon ? { fontSize: 28 } : {}}
                >
                  {choice.icon ?? choice.label}
                </motion.button>
              ))}
            </div>
          )}
          {(stepIdx === 0 || !current.choices) && (
            <div className="flex justify-center mt-8">
              <AnimatedButton
                onClick={() => {
                  if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
                  else onDone();
                }}
                rounded
                text={stepIdx === steps.length - 1 ? "Start Joy" : "Next"}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute left-0 right-0 bottom-0 h-2 bg-gradient-to-r from-lemon/80 via-peach/80 to-powder/80 rounded-b-3xl" />
    </div>
  );
};

export default Onboarding;
