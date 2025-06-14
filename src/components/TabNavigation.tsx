
import { Home, Search, Flower, Settings } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Search },
  { id: 'garden', label: 'Garden', icon: Flower },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-joy-white/95 backdrop-blur-md border-t border-joy-light-blue/30 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`joy-tab-button ${isActive ? 'active' : ''}`}
            >
              <Icon size={24} className={isActive ? 'text-joy-coral' : 'text-joy-steel-blue'} />
              <span className={`text-xs font-lato mt-1 ${isActive ? 'text-joy-coral font-medium' : 'text-joy-steel-blue'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
