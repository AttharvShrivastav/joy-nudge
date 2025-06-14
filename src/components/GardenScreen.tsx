import { useState, useEffect } from "react";
import { Calendar, Flower, Sparkles, Trophy, BookOpen, Leaf } from "lucide-react";

const gardenData = {
  totalNudges: 47,
  currentStreak: 7,
  longestStreak: 12,
  plantsUnlocked: 8,
  weeklyProgress: [true, true, false, true, true, true, true], // Last 7 days
};

const plants = [
  { id: 1, name: "Mindfulness Moss", emoji: "🌱", unlocked: true, progress: 100, x: 20, y: 60 },
  { id: 2, name: "Gratitude Grass", emoji: "🌿", unlocked: true, progress: 100, x: 40, y: 80 },
  { id: 3, name: "Joy Jasmine", emoji: "🌸", unlocked: true, progress: 85, x: 70, y: 50 },
  { id: 4, name: "Calm Chrysanthemum", emoji: "🌼", unlocked: true, progress: 60, x: 30, y: 30 },
  { id: 5, name: "Energy Eucalyptus", emoji: "🌳", unlocked: false, progress: 0, x: 80, y: 75 },
  { id: 6, name: "Peace Peony", emoji: "🌺", unlocked: false, progress: 0, x: 60, y: 20 },
];

const achievements = [
  { id: 1, name: "First Nudge", description: "Complete your first joy nudge", earned: true },
  { id: 2, name: "Week Warrior", description: "7-day streak", earned: true },
  { id: 3, name: "Garden Starter", description: "Unlock 3 plants", earned: true },
  { id: 4, name: "Mindful Master", description: "Complete 50 mindfulness nudges", earned: false },
];

