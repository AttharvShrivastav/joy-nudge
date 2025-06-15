
-- Create a table for user audio settings
CREATE TABLE public.user_audio_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  master_volume DECIMAL(3,2) NOT NULL DEFAULT 0.7 CHECK (master_volume >= 0 AND master_volume <= 1),
  music_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_effects_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only access their own settings
ALTER TABLE public.user_audio_settings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own audio settings
CREATE POLICY "Users can view their own audio settings" 
  ON public.user_audio_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own audio settings
CREATE POLICY "Users can create their own audio settings" 
  ON public.user_audio_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own audio settings
CREATE POLICY "Users can update their own audio settings" 
  ON public.user_audio_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_audio_settings_updated_at BEFORE UPDATE
  ON public.user_audio_settings FOR EACH ROW EXECUTE FUNCTION
  update_updated_at_column();
