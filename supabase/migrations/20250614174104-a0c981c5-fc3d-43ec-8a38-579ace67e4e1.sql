
-- Create custom types for enums
CREATE TYPE subscription_status AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE interactive_type AS ENUM ('BREATHING', 'TIMED', 'OBSERVATIONAL', 'REFLECTIVE', 'NONE');
CREATE TYPE schedule_frequency AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKENDS', 'CUSTOM');
CREATE TYPE plan_type AS ENUM ('PREMIUM_MONTHLY', 'PREMIUM_ANNUAL');
CREATE TYPE subscription_status_type AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE');
CREATE TYPE platform_type AS ENUM ('IOS', 'ANDROID');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR,
  subscription_status subscription_status DEFAULT 'FREE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_streak_update_date DATE
);

-- Create nudges table (Master Library)
CREATE TABLE public.nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  interactive_type interactive_type DEFAULT 'NONE',
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_nudges table (User's Personalized Nudges)
CREATE TABLE public.user_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nudge_id UUID REFERENCES public.nudges(id) ON DELETE SET NULL,
  custom_title VARCHAR,
  custom_description TEXT,
  schedule_frequency schedule_frequency NOT NULL,
  scheduled_times JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create nudge_completions table
CREATE TABLE public.nudge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_nudge_id UUID NOT NULL REFERENCES public.user_nudges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  mood_at_completion VARCHAR,
  duration_seconds INTEGER
);

-- Create reflections table
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completion_id UUID REFERENCES public.nudge_completions(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  emotion_tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR UNIQUE,
  stripe_subscription_id VARCHAR UNIQUE,
  plan_type plan_type NOT NULL,
  status subscription_status_type NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_device_tokens table
CREATE TABLE public.user_device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  device_token VARCHAR UNIQUE NOT NULL,
  platform platform_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_device_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users table policies
CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Nudges table policies (readable by all authenticated users)
CREATE POLICY "All users can view nudges" 
  ON public.nudges FOR SELECT 
  TO authenticated 
  USING (true);

-- User_nudges table policies
CREATE POLICY "Users can view their own nudges" 
  ON public.user_nudges FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nudges" 
  ON public.user_nudges FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nudges" 
  ON public.user_nudges FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nudges" 
  ON public.user_nudges FOR DELETE 
  USING (auth.uid() = user_id);

-- Nudge_completions table policies
CREATE POLICY "Users can view their own completions" 
  ON public.nudge_completions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions" 
  ON public.nudge_completions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Reflections table policies
CREATE POLICY "Users can view their own reflections" 
  ON public.reflections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections" 
  ON public.reflections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections" 
  ON public.reflections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" 
  ON public.reflections FOR DELETE 
  USING (auth.uid() = user_id);

-- Subscriptions table policies
CREATE POLICY "Users can view their own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- User_device_tokens table policies
CREATE POLICY "Users can view their own device tokens" 
  ON public.user_device_tokens FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own device tokens" 
  ON public.user_device_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device tokens" 
  ON public.user_device_tokens FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens" 
  ON public.user_device_tokens FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some default nudges to get started
INSERT INTO public.nudges (title, description, category, interactive_type) VALUES
('Take 3 deep breaths', 'Center yourself with mindful breathing. Follow the gentle guide to inhale, hold, and exhale three times.', 'mindfulness', 'BREATHING'),
('Stretch for 1 minute', 'Give your body some love with gentle movement. Any stretch that feels good to you.', 'physical', 'TIMED'),
('Notice 5 things you can see', 'Ground yourself in the present moment by observing your surroundings with curiosity.', 'mindfulness', 'OBSERVATIONAL'),
('Write one thing you''re grateful for', 'Take a moment to acknowledge something positive in your life, no matter how small.', 'gratitude', 'REFLECTIVE'),
('Smile at yourself in the mirror', 'Give yourself a genuine smile and notice how it feels.', 'self-love', 'NONE'),
('Listen to your favorite song', 'Take a few minutes to enjoy music that lifts your spirits.', 'joy', 'TIMED');
