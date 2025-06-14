
import { BookOpen } from "lucide-react";

interface ReflectionsViewProps {
  reflections: any[];
}

export default function ReflectionsView({ reflections }: ReflectionsViewProps) {
  return (
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
}
