
import { Leaf, Sparkles, Flower, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useGardenAchievements } from "@/hooks/useGardenAchievements";

export default function GardenView() {
  const { plants, unlockedPlantsCount, totalCompletions, totalPlantLevels, loading } = useGardenAchievements();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-joy-steel-blue font-nunito">Loading your garden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced garden header with completion stats */}
      <motion.div 
        className="joy-card p-6 text-center relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Celebration sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + i * 12}%`,
                top: `${10 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -8, 0],
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              <Sparkles className="w-3 h-3 text-joy-coral" />
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Flower className="w-8 h-8 text-joy-coral" />
        </div>
        <h2 className="text-xl font-nunito font-semibold text-joy-dark-blue mb-2">
          Your Thriving Joy Garden
        </h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-nunito font-bold text-joy-coral">{totalCompletions}</div>
            <div className="text-xs text-joy-steel-blue">Nudges Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-nunito font-bold text-joy-steel-blue">{unlockedPlantsCount}</div>
            <div className="text-xs text-joy-steel-blue">Plants Blooming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-nunito font-bold text-joy-dark-blue">{totalPlantLevels}</div>
            <div className="text-xs text-joy-steel-blue">Total Levels</div>
          </div>
        </div>
        
        {/* Dynamic celebration messages */}
        {totalCompletions >= 25 && (
          <motion.div
            className="mt-4 bg-gradient-to-r from-joy-coral/20 to-joy-steel-blue/20 rounded-lg p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-joy-coral" />
              <span className="text-sm font-nunito font-medium text-joy-dark-blue">
                🎉 Garden Master! You've created a beautiful sanctuary!
              </span>
            </div>
          </motion.div>
        )}
        {totalCompletions >= 15 && totalCompletions < 25 && (
          <motion.div
            className="mt-4 bg-joy-light-blue/20 rounded-lg p-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-sm font-nunito font-medium text-joy-dark-blue">
              🌟 Amazing progress! Your garden is flourishing!
            </span>
          </motion.div>
        )}
        {totalCompletions >= 5 && totalCompletions < 15 && (
          <motion.div
            className="mt-4 bg-green-100/50 rounded-lg p-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-sm font-nunito font-medium text-joy-dark-blue">
              🌱 Great start! Your garden is growing beautifully!
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Garden Simulation */}
      <div className="joy-card p-6">
        <h3 className="font-nunito font-semibold text-joy-dark-blue mb-4 flex items-center gap-2">
          <Leaf className="text-joy-coral" size={20} />
          Garden View ({totalCompletions} nudges grown into {unlockedPlantsCount} plants)
        </h3>
        <div 
          className="relative bg-gradient-to-b from-sky-100/40 via-green-50/30 to-green-100/50 rounded-xl h-80 overflow-hidden border-2 border-joy-light-blue/40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 75%, rgba(34, 197, 94, 0.2) 0%, transparent 60%),
              radial-gradient(circle at 75% 25%, rgba(34, 197, 94, 0.15) 0%, transparent 60%),
              radial-gradient(circle at 50% 90%, rgba(168, 218, 220, 0.25) 0%, transparent 50%)
            `
          }}
        >
          {/* Enhanced sky background */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-100/50 to-transparent"></div>
          
          {/* Enhanced ground with depth */}
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-green-100/70 via-green-50/40 to-transparent"></div>
          
          {/* Plants positioned in garden with enhanced animations */}
          {plants.map((plant) => (
            <motion.div
              key={plant.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                plant.unlocked ? 'hover:scale-110' : 'opacity-30'
              }`}
              style={{ 
                left: `${plant.x}%`, 
                top: `${plant.y}%`,
                fontSize: plant.unlocked ? `${Math.min(2.5 + plant.level * 0.2, 4)}rem` : '2rem',
                filter: plant.unlocked ? 'none' : 'grayscale(100%)'
              }}
              title={plant.unlocked ? 
                `${plant.name} - Level ${plant.level} (${plant.currentCompletions}/${plant.completionsNeeded + plant.level * 5} nudges)` : 
                `${plant.name} - Need ${plant.requirements.nudgeCompletions} nudges${plant.requirements.streakDays ? `, ${plant.requirements.streakDays} day streak` : ''}${plant.requirements.focusSessions ? `, ${plant.requirements.focusSessions} focus sessions` : ''} (Progress: ${plant.currentCompletions}/${plant.requirements.nudgeCompletions})`
              }
              whileHover={plant.unlocked ? { scale: 1.15, y: -8 } : { scale: 1.05 }}
              animate={plant.unlocked ? {
                y: [0, -3, 0],
                scale: [1, 1.03, 1],
                rotate: [0, 2, -2, 0],
              } : {
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: plant.unlocked ? 4 + plant.id * 0.3 : 2,
                repeat: Infinity,
                delay: plant.id * 0.3,
              }}
            >
              {plant.unlocked ? plant.emoji : '🌫️'}
              
              {/* Enhanced level indicator */}
              {plant.unlocked && plant.level > 0 && (
                <motion.div 
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-joy-coral to-orange-400 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: plant.id }}
                >
                  {plant.level}
                </motion.div>
              )}
              
              {/* Progress indicator for locked plants */}
              {!plant.unlocked && plant.progress > 0 && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-joy-light-blue/30 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-joy-coral rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${plant.progress}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Enhanced decorative elements */}
          <motion.div 
            className="absolute bottom-6 left-6 text-2xl"
            animate={{ x: [0, 15, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            🦋
          </motion.div>
          <motion.div 
            className="absolute top-8 right-8 text-2xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
          >
            ☀️
          </motion.div>
          <motion.div 
            className="absolute bottom-12 right-16 text-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
          >
            🪨
          </motion.div>
          <motion.div 
            className="absolute top-20 left-16 text-lg"
            animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          >
            🍃
          </motion.div>
          
          {/* Completion milestone effects */}
          {totalCompletions >= 10 && (
            <motion.div 
              className="absolute top-12 left-1/2 transform -translate-x-1/2 text-lg"
              animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🌈
            </motion.div>
          )}
        </div>
      </div>

      {/* Enhanced Plant Grid with Completion Progress */}
      <div className="grid grid-cols-2 gap-3">
        {plants.map((plant) => (
          <motion.div 
            key={plant.id} 
            className={`joy-card p-4 text-center relative ${!plant.unlocked ? 'opacity-60' : ''}`}
            whileHover={plant.unlocked ? { scale: 1.02, y: -2 } : { scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-3xl mb-2 relative">
              {plant.unlocked ? plant.emoji : '🌫️'}
              {plant.unlocked && plant.level > 0 && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-joy-coral to-orange-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {plant.level}
                </div>
              )}
            </div>
            <div className="font-nunito text-sm font-medium text-joy-dark-blue mb-2">
              {plant.unlocked ? plant.name : plant.name}
            </div>
            
            {plant.unlocked ? (
              <div className="space-y-1">
                <div className="text-xs text-joy-steel-blue">
                  Level {plant.level} • {plant.currentCompletions} nudges completed
                </div>
                <div className="w-full bg-joy-light-blue/30 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-joy-coral to-joy-steel-blue h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${plant.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xs text-joy-steel-blue/70">
                  Need {plant.requirements.nudgeCompletions} nudges
                  {plant.requirements.streakDays && `, ${plant.requirements.streakDays} day streak`}
                  {plant.requirements.focusSessions && `, ${plant.requirements.focusSessions} focus sessions`}
                </div>
                <div className="text-xs text-joy-coral font-medium">
                  Progress: {plant.currentCompletions}/{plant.requirements.nudgeCompletions}
                </div>
                {plant.progress > 0 && (
                  <div className="w-full bg-joy-light-blue/30 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      className="bg-joy-coral/60 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${plant.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
