
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface NudgeData {
  id: number;
  nudge: string;
  description: string;
  affirmation: string;
  type: string;
  duration?: number;
  items?: string[];
}

interface InteractiveNudgeProps {
  nudge: NudgeData;
  onComplete: () => void;
}

export default function InteractiveNudge({ nudge, onComplete }: InteractiveNudgeProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [reflection, setReflection] = useState("");
  
  // Initialize checked items for observational nudges
  useEffect(() => {
    if (nudge.type === "observational" && nudge.items) {
      setCheckedItems(new Array(nudge.items.length).fill(false));
    }
  }, [nudge.type, nudge.items]);

  // Save reflection to localStorage
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
  
  // Enhanced breathing guide with dynamic animation
  if (nudge.type === "breathe") {
    const phases = [
      { name: "Inhale", duration: 4000, scale: 1.4 },
      { name: "Hold", duration: 3000, scale: 1.4 },
      { name: "Exhale", duration: 4000, scale: 1.0 }
    ];
    const totalCycles = nudge.duration || 3;
    
    useEffect(() => {
      const currentPhaseDuration = phases[currentPhase % 3].duration;
      const timer = setTimeout(() => {
        if (Math.floor(currentPhase / 3) >= totalCycles) {
          onComplete();
          return;
        }
        setCurrentPhase(prev => prev + 1);
      }, currentPhaseDuration);
      
      return () => clearTimeout(timer);
    }, [currentPhase, totalCycles, onComplete]);
    
    const currentCycle = Math.floor(currentPhase / 3) + 1;
    const phaseInCycle = currentPhase % 3;
    const currentPhaseData = phases[phaseInCycle];
    
    return (
      <div className="joy-card p-8 text-center">
        <h3 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-6">
          {nudge.nudge}
        </h3>
        
        <div className="mb-8">
          <motion.div
            className="w-32 h-32 mx-auto bg-gradient-to-br from-joy-coral/20 to-joy-steel-blue/20 rounded-full flex items-center justify-center border-4 border-joy-steel-blue/30"
            animate={{
              scale: currentPhaseData.scale,
            }}
            transition={{ 
              duration: currentPhaseData.duration / 1000, 
              ease: phaseInCycle === 1 ? "linear" : "easeInOut"
            }}
          >
            <span className="text-joy-steel-blue text-xl font-nunito font-semibold">
              {currentPhaseData.name}
            </span>
          </motion.div>
        </div>
        
        <p className="text-joy-steel-blue font-lato mb-4">
          Cycle {currentCycle} of {totalCycles}
        </p>
      </div>
    );
  }
  
  // Timer for timed activities
  if (nudge.type === "timer") {
    const [timeLeft, setTimeLeft] = useState(nudge.duration || 60);
    
    useEffect(() => {
      if (timeLeft <= 0) {
        onComplete();
        return;
      }
      
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }, [timeLeft, onComplete]);
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progressPercent = ((nudge.duration! - timeLeft) / nudge.duration!) * 100;
    
    return (
      <div className="joy-card p-8 text-center">
        <h3 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-6">
          {nudge.nudge}
        </h3>
        
        <div className="mb-8">
          <div className="text-4xl font-nunito font-bold text-joy-steel-blue mb-4">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          <div className="w-full bg-joy-light-blue/30 rounded-full h-3">
            <motion.div
              className="h-3 bg-joy-coral rounded-full"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        <p className="text-joy-steel-blue font-lato">
          Keep going, you're doing great!
        </p>
      </div>
    );
  }
  
  // Observational checklist
  if (nudge.type === "observational" && nudge.items) {
    const toggleItem = (index: number) => {
      const newChecked = [...checkedItems];
      newChecked[index] = !newChecked[index];
      setCheckedItems(newChecked);
      
      if (newChecked.every(item => item)) {
        setTimeout(onComplete, 500);
      }
    };
    
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
  
  // Reflective writing
  if (nudge.type === "reflective") {
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
  
  return null;
}
