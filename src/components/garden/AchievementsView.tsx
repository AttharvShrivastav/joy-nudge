
import { Trophy } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";

export default function AchievementsView() {
  const { achievements, loading } = useAchievements();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-joy-steel-blue font-nunito">Loading achievements...</div>
      </div>
    );
  }

  return (
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
              {achievement.earned && (
                <div className="text-xs text-joy-coral font-lato mt-1">✓ Earned</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
