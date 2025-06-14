
-- Create user_nudge_likes table for the liking feature
CREATE TABLE public.user_nudge_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nudge_id UUID NOT NULL REFERENCES public.nudges(id) ON DELETE CASCADE,
  liked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_liked BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, nudge_id)
);

-- Enable RLS for user_nudge_likes
ALTER TABLE public.user_nudge_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_nudge_likes
CREATE POLICY "Users can view their own likes" 
  ON public.user_nudge_likes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own likes" 
  ON public.user_nudge_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own likes" 
  ON public.user_nudge_likes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
  ON public.user_nudge_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create mood_logs table for mood tracking
CREATE TABLE public.mood_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_value VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for mood_logs
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for mood_logs
CREATE POLICY "Users can view their own mood logs" 
  ON public.mood_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood logs" 
  ON public.mood_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Insert comprehensive fallback nudges into the nudges table
INSERT INTO public.nudges (title, description, category, interactive_type, is_ai_generated) VALUES
('Window Reflections', 'Look out your window for 3 minutes. Write about what you see and how it makes you feel right now.', 'Reflection', 'REFLECTIVE', false),
('Gratitude Letter', 'Write a short letter to someone who made your day better, even if you won''t send it.', 'Gratitude', 'REFLECTIVE', false),
('Morning Intentions', 'Write down three intentions for your day. What do you want to focus on?', 'Reflection', 'REFLECTIVE', false),
('Kindness Memory', 'Recall a recent act of kindness you witnessed or received. Write about how it affected you.', 'Connection', 'REFLECTIVE', false),
('Energy Check-In', 'How is your energy right now? Write about what''s draining or energizing you today.', 'Self-Care', 'REFLECTIVE', false),
('Small Victory', 'Think of something small you accomplished recently. Write why it matters to you.', 'Gratitude', 'REFLECTIVE', false),
('Nature Connection', 'Find something from nature nearby. Write about its texture, color, or what it reminds you of.', 'Mindfulness', 'REFLECTIVE', false),
('Future Self Message', 'Write a encouraging message to yourself one year from now. What would you want to hear?', 'Reflection', 'REFLECTIVE', false),
('Comfort Objects', 'Look around and find something that brings you comfort. Write about why it''s special to you.', 'Self-Care', 'REFLECTIVE', false),
('Learning Moment', 'What''s one thing you learned today, no matter how small? Write about why it caught your attention.', 'Reflection', 'REFLECTIVE', false),
('Sound Journey', 'Close your eyes for 2 minutes and listen. Write about the sounds around you and how they make you feel.', 'Mindfulness', 'REFLECTIVE', false),
('Personal Growth', 'What''s one way you''ve grown or changed recently? Write about this positive shift.', 'Reflection', 'REFLECTIVE', false),
('Texture Exploration', 'Touch three different textures around you. Write about which one feels most pleasant and why.', 'Mindfulness', 'REFLECTIVE', false),
('Memory Lane', 'Think of a happy memory from this week. Write about what made it special.', 'Gratitude', 'REFLECTIVE', false),
('Creative Spark', 'What''s something creative you''d like to try? Write about what draws you to it.', 'Creativity', 'REFLECTIVE', false),
('Weather Feelings', 'How does today''s weather match your mood? Write about this connection.', 'Mindfulness', 'REFLECTIVE', false),
('Support System', 'Who in your life makes you feel supported? Write about what they bring to your world.', 'Connection', 'REFLECTIVE', false),
('Color Mood', 'What color represents your current mood? Write about why this color feels right.', 'Creativity', 'REFLECTIVE', false),
('Progress Recognition', 'What''s one area where you''ve made progress lately? Write about your journey.', 'Reflection', 'REFLECTIVE', false),
('Seasonal Reflection', 'How does this season make you feel? Write about your connection to this time of year.', 'Mindfulness', 'REFLECTIVE', false),
('Three Deep Breaths', 'Take three slow, intentional breaths. Focus on the rhythm of inhaling and exhaling.', 'Mindfulness', 'BREATHING', false),
('Box Breathing Practice', 'Practice box breathing: inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat 5 times.', 'Mindfulness', 'BREATHING', false),
('Calming Breath Work', 'Take 7 deep breaths, making your exhale longer than your inhale to activate relaxation.', 'Self-Care', 'BREATHING', false),
('Energizing Breath', 'Take 5 quick, energizing breaths to wake up your body and mind.', 'Movement', 'BREATHING', false),
('Mindful Breathing', 'Spend 2 minutes focusing only on your breath. Notice each inhale and exhale.', 'Mindfulness', 'BREATHING', false),
('Gentle Stretch', 'Stretch your arms, neck, and shoulders for 1 minute. Move slowly and mindfully.', 'Movement', 'TIMED', false),
('Walking Break', 'Take a 2-minute walk, either indoors or outdoors. Focus on your steps.', 'Movement', 'TIMED', false),
('Hydration Moment', 'Drink a full glass of water mindfully, paying attention to each sip.', 'Self-Care', 'TIMED', false),
('Posture Reset', 'Spend 1 minute adjusting your posture and doing gentle back stretches.', 'Self-Care', 'TIMED', false),
('Quick Meditation', 'Sit quietly for 3 minutes, focusing on your breath or a calming word.', 'Mindfulness', 'TIMED', false),
('Eye Rest Break', 'Rest your eyes for 2 minutes by looking at something distant or closing them.', 'Self-Care', 'TIMED', false),
('Sunshine Moment', 'Spend 2 minutes in natural light, whether by a window or outside.', 'Self-Care', 'TIMED', false),
('Hand Massage', 'Give yourself a 1-minute hand massage, working on your palms and fingers.', 'Self-Care', 'TIMED', false),
('Tidy Space', 'Spend 2 minutes organizing your immediate workspace or area.', 'Self-Care', 'TIMED', false),
('Deep Breathing Reset', 'Take 10 slow, deep breaths to center yourself and release tension.', 'Mindfulness', 'TIMED', false),
('Five Things You See', 'Notice and mentally name 5 things you can see right now in detail.', 'Mindfulness', 'OBSERVATIONAL', false),
('Four Sounds Around', 'Listen carefully and identify 4 different sounds in your environment.', 'Mindfulness', 'OBSERVATIONAL', false),
('Three Textures Feel', 'Touch and observe 3 different textures within your reach.', 'Mindfulness', 'OBSERVATIONAL', false),
('Two Scents Notice', 'Identify 2 different scents or smells in your current space.', 'Mindfulness', 'OBSERVATIONAL', false),
('One Taste Savor', 'Take one mindful taste of something and really focus on the flavor.', 'Mindfulness', 'OBSERVATIONAL', false),
('Colors in View', 'Count how many different colors you can see from where you''re sitting.', 'Mindfulness', 'OBSERVATIONAL', false),
('Moving Things', 'Observe 3 things that are moving in your environment (wind, people, etc.).', 'Mindfulness', 'OBSERVATIONAL', false),
('Light and Shadows', 'Notice how light and shadows play in your current space.', 'Mindfulness', 'OBSERVATIONAL', false),
('Natural Elements', 'Find 3 natural elements you can see (plants, sky, water, etc.).', 'Mindfulness', 'OBSERVATIONAL', false),
('Facial Expressions', 'If people are around, observe (discretely) 3 different facial expressions.', 'Connection', 'OBSERVATIONAL', false),
('Smile at Someone', 'Give a genuine smile to someone you encounter today.', 'Connection', 'NONE', false),
('Send Appreciation', 'Send a quick message of appreciation to someone in your life.', 'Connection', 'NONE', false),
('Random Act of Kindness', 'Do one small, unexpected act of kindness for someone.', 'Connection', 'NONE', false),
('Compliment Yourself', 'Give yourself one genuine compliment out loud.', 'Self-Care', 'NONE', false),
('Phone a Friend', 'Make a quick call to check in on someone you care about.', 'Connection', 'NONE', false),
('Thank You Note', 'Write a brief thank you note to someone, even if you don''t send it.', 'Gratitude', 'NONE', false),
('Help Someone', 'Offer help to someone, even in a small way.', 'Connection', 'NONE', false),
('Listen Actively', 'Practice active listening in your next conversation.', 'Connection', 'NONE', false),
('Share Good News', 'Share something positive that happened to you with someone else.', 'Connection', 'NONE', false),
('Express Gratitude', 'Tell someone specifically why you''re grateful for them.', 'Gratitude', 'NONE', false),
('Create Something', 'Spend 5 minutes creating something with your hands (draw, build, craft).', 'Creativity', 'TIMED', false),
('Humming Joy', 'Hum or sing your favorite song for pure enjoyment.', 'Creativity', 'NONE', false),
('Quick Sketch', 'Draw something you can see in front of you, focusing on the process.', 'Creativity', 'TIMED', false),
('Word Play', 'Come up with 5 words that make you happy and say them out loud.', 'Creativity', 'NONE', false),
('Dance Break', 'Put on music and dance freely for 2 minutes.', 'Movement', 'TIMED', false),
('Photo Moment', 'Take a photo of something beautiful or meaningful you notice.', 'Creativity', 'NONE', false),
('Story Start', 'Write the first sentence of an imaginary story.', 'Creativity', 'REFLECTIVE', false),
('Color Hunt', 'Find your favorite color in 5 different objects around you.', 'Creativity', 'OBSERVATIONAL', false),
('Mindful Eating', 'Eat something slowly, paying attention to every flavor and texture.', 'Mindfulness', 'NONE', false),
('Laugh Out Loud', 'Watch, read, or remember something that makes you genuinely laugh.', 'Self-Care', 'NONE', false);
