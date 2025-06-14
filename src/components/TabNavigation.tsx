
import { Home, Eye, Flower2, Settings } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'discover', icon: Eye, label: 'Discover' },
    { id: 'garden', icon: Flower2, label: 'Garden' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-joy-white border-t-2 border-joy-light-blue px-4 py-2 safe-area-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-joy-light-blue text-joy-dark-blue shadow-md'
                  : 'text-joy-steel-blue hover:text-joy-dark-blue hover:bg-joy-light-blue/50'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-nunito font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
