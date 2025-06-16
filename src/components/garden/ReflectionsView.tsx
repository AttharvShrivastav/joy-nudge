
import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Reflection {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface ReflectionsViewProps {
  reflections: any[];
}

export default function ReflectionsView({ reflections }: ReflectionsViewProps) {
  const [backendReflections, setBackendReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReflections = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('reflections')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reflections:', error);
        } else {
          setBackendReflections(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching reflections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReflections();
  }, [user]);

  // Combine backend reflections with legacy localStorage reflections
  const allReflections = [
    ...backendReflections.map(r => ({
      id: r.id,
      nudgeTitle: "Reflection",
      reflection: r.content,
      date: r.created_at,
      wordCount: r.content.trim().split(/\s+/).length
    })),
    ...reflections
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalReflections = allReflections.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="joy-card p-4 text-center">
          <BookOpen className="mx-auto mb-2 text-joy-steel-blue" size={24} />
          <h3 className="font-nunito font-semibold text-joy-dark-blue mb-2">Reflection Log</h3>
          <p className="text-sm text-joy-steel-blue font-lato">
            Loading reflections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="joy-card p-4 text-center">
        <BookOpen className="mx-auto mb-2 text-joy-steel-blue" size={24} />
        <h3 className="font-nunito font-semibold text-joy-dark-blue mb-2">Reflection Log</h3>
        <p className="text-sm text-joy-steel-blue font-lato">
          {totalReflections} reflection{totalReflections !== 1 ? 's' : ''} saved
        </p>
      </div>

      {totalReflections === 0 ? (
        <div className="joy-card p-6 text-center">
          <p className="text-joy-steel-blue font-lato">
            No reflections yet. Complete some reflective nudges to see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allReflections.map((reflection) => (
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
              {reflection.wordCount && (
                <div className="mt-2 text-xs text-joy-steel-blue/70">
                  {reflection.wordCount} words
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
