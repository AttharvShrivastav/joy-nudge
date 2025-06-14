
-- Add user_id column to nudges table to support user-specific AI generated nudges
ALTER TABLE public.nudges ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Update RLS policy to allow users to insert their own AI-generated nudges
CREATE POLICY "Users can create AI-generated nudges" 
  ON public.nudges 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
