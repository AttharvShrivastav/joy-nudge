
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Sparkles, Heart } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-joy-white via-joy-light-blue/5 to-joy-white relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 right-6 w-20 h-20 bg-joy-light-blue/8 rounded-full blur-2xl"></div>
        <div className="absolute bottom-60 left-6 w-16 h-16 bg-joy-coral/8 rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 p-4 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
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
              className="text-5xl mb-4"
            >
              🔍
            </motion.div>
            <h1 className="text-2xl font-nunito font-bold text-joy-dark-blue mb-2">
              Discover Nudges
            </h1>
            <p className="text-joy-steel-blue font-lato text-sm">
              Find the perfect nudge for your current mood
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-joy-steel-blue" size={18} />
              <Input
                placeholder="Search for nudges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 rounded-2xl border-joy-light-blue/30 focus:border-joy-coral bg-joy-white/80 backdrop-blur-sm text-joy-dark-blue font-lato h-12 shadow-lg"
              />
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Filter size={16} className="text-joy-steel-blue" />
              <span className="text-sm font-nunito font-semibold text-joy-dark-blue">Categories</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <motion.div
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className={`cursor-pointer whitespace-nowrap transition-all duration-300 font-lato font-medium px-4 py-2 rounded-full ${
                      selectedCategory === category
                        ? "bg-joy-steel-blue text-joy-white shadow-lg"
                        : "bg-joy-white text-joy-dark-blue hover:bg-joy-light-blue/20 border border-joy-light-blue/30"
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI-Powered Section Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <div className="bg-gradient-to-r from-joy-coral/10 to-joy-steel-blue/10 rounded-2xl p-4 border border-joy-light-blue/20">
              <div className="flex items-center space-x-2 mb-1">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-joy-coral" />
                </motion.div>
                <h3 className="font-nunito font-bold text-joy-dark-blue">AI-Powered Nudge Ideas</h3>
              </div>
              <p className="text-xs text-joy-steel-blue font-lato">
                Personalized suggestions crafted just for you
              </p>
            </div>
          </motion.div>

          {/* Nudges Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {filteredNudges.map((nudge, index) => (
                <motion.div
                  key={nudge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="bg-joy-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-joy-light-blue/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-nunito font-bold text-joy-dark-blue text-base mb-2 leading-tight">
                        {nudge.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3 flex-wrap gap-y-1">
                        <Badge className="bg-joy-sage/20 text-joy-sage font-lato font-medium text-xs px-3 py-1">
                          {nudge.category}
                        </Badge>
                        <Badge className="bg-joy-light-blue/20 text-joy-dark-blue font-lato font-medium text-xs px-3 py-1">
                          {nudge.interactive_type}
                        </Badge>
                        {nudge.is_ai_generated && (
                          <Badge className="bg-joy-coral/20 text-joy-coral font-lato font-medium text-xs px-3 py-1 flex items-center">
                            <Sparkles size={8} className="mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                    <LikeButton nudgeId={nudge.id} nudgeData={nudge} size="md" />
                  </div>
                  
                  <p className="text-joy-steel-blue font-lato text-sm mb-4 leading-relaxed">
                    {nudge.description}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTryNow(nudge)}
                    className="w-full bg-joy-coral text-joy-white py-3 rounded-xl font-nunito font-bold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <span>Try Now</span>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredNudges.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-nunito font-bold text-joy-dark-blue mb-2">No nudges found</h3>
                <p className="text-joy-steel-blue font-lato text-sm">
                  Try adjusting your search or filters to discover new nudges.
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
