
import { Calendar } from "lucide-react";

interface StreakData {
  current_streak_days: number;
  longest_streak_days: number;
  last_streak_update_date: string | null;
}

interface StatsViewProps {
  streakData: StreakData | null;
  loading: boolean;
}

export default function StatsView({ streakData, loading }: StatsViewProps) {
  // Calculate weekly progress based on streak data
  const getWeeklyProgress = () => {
    const today = new Date();
    const weeklyProgress = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // For now, we'll mark days as completed if within current streak
      // This is a simplified logic - in a real app you'd track daily completions
      const isCompleted = streakData?.last_streak_update_date && 
        new Date(streakData.last_streak_update_date) <= date && 
        i < (streakData.current_streak_days || 0);
      
      weeklyProgress.push(isCompleted);
    }
    
    return weeklyProgress;
  };

  const weeklyProgress = getWeeklyProgress();
  const currentStreak = streakData?.current_streak_days || 0;
  const longestStreak = streakData?.longest_streak_days || 0;

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center text-joy-steel-blue">Loading streak data...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="joy-card p-4 text-center">
              <div className="text-2xl font-nunito font-bold text-joy-coral">{currentStreak}</div>
              <div className="text-sm font-lato text-joy-steel-blue">Current Streak</div>
            </div>
            <div className="joy-card p-4 text-center">
              <div className="text-2xl font-nunito font-bold text-joy-coral">{longestStreak}</div>
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
                    weeklyProgress[index] 
                      ? 'bg-joy-coral text-white' 
                      : 'bg-joy-light-blue/30 text-joy-steel-blue'
                  }`}>
                    {weeklyProgress[index] ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
