
import React, { useEffect, useState } from "react";

const steps = [
  { label: "Inhale", duration: 4000 },
  { label: "Hold", duration: 2000 },
  { label: "Exhale", duration: 4000 },
];
const CYCLES = 3;

export default function BreatheGuide({ onComplete }: { onComplete?: () => void }) {
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (cycle >= CYCLES) {
      onComplete?.();
      return;
    }
    const { duration } = steps[phase];
    setProgress(0);
    const t = setTimeout(() => {
      if (phase === steps.length - 1) setCycle(c => c + 1);
      setPhase(p => (p + 1) % steps.length);
    }, duration);
    // For progress animation
    let interval: any;
    const stepDuration = 20;
    let count = 0;
    interval = setInterval(() => {
      setProgress((count * stepDuration) / duration);
      count++;
      if (count * stepDuration >= duration) clearInterval(interval);
    }, stepDuration);

    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [cycle, phase, onComplete]);

  const { label, duration } = steps[phase];
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-2xl mb-2 font-pacifico text-accent">{label}</div>
      <div className="my-6">
        <svg width={120} height={120}>
          <circle
            cx={60}
            cy={60}
            r={44}
            fill="none"
            stroke="#FFDDAA"
            strokeWidth="10"
            opacity={0.30}
          />
          <circle
            cx={60}
            cy={60}
            r={44}
            fill="none"
            stroke="#FFA07A"
            strokeWidth="10"
            strokeDasharray={276}
            strokeDashoffset={276 * (1 - progress)}
            style={{
              transition: `stroke-dashoffset ${duration}ms linear`,
            }}
          />
        </svg>
      </div>
      <div className="text-lg text-gray-800 font-nunito">
        Cycle {cycle + 1} of {CYCLES}
      </div>
    </div>
  );
}
