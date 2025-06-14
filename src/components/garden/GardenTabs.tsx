
import { Flower, Calendar, Trophy, BookOpen } from "lucide-react";

interface GardenTabsProps {
  activeTab: 'garden' | 'stats' | 'achievements' | 'reflections';
  setActiveTab: (tab: 'garden' | 'stats' | 'achievements' | 'reflections') => void;
}

const tabs = [
  { id: 'garden' as const, label: 'Garden', icon: Flower },
  { id: 'stats' as const, label: 'Stats', icon: Calendar },
  { id: 'achievements' as const, label: 'Awards', icon: Trophy },
  { id: 'reflections' as const, label: 'Log', icon: BookOpen },
];

export default function GardenTabs({ activeTab, setActiveTab }: GardenTabsProps) {
  return (
    <div className="flex mb-6 bg-joy-light-blue/20 rounded-xl p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg font-nunito font-medium transition-all text-xs ${
              activeTab === tab.id
                ? 'bg-joy-white text-joy-dark-blue shadow-sm'
                : 'text-joy-steel-blue'
            }`}
          >
            <Icon size={14} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
