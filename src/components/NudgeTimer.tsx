
import React, { useEffect, useState } from "react";

export default function NudgeTimer({
  duration = 60,
  onComplete,
}: {
  duration?: number;
  onComplete?: () => void;
}) {
  const [seconds, setSeconds] = useState(duration);
  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
      return;
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onComplete]);

  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl font-bold font-nunito text-accent mb-2">{pad(Math.floor(seconds / 60))}:{pad(seconds % 60)}</div>
      <div className="h-2 w-48 bg-lemon/40 rounded">
        <div className="h-2 bg-peach rounded transition-all" style={{ width: `${((duration - seconds) / duration) * 100}%` }} />
      </div>
      <div className="mt-3 text-lg text-gray-700">Keep going...</div>
    </div>
  );
}
