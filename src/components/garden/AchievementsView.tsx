
import { Trophy } from "lucide-react";

const achievements = [
  { id: 1, name: "First Nudge", description: "Complete your first joy nudge", earned: true },
  { id: 2, name: "Week Warrior", description: "7-day streak", earned: true },
  { id: 3, name: "Garden Starter", description: "Unlock 3 plants", earned: true },
  { id: 4, name: "Mindful Master", description: "Complete 50 mindfulness nudges", earned: false },
];

export default function AchievementsView() {
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
