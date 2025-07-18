
export const prompts = [
  {
    id: 2,
    nudge: "Stretch for 1 minute",
    description: "Give your body some love with gentle movement. Any stretch that feels good to you.",
    affirmation: "Wonderful! Your body thanks you.",
    type: "timer",
    duration: 60
  },
  {
    id: 3,
    nudge: "Notice 5 things you can see",
    description: "Ground yourself in the present moment by observing your surroundings with curiosity.",
    affirmation: "Perfect! You've anchored yourself in the now.",
    type: "observational",
    items: ["Something colorful", "Something textured", "Something moving", "Something still", "Something that makes you smile"]
  },
  {
    id: 4,
    nudge: "Walk for 3 minutes",
    description: "Take a gentle walk, whether indoors or outdoors. Notice how movement shifts your energy.",
    affirmation: "Great job! Your body appreciates the movement.",
    type: "timer",
    duration: 180
  },
  {
    id: 5,
    nudge: "Write one thing you're grateful for",
    description: "Take a moment to acknowledge something positive in your life, no matter how small.",
    affirmation: "Thank you for sharing your gratitude!",
    type: "reflective"
  },
  {
    id: 6,
    nudge: "Listen to sounds around you",
    description: "Close your eyes for 2 minutes and simply listen. What sounds do you notice?",
    affirmation: "Beautiful awareness! You've practiced mindful listening.",
    type: "observational",
    items: ["Close sounds", "Distant sounds", "Natural sounds", "Human-made sounds", "Your breathing"]
  },
  {
    id: 7,
    nudge: "Journal your thoughts",
    description: "Take a few minutes to write down what's on your mind. Let your thoughts flow freely onto the page.",
    affirmation: "Beautiful reflection! Your thoughts matter.",
    type: "reflective"
  },
  {
    id: 8,
    nudge: "Do 10 jumping jacks",
    description: "Get your heart pumping with some quick movement. Move at your own pace.",
    affirmation: "Excellent! You've energized your body.",
    type: "timer",
    duration: 30
  },
  {
    id: 9,
    nudge: "What made you smile today?",
    description: "Reflect on a moment that brought joy to your day, however small it might have been.",
    affirmation: "Thank you for sharing that beautiful moment!",
    type: "reflective"
  }
];

export const breathingNudge = {
  id: 1,
  nudge: "Take 3 deep breaths",
  description: "Center yourself with mindful breathing. Follow the gentle guide to inhale, hold, and exhale three times.",
  affirmation: "Beautiful! You've created a moment of calm.",
  type: "breathe",
  duration: 3
};
