import { useState, useEffect } from "react";
import { Heart, RefreshCw, Filter, Brain, Timer, Eye, Edit3, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNudgeLikes } from "@/hooks/useNudgeLikes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { getRandomFallbackNudge } from "@/data/fallbackNudges";
import { useAudioManager } from "@/hooks/useAudioManager";

const categories = [
  { id: 'all', name: 'All', icon: Sparkles, color: 'text-joy-coral' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: 'text-purple-500' },
  { id: 'movement', name: 'Movement', icon: Timer, color: 'text-green-500' },
  { id: 'creativity', name: 'Creativity', icon: Edit3, color: 'text-blue-500' },
  { id: 'reflection', name: 'Reflection', icon: Eye, color: 'text-orange-500' }
];

export default function DiscoverScreen() {
  const [nudges, setNudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const { toggleLike, isLiked } = useNudgeLikes();
  const { toast } = useToast();
  const { playSound } = useAudioManager();

  useEffect(() => {
    fetchNudges();
  }, []);

  const fetchNudges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nudges')
        .select('*');

      if (error) {
        console.error('Error fetching nudges:', error);
        toast({
          title: "Error fetching nudges",
          description: "Failed to load nudges. Please try again.",
        });
        setNudges(Array.from({ length: 5 }, () => getRandomFallbackNudge()));
      } else {
        setNudges(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching nudges:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again.",
      });
      setNudges(Array.from({ length: 5 }, () => getRandomFallbackNudge()));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    playSound('button_click');
    setSelectedCategory(categoryId);
  };

  const handleRefresh = () => {
    playSound('button_click');
    fetchNudges();
  };

  const handleNudgeLike = async (nudge: any) => {
    playSound('like');
    
    try {
      if (user) {
        // Update in Supabase
        const { data: existingLike } = await supabase
          .from('user_nudge_likes')
          .select('*')
          .eq('user_id', user.id)
          .eq('nudge_id', nudge.id)
          .single();

        if (existingLike) {
          // Update existing like
          await supabase
            .from('user_nudge_likes')
            .update({ 
              is_liked: !existingLike.is_liked,
              liked_at: new Date().toISOString()
            })
            .eq('id', existingLike.id);
        } else {
          // Create new like
          await supabase
            .from('user_nudge_likes')
            .insert({
              user_id: user.id,
              nudge_id: nudge.id,
              is_liked: true,
              liked_at: new Date().toISOString()
            });
        }

        console.log('Nudge like updated in backend');
      }
    } catch (error) {
      console.error('Error updating nudge like:', error);
    }

    toggleLike(nudge.id.toString(), nudge);
  };

  const filteredNudges = selectedCategory === 'all' 
    ? nudges 
    : nudges.filter(nudge => nudge.category?.toLowerCase() === selectedCategory);

  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-nunito font-bold text-joy-dark-blue mb-8 text-center"
        >
          Discover Nudges
        </motion.h1>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-joy-coral text-white shadow-lg'
                      : 'bg-joy-light-blue/30 text-joy-steel-blue hover:bg-joy-light-blue/50'
                  }`}
                >
                  <IconComponent size={16} className={selectedCategory === category.id ? 'text-white' : category.color} />
                  <span className="font-nunito text-sm font-medium">{category.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Refresh Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading}
            className="joy-button-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Generate New Nudges
          </motion.button>
        </motion.div>

        {/* Nudges Grid */}
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <RefreshCw className="animate-spin text-joy-coral mr-2" size={20} />
              <span className="text-joy-steel-blue font-lato">Loading personalized nudges...</span>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredNudges.map((nudge, index) => (
                <motion.div
                  key={nudge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="joy-card p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-nunito font-semibold text-joy-dark-blue text-lg mb-2">
                        {nudge.title}
                      </h3>
                      <span className="inline-block bg-joy-light-blue/30 text-joy-steel-blue text-xs px-2 py-1 rounded-full font-medium">
                        {nudge.category}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleNudgeLike(nudge)}
                      className={`p-2 rounded-full transition-colors ${
                        isLiked(nudge.id?.toString()) 
                          ? 'text-red-500 bg-red-50' 
                          : 'text-joy-steel-blue hover:text-red-400 hover:bg-gray-50'
                      }`}
                    >
                      <Heart size={20} fill={isLiked(nudge.id?.toString()) ? 'currentColor' : 'none'} />
                    </motion.button>
                  </div>
                  
                  <p className="text-joy-steel-blue font-lato leading-relaxed mb-4">
                    {nudge.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-joy-steel-blue/70">
                      {nudge.interactive_type && (
                        <>
                          <Filter size={14} />
                          <span className="capitalize font-medium">
                            {nudge.interactive_type.toLowerCase()}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        playSound('button_click');
                        // Store nudge in queue for next home screen visit
                        const existingQueue = JSON.parse(localStorage.getItem('nudgeQueue') || '[]');
                        const nudgeForQueue = {
                          id: nudge.id,
                          nudge: nudge.title,
                          description: nudge.description,
                          affirmation: "Wonderful! Thank you for trying this nudge.",
                          type: nudge.interactive_type?.toLowerCase() || "reflective",
                          interactive_type: nudge.interactive_type
                        };
                        existingQueue.push(nudgeForQueue);
                        localStorage.setItem('nudgeQueue', JSON.stringify(existingQueue));
                        
                        toast({
                          title: "Nudge added!",
                          description: "This nudge has been added to your queue.",
                        });
                      }}
                      className="joy-button-primary text-sm px-4 py-2"
                    >
                      Try This Nudge
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {filteredNudges.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Sparkles className="mx-auto text-joy-coral mb-3" size={32} />
                  <p className="text-joy-steel-blue font-lato">
                    No nudges found in this category. Try refreshing for new suggestions!
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
