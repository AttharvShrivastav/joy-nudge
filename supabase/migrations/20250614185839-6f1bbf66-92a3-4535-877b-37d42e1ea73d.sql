
-- Add tutorial_seen column to users table
ALTER TABLE public.users 
ADD COLUMN tutorial_seen boolean DEFAULT false;

-- Create focus_sessions table to track focus sessions
CREATE TABLE public.focus_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  duration_minutes integer NOT NULL,
  break_duration_minutes integer NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  session_type text DEFAULT 'work', -- 'work' or 'break'
  created_at timestamp with time zone DEFAULT now()
);

-- Add Row Level Security (RLS) to focus_sessions
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for focus_sessions
CREATE POLICY "Users can view their own focus sessions" 
  ON public.focus_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own focus sessions" 
  ON public.focus_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own focus sessions" 
  ON public.focus_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own focus sessions" 
  ON public.focus_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);
