
import { useState } from "react";

interface ReflectiveNudgeProps {
  nudge: {
    nudge: string;
  };
  onComplete: () => void;
}

export default function ReflectiveNudge({ nudge, onComplete }: ReflectiveNudgeProps) {
  const [reflection, setReflection] = useState("");
  
  const saveReflection = (text: string) => {
    const reflections = JSON.parse(localStorage.getItem('joyReflections') || '[]');
    reflections.push({
      id: Date.now(),
      nudgeTitle: nudge.nudge,
      reflection: text,
      date: new Date().toISOString()
    });
    localStorage.setItem('joyReflections', JSON.stringify(reflections));
  };
  
  const handleSave = () => {
    if (reflection.trim()) {
      saveReflection(reflection.trim());
      onComplete();
    }
  };
  
  return (
    <div className="joy-card p-6">
      <h3 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-6 text-center">
        {nudge.nudge}
      </h3>
      
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Take your time to reflect..."
        className="w-full h-32 p-4 bg-joy-white border-2 border-joy-light-blue rounded-xl font-lato text-joy-dark-blue placeholder-joy-steel-blue/60 resize-none focus:border-joy-steel-blue focus:outline-none transition-colors"
      />
      
      <button
        onClick={handleSave}
        disabled={!reflection.trim()}
        className={`w-full mt-4 py-3 rounded-xl font-nunito font-semibold transition-all ${
          reflection.trim()
            ? 'joy-button-primary'
            : 'bg-joy-light-blue/50 text-joy-steel-blue/50 cursor-not-allowed'
        }`}
      >
        Save Reflection
      </button>
    </div>
  );
}
