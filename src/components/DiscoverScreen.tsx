
import { useState } from "react";
import { Search, Heart, Clock, Sparkles, Users } from "lucide-react";
import { Input } from "./ui/input";

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
    difficulty: "Easy"
  },
  {
    id: 2,
    title: "Dance to one song",
    description: "Move your body and lift your spirits",
    category: "movement",
    duration: "3 min",
    difficulty: "Easy"
  },
  {
    id: 3,
    title: "Text someone you appreciate",
    description: "Spread joy with a kind message",
    category: "connection",
    duration: "1 min",
    difficulty: "Easy"
  },
];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        <div className="mb-8">
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

        {/* Featured Nudges */}
        <div>
          <h2 className="font-nunito font-semibold text-joy-dark-blue mb-4">Featured Nudges</h2>
          <div className="space-y-3">
            {featuredNudges
              .filter(nudge => !selectedCategory || nudge.category === selectedCategory)
              .filter(nudge => !searchQuery || nudge.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((nudge) => (
                <div key={nudge.id} className="joy-card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-nunito font-semibold text-joy-dark-blue">{nudge.title}</h3>
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
        </div>
      </div>
    </div>
  );
}
