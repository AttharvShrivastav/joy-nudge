
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fallbackNudges } from "@/data/fallbackNudges";
import LikeButton from "./LikeButton";
import InteractiveNudge from "./InteractiveNudge";

interface DiscoverScreenProps {
  currentMood?: string | null;
}

interface NudgeData {
  id: string;
  title: string;
  description: string;
  category: string;
  interactive_type: string;
  is_ai_generated?: boolean;
}

const categories = ["All", "Mindfulness", "Gratitude", "Movement", "Connection", "Self-Care", "Reflection", "Creativity"];

export default function DiscoverScreen({ currentMood }: DiscoverScreenProps) {
  const [nudges, setNudges] = useState<NudgeData[]>([]);
  const [filteredNudges, setFilteredNudges] = useState<NudgeData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNudge, setSelectedNudge] = useState<NudgeData | null>(null);
  const [showInteractive, setShowInteractive] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadNudges();
  }, [user]);

  useEffect(() => {
    filterNudges();
  }, [nudges, selectedCategory, searchQuery]);

  const loadNudges = async () => {
    try {
      const { data: dbNudges, error } = await supabase
        .from('nudges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Combine database nudges with fallback nudges
      const combinedNudges = [
        ...(dbNudges || []),
        ...fallbackNudges.map((nudge, index) => ({
          id: `fallback-${index}`,
          ...nudge
        }))
      ];

      setNudges(combinedNudges);
    } catch (error) {
      console.error('Error loading nudges:', error);
      // Use fallback nudges only
      const fallbackData = fallbackNudges.map((nudge, index) => ({
        id: `fallback-${index}`,
        ...nudge
      }));
      setNudges(fallbackData);
    }
  };

  const filterNudges = () => {
    let filtered = nudges;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(nudge => nudge.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(nudge =>
        nudge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nudge.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNudges(filtered);
  };

  const handleTryNow = (nudge: NudgeData) => {
    setSelectedNudge(nudge);
    setShowInteractive(true);
  };

  const handleNudgeComplete = () => {
    setShowInteractive(false);
    setSelectedNudge(null);
  };

  if (showInteractive && selectedNudge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-joy-white to-joy-light-blue/10 p-4">
        <InteractiveNudge
          nudge={{
            id: parseInt(selectedNudge.id.replace(/\D/g, '') || '0'),
            nudge: selectedNudge.title,
            description: selectedNudge.description,
            affirmation: "You're doing amazing!",
            type: selectedNudge.interactive_type?.toLowerCase() || 'reflective',
            interactive_type: selectedNudge.interactive_type,
            title: selectedNudge.title,
            category: selectedNudge.category
          }}
          onComplete={handleNudgeComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-joy-white to-joy-light-blue/10 p-4 pt-16 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-4xl mb-3"
          >
            🔍
          </motion.div>
          <h1 className="text-2xl font-fredoka font-bold text-joy-dark-blue mb-2">
            Discover Nudges
          </h1>
          <p className="text-joy-steel-blue font-lato text-sm">
            Find the perfect nudge for your current mood
          </p>
        </motion.div>

        {/* Search and Filter - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-joy-steel-blue" size={16} />
            <Input
              placeholder="Search nudges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-2 rounded-xl border-joy-light-blue/20 focus:border-joy-coral bg-joy-white text-sm"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={14} className="text-joy-steel-blue flex-shrink-0" />
            <div className="flex space-x-2">
              {categories.map((category) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className={`cursor-pointer whitespace-nowrap transition-all duration-200 text-xs px-3 py-1 ${
                      selectedCategory === category
                        ? "bg-joy-coral text-white"
                        : "bg-joy-light-blue/10 text-joy-dark-blue hover:bg-joy-light-blue/20"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Nudges Grid - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {filteredNudges.map((nudge, index) => (
              <motion.div
                key={nudge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-joy-white rounded-xl p-4 shadow-lg border border-joy-light-blue/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-nunito font-semibold text-joy-dark-blue text-base mb-2">
                      {nudge.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2 flex-wrap">
                      <Badge className="bg-joy-sage/20 text-joy-sage text-xs">
                        {nudge.category}
                      </Badge>
                      <Badge className="bg-joy-light-blue/20 text-joy-dark-blue text-xs">
                        {nudge.interactive_type}
                      </Badge>
                      {nudge.is_ai_generated && (
                        <Badge className="bg-joy-coral/20 text-joy-coral text-xs flex items-center">
                          <Sparkles size={8} className="mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                  <LikeButton nudgeId={nudge.id} nudgeData={nudge} size="sm" />
                </div>
                
                <p className="text-joy-steel-blue font-lato text-sm mb-3 leading-relaxed">
                  {nudge.description}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTryNow(nudge)}
                  className="w-full bg-joy-coral text-white py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Try Now</span>
                  <span>✨</span>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNudges.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-joy-steel-blue font-lato text-sm">
                No nudges found. Try adjusting your search or filters.
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
