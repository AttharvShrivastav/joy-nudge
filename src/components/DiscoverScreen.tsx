
import { useState } from "react";
import { Search, Heart, Clock, Sparkles, Users, Zap, Plus, Bell, Calendar } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

const nudgeCategories = [
  { id: "mindfulness", name: "Mindfulness", icon: "🧘", color: "bg-mint" },
  { id: "movement", name: "Movement", icon: "🤸", color: "bg-peach" },
  { id: "connection", name: "Connection", icon: "💝", color: "bg-powder" },
  { id: "creativity", name: "Creativity", icon: "🎨", color: "bg-lavender" },
  { id: "gratitude", name: "Gratitude", icon: "🙏", color: "bg-lemon" },
];

const featuredNudges = [
  {
    id: 1,
    title: "Take 5 mindful breaths",
    description: "Center yourself with guided breathing",
    category: "mindfulness",
    duration: "2 min",
    difficulty: "Easy",
    frequency: "Daily",
    isAiGenerated: false
  },
  {
    id: 2,
    title: "Dance to one song",
    description: "Move your body and lift your spirits",
    category: "movement",
    duration: "3 min",
    difficulty: "Easy",
    frequency: "3x/week",
    isAiGenerated: false
  },
  {
    id: 3,
    title: "Text someone you appreciate",
    description: "Spread joy with a kind message",
    category: "connection",
    duration: "1 min",
    difficulty: "Easy",
    frequency: "Weekly",
    isAiGenerated: false
  },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAiNudges, setShowAiNudges] = useState(false);
  const [selectedNudge, setSelectedNudge] = useState<any>(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiGeneratedNudges, setAiGeneratedNudges] = useState<any[]>([]);
  const { toast } = useToast();

  const generateAiNudges = async () => {
    setGeneratingAi(true);
    try {
      console.log('Calling generate-nudge function...');
      
      const { data, error } = await supabase.functions.invoke('generate-nudge', {
        body: {
          context: selectedCategory || 'general wellbeing',
          category: selectedCategory || 'mindfulness',
          mood: 'curious and open'
        }
      });

      console.log('Generate nudge response:', { data, error });

      if (error) {
        console.error('Error generating nudge:', error);
        toast({
          title: "Generation Error",
          description: "Could not generate new nudge ideas. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.success && data?.nudge) {
        const newNudge = {
          id: data.nudge.id,
          title: data.nudge.title,
          description: data.nudge.description,
          category: data.nudge.category,
          duration: "3-5 min",
          difficulty: "Easy",
          frequency: "As needed",
          isAiGenerated: true,
          interactive_type: data.nudge.interactive_type
        };
        
        setAiGeneratedNudges(prev => [newNudge, ...prev]);
        
        toast({
          title: "New Nudge Generated!",
          description: data.message || "A fresh, unique nudge has been created just for you!",
        });
      } else {
        throw new Error('No nudge data received');
      }
    } catch (error) {
      console.error('Error generating AI nudges:', error);
      toast({
        title: "Generation Error",
        description: "Could not generate new nudge ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingAi(false);
    }
  };

  const allNudges = [...featuredNudges, ...aiGeneratedNudges];
  const filteredNudges = allNudges
    .filter(nudge => !selectedCategory || nudge.category === selectedCategory)
    .filter(nudge => !searchQuery || nudge.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const NudgeDetailModal = ({ nudge, onClose }: { nudge: any, onClose: () => void }) => {
    const [notifications, setNotifications] = useState(true);
    const [scheduledTime, setScheduledTime] = useState("09:00");
    const [moodMatcher, setMoodMatcher] = useState(false);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="joy-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-nunito font-bold text-joy-dark-blue">{nudge.title}</h3>
            <button onClick={onClose} className="text-joy-steel-blue hover:text-joy-dark-blue">
              ✕
            </button>
          </div>
          
          {nudge.isAiGenerated && (
            <div className="flex items-center gap-2 mb-3 bg-joy-coral/10 p-2 rounded-lg">
              <Zap className="text-joy-coral" size={16} />
              <span className="text-sm font-lato text-joy-coral">AI Generated</span>
            </div>
          )}
          
          <p className="text-joy-steel-blue font-lato mb-4">{nudge.description}</p>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="text-center">
              <Clock className="mx-auto mb-1 text-joy-steel-blue" size={16} />
              <div className="text-xs text-joy-steel-blue">{nudge.duration}</div>
            </div>
            <div className="text-center">
              <Sparkles className="mx-auto mb-1 text-joy-steel-blue" size={16} />
              <div className="text-xs text-joy-steel-blue">{nudge.difficulty}</div>
            </div>
            <div className="text-center">
              <Calendar className="mx-auto mb-1 text-joy-steel-blue" size={16} />
              <div className="text-xs text-joy-steel-blue">{nudge.frequency}</div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-lato font-medium text-joy-dark-blue">Notifications</div>
                <div className="text-sm text-joy-steel-blue">Get reminded to do this nudge</div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            {notifications && (
              <div>
                <label className="block font-lato font-medium text-joy-dark-blue mb-2">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2 border border-joy-light-blue rounded-lg"
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <div className="font-lato font-medium text-joy-dark-blue">Mood Matcher</div>
                <div className="text-sm text-joy-steel-blue">AI suggests based on your mood</div>
              </div>
              <Switch checked={moodMatcher} onCheckedChange={setMoodMatcher} />
            </div>
          </div>

          <Button onClick={() => toast({ title: "Feature Coming Soon!", description: "Nudge collections will be available soon!" })} className="joy-button-primary w-full">
            <Plus size={16} className="mr-2" />
            Add to My Nudges
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-joy-white pb-20 px-4">
      <div className="max-w-md mx-auto pt-12">
        <h1 className="text-3xl font-nunito font-bold text-joy-dark-blue mb-8 text-center">
          Discover Joy
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-joy-steel-blue" size={20} />
          <Input
            placeholder="Search for nudges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 joy-card border-joy-light-blue/30"
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h2 className="font-nunito font-semibold text-joy-dark-blue mb-4">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {nudgeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                className={`joy-card p-4 text-center transition-all duration-200 ${
                  selectedCategory === category.id ? 'ring-2 ring-joy-coral' : ''
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-nunito font-medium text-joy-dark-blue">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI-Powered Nudge Ideas */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-nunito font-semibold text-joy-dark-blue flex items-center gap-2">
              <Zap className="text-joy-coral" size={20} />
              AI-Powered Ideas
            </h2>
            <Button 
              onClick={generateAiNudges} 
              disabled={generatingAi}
              className="joy-button-secondary text-sm px-3 py-1"
            >
              {generatingAi ? 'Generating...' : 'Generate New Ideas'}
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Switch checked={showAiNudges} onCheckedChange={setShowAiNudges} />
            <span className="font-lato text-joy-steel-blue">Show AI suggestions</span>
          </div>

          {aiGeneratedNudges.length > 0 && showAiNudges && (
            <div className="mb-4 p-3 bg-joy-coral/5 rounded-lg border border-joy-coral/20">
              <div className="text-sm text-joy-coral font-lato">
                ✨ {aiGeneratedNudges.length} AI-generated nudge{aiGeneratedNudges.length > 1 ? 's' : ''} available
              </div>
            </div>
          )}
        </div>

        {/* Featured Nudges */}
        <div>
          <h2 className="font-nunito font-semibold text-joy-dark-blue mb-4">
            {showAiNudges ? 'All Nudges' : 'Featured Nudges'}
          </h2>
          <div className="space-y-3">
            {(showAiNudges ? filteredNudges : filteredNudges.filter(n => !n.isAiGenerated))
              .map((nudge) => (
                <div key={nudge.id} className="joy-card p-4 cursor-pointer hover:bg-joy-light-blue/10 transition-colors"
                     onClick={() => setSelectedNudge(nudge)}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-nunito font-semibold text-joy-dark-blue">{nudge.title}</h3>
                      {nudge.isAiGenerated && (
                        <Zap className="text-joy-coral" size={16} />
                      )}
                    </div>
                    <Heart className="text-joy-steel-blue" size={20} />
                  </div>
                  <p className="text-joy-steel-blue font-lato text-sm mb-3">{nudge.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-xs text-joy-steel-blue">
                        <Clock size={14} />
                        {nudge.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-joy-steel-blue">
                        <Sparkles size={14} />
                        {nudge.difficulty}
                      </span>
                    </div>
                    <button className="joy-button-primary px-3 py-1 text-sm">
                      Try Now
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {showAiNudges && filteredNudges.filter(n => n.isAiGenerated).length === 0 && (
            <div className="text-center py-8">
              <div className="text-joy-steel-blue font-lato mb-4">
                No AI-generated nudges yet. Click "Generate New Ideas" to create some!
              </div>
            </div>
          )}
        </div>

        {selectedNudge && (
          <NudgeDetailModal 
            nudge={selectedNudge} 
            onClose={() => setSelectedNudge(null)} 
          />
        )}
      </div>
    </div>
  );
}
