
import { Leaf } from "lucide-react";

const plants = [
  { id: 1, name: "Mindfulness Moss", emoji: "🌱", unlocked: true, progress: 100, x: 20, y: 60 },
  { id: 2, name: "Gratitude Grass", emoji: "🌿", unlocked: true, progress: 100, x: 40, y: 80 },
  { id: 3, name: "Joy Jasmine", emoji: "🌸", unlocked: true, progress: 85, x: 70, y: 50 },
  { id: 4, name: "Calm Chrysanthemum", emoji: "🌼", unlocked: true, progress: 60, x: 30, y: 30 },
  { id: 5, name: "Energy Eucalyptus", emoji: "🌳", unlocked: false, progress: 0, x: 80, y: 75 },
  { id: 6, name: "Peace Peony", emoji: "🌺", unlocked: false, progress: 0, x: 60, y: 20 },
];

interface GardenViewProps {
  totalNudges: number;
  plantsUnlocked: number;
}

export default function GardenView({ totalNudges, plantsUnlocked }: GardenViewProps) {
  return (
    <div className="space-y-6">
      <div className="joy-card p-6 text-center">
        <div className="text-4xl mb-3">🌻</div>
        <h2 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-2">
          Your Joy Garden
        </h2>
        <p className="text-joy-steel-blue font-lato">
          {totalNudges} nudges completed • {plantsUnlocked} plants unlocked
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
}
