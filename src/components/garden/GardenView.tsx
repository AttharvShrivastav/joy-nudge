
import { Leaf, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useGardenAchievements } from "@/hooks/useGardenAchievements";

export default function GardenView() {
  const { plants, unlockedPlantsCount, loading } = useGardenAchievements();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-joy-steel-blue font-nunito">Loading your garden...</div>
      </div>
    );
  }

  const totalNudges = plants.reduce((sum, plant) => 
    plant.unlocked ? plant.requirements.nudgeCompletions : 0, 0
  );

  return (
    <div className="space-y-6">
      {/* Enhanced garden header with celebration */}
      <motion.div 
        className="joy-card p-6 text-center relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Celebration sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 2) * 30}%`,
              }}
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Sparkles className="w-4 h-4 text-joy-coral" />
            </motion.div>
          ))}
        </div>

        <div className="text-4xl mb-3">🌻</div>
        <h2 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-2">
          Your Joy Garden
        </h2>
        <p className="text-joy-steel-blue font-lato">
          {totalNudges} nudges completed • {unlockedPlantsCount} plants blooming
        </p>
        
        {/* Progress celebration */}
        {unlockedPlantsCount >= 3 && (
          <motion.div
            className="mt-3 bg-gradient-to-r from-joy-coral/20 to-joy-steel-blue/20 rounded-lg p-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-sm font-nunito font-medium text-joy-dark-blue">
              🎉 Garden Master! Your garden is thriving!
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Garden Simulation */}
      <div className="joy-card p-6">
        <h3 className="font-nunito font-semibold text-joy-dark-blue mb-4 flex items-center gap-2">
          <Leaf className="text-joy-coral" size={20} />
          Garden View
        </h3>
        <div 
          className="relative bg-gradient-to-b from-sky-100/30 via-green-50/20 to-green-100/40 rounded-xl h-72 overflow-hidden border-2 border-joy-light-blue/30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 75%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 75% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 90%, rgba(168, 218, 220, 0.2) 0%, transparent 40%)
            `
          }}
        >
          {/* Enhanced sky background */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-100/40 to-transparent"></div>
          
          {/* Enhanced ground with depth */}
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-green-100/60 via-green-50/30 to-transparent"></div>
          
          {/* Plants positioned in garden with enhanced animations */}
          {plants.map((plant) => (
            <motion.div
              key={plant.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-3xl cursor-pointer ${
                plant.unlocked ? 'hover:scale-125' : 'opacity-40'
              }`}
              style={{ 
                left: `${plant.x}%`, 
                top: `${plant.y}%`,
                filter: plant.unlocked ? 'none' : 'grayscale(100%)'
              }}
              title={plant.unlocked ? `${plant.name} - Level ${plant.level}` : `Locked - Need ${plant.requirements.nudgeCompletions} nudges${plant.requirements.streakDays ? `, ${plant.requirements.streakDays} day streak` : ''}${plant.requirements.focusSessions ? `, ${plant.requirements.focusSessions} focus sessions` : ''}`}
              whileHover={plant.unlocked ? { scale: 1.2, y: -5 } : {}}
              animate={plant.unlocked ? {
                y: [0, -2, 0],
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: plant.id * 0.5,
              }}
            >
              {plant.unlocked ? plant.emoji : '🌫️'}
              
              {/* Level indicator for unlocked plants */}
              {plant.unlocked && plant.level > 0 && (
                <div className="absolute -top-2 -right-2 bg-joy-coral text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {plant.level}
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Enhanced decorative elements with animations */}
          <motion.div 
            className="absolute bottom-4 left-4 text-lg"
            animate={{ x: [0, 10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🦋
          </motion.div>
          <motion.div 
            className="absolute top-8 right-8 text-lg"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            ☀️
          </motion.div>
          <div className="absolute bottom-8 right-12 text-sm">🪨</div>
          <motion.div 
            className="absolute top-16 left-12 text-sm"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            🍃
          </motion.div>
        </div>
      </div>

      {/* Enhanced Plant Grid Details */}
      <div className="grid grid-cols-2 gap-3">
        {plants.map((plant) => (
          <motion.div 
            key={plant.id} 
            className={`joy-card p-4 text-center ${!plant.unlocked ? 'opacity-50' : ''}`}
            whileHover={plant.unlocked ? { scale: 1.02 } : {}}
            transition={{ duration: 0.2 }}
          >
            <div className="text-3xl mb-2 relative">
              {plant.unlocked ? plant.emoji : '🌫️'}
              {plant.unlocked && plant.level > 0 && (
                <div className="absolute -top-1 -right-1 bg-joy-coral text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {plant.level}
                </div>
              )}
            </div>
            <div className="font-nunito text-sm font-medium text-joy-dark-blue mb-1">
              {plant.unlocked ? plant.name : 'Locked'}
            </div>
            {plant.unlocked && (
              <div className="w-full bg-joy-light-blue/30 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-joy-coral to-joy-steel-blue h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${plant.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            )}
            {!plant.unlocked && (
              <div className="text-xs text-joy-steel-blue/60">
                Need {plant.requirements.nudgeCompletions} nudges
                {plant.requirements.streakDays && `, ${plant.requirements.streakDays} day streak`}
                {plant.requirements.focusSessions && `, ${plant.requirements.focusSessions} focus sessions`}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
