
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface ObservationalNudgeProps {
  nudge: {
    nudge: string;
    items?: string[];
  };
  onComplete: () => void;
}

export default function ObservationalNudge({ nudge, onComplete }: ObservationalNudgeProps) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  
  useEffect(() => {
    if (nudge.items) {
      setCheckedItems(new Array(nudge.items.length).fill(false));
    }
  }, [nudge.items]);
  
  const toggleItem = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
    
    if (newChecked.every(item => item)) {
      setTimeout(onComplete, 500);
    }
  };
  
  if (!nudge.items) return null;
  
  return (
    <div className="joy-card p-6">
      <h3 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-6 text-center">
        {nudge.nudge}
      </h3>
      
      <div className="space-y-3">
        {nudge.items.map((item, index) => (
          <button
            key={index}
            onClick={() => toggleItem(index)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              checkedItems[index]
                ? 'bg-joy-coral/10 border-joy-coral text-joy-dark-blue'
                : 'bg-joy-white border-joy-light-blue text-joy-steel-blue hover:border-joy-steel-blue'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                checkedItems[index] ? 'bg-joy-coral border-joy-coral' : 'border-joy-light-blue'
              }`}>
                {checkedItems[index] && <Check size={14} className="text-white" />}
              </div>
              <span className="font-lato">{item}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