export default function GardenScreen() {
  const [activeTab, setActiveTab] = useState<'garden' | 'stats' | 'achievements' | 'reflections'>('garden');
  const [reflections, setReflections] = useState<any[]>([]);

  useEffect(() => {
    const savedReflections = JSON.parse(localStorage.getItem('joyReflections') || '[]');
    setReflections(savedReflections);
  }, []);

  const renderGarden = () => (
    <div className="space-y-6">
      <div className="joy-card p-6 text-center">
        <div className="text-4xl mb-3">🌻</div>
        <h2 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-2">
          Your Joy Garden
        </h2>
        <p className="text-joy-steel-blue font-lato">
          {gardenData.totalNudges} nudges completed • {gardenData.plantsUnlocked} plants unlocked
        </p>
      </div>

      {/* Garden Simulation */}
      <div className="joy-card p-6">
        <h3 className="font-nunito font-semibold text-joy-dark-blue mb-4 flex items-center gap-2">
          <Leaf className="text-joy-coral" size={20} />
          Garden View
        </h3>
        <div 
          className="relative bg-gradient-to-b from-joy-light-blue/20 to-joy-coral/10 rounded-xl h-64 overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 25%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
            `
          }}
        >
          {/* Sky background */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-100/30 to-transparent"></div>
          
          {/* Ground */}
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-green-100/40 to-transparent"></div>
          
          {/* Plants positioned in garden */}
          {plants.map((plant) => (
            <div
              key={plant.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-3xl transition-all duration-300 ${
                plant.unlocked ? 'hover:scale-110 cursor-pointer' : 'opacity-30'
              }`}
              style={{ 
                left: `${plant.x}%`, 
                top: `${plant.y}%`,
                filter: plant.unlocked ? 'none' : 'grayscale(100%)'
              }}
              title={plant.unlocked ? plant.name : 'Locked'}
            >
              {plant.unlocked ? plant.emoji : '🌫️'}
            </div>
          ))}
          
          {/* Decorative elements */}
          <div className="absolute bottom-4 left-4 text-lg">🦋</div>
          <div className="absolute top-8 right-8 text-lg">☀️</div>
          <div className="absolute bottom-8 right-12 text-sm">🪨</div>
        </div>
      </div>

      {/* Plant Grid Details */}
      <div className="grid grid-cols-2 gap-3">
        {plants.map((plant) => (
          <div key={plant.id} className={`joy-card p-4 text-center ${!plant.unlocked ? 'opacity-50' : ''}`}>
            <div className="text-3xl mb-2">{plant.unlocked ? plant.emoji : '🌫️'}</div>
            <div className="font-nunito text-sm font-medium text-joy-dark-blue mb-1">
              {plant.unlocked ? plant.name : 'Locked'}
            </div>
            {plant.unlocked && (
              <div className="w-full bg-joy-light-blue/30 rounded-full h-2">
                <div 
                  className="bg-joy-coral h-2 rounded-full transition-all duration-300"
                  style={{ width: `${plant.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="joy-card p-4 text-center">
          <div className="text-2xl font-nunito font-bold text-joy-coral">{gardenData.currentStreak}</div>
          <div className="text-sm font-lato text-joy-steel-blue">Current Streak</div>
        </div>
        <div className="joy-card p-4 text-center">
          <div className="text-2xl font-nunito font-bold text-joy-coral">{gardenData.longestStreak}</div>
          <div className="text-sm font-lato text-joy-steel-blue">Longest Streak</div>
        </div>
      </div>

      <div className="joy-card p-4">
        <h3 className="font-nunito font-semibold text-joy-dark-blue mb-3 flex items-center gap-2">
          <Calendar size={20} />
          This Week
        </h3>
        <div className="flex justify-between">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-xs text-joy-steel-blue mb-1">{day}</div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                gardenData.weeklyProgress[index] 
                  ? 'bg-joy-coral text-white' 
                  : 'bg-joy-light-blue/30 text-joy-steel-blue'
              }`}>
                {gardenData.weeklyProgress[index] ? '✓' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-3">
      {achievements.map((achievement) => (
        <div key={achievement.id} className={`joy-card p-4 ${!achievement.earned ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              achievement.earned ? 'bg-joy-coral' : 'bg-joy-light-blue/30'
            }`}>
              <Trophy className={achievement.earned ? 'text-white' : 'text-joy-steel-blue'} size={20} />
            </div>
            <div>
              <div className="font-nunito font-semibold text-joy-dark-blue">{achievement.name}</div>
              <div className="text-sm text-joy-steel-blue font-lato">{achievement.description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderReflections = () => (
    <div className="space-y-4">
      <div className="joy-card p-4 text-center">
        <BookOpen className="mx-auto mb-2 text-joy-steel-blue" size={24} />
        <h3 className="font-nunito font-semibold text-joy-dark-blue mb-2">Reflection Log</h3>
        <p className="text-sm text-joy-steel-blue font-lato">
          {reflections.length} reflections saved
        </p>
      </div>

      {reflections.length === 0 ? (
        <div className="joy-card p-6 text-center">
          <p className="text-joy-steel-blue font-lato">
            No reflections yet. Complete some reflective nudges to see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reflections.reverse().map((reflection) => (
            <div key={reflection.id} className="joy-card p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-nunito font-semibold text-joy-dark-blue text-sm">
                  {reflection.nudgeTitle}
                </h4>
                <span className="text-xs text-joy-steel-blue">
                  {new Date(reflection.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-joy-steel-blue font-lato text-sm">
                {reflection.reflection}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-8 text-center">
          Joy Garden
        </h1>

        {/* Tabs */}
        <div className="flex mb-6 bg-joy-light-blue/20 rounded-xl p-1">
          {[
            { id: 'garden' as const, label: 'Garden', icon: Flower },
            { id: 'stats' as const, label: 'Stats', icon: Calendar },
            { id: 'achievements' as const, label: 'Awards', icon: Trophy },
            { id: 'reflections' as const, label: 'Log', icon: BookOpen },
          ].map((tab) => {
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

        {/* Tab Content */}
        {activeTab === 'garden' && renderGarden()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'reflections' && renderReflections()}
      </div>
    </div>
  );
}
