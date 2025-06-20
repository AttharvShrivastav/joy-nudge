
-- Add RLS policies for mood_logs table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_logs' AND policyname = 'Users can view their own mood logs') THEN
        CREATE POLICY "Users can view their own mood logs" 
          ON public.mood_logs 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_logs' AND policyname = 'Users can create their own mood logs') THEN
        CREATE POLICY "Users can create their own mood logs" 
          ON public.mood_logs 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_logs' AND policyname = 'Users can update their own mood logs') THEN
        CREATE POLICY "Users can update their own mood logs" 
          ON public.mood_logs 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_logs' AND policyname = 'Users can delete their own mood logs') THEN
        CREATE POLICY "Users can delete their own mood logs" 
          ON public.mood_logs 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for nudge_completions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nudge_completions' AND policyname = 'Users can view their own nudge completions') THEN
        CREATE POLICY "Users can view their own nudge completions" 
          ON public.nudge_completions 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nudge_completions' AND policyname = 'Users can create their own nudge completions') THEN
        CREATE POLICY "Users can create their own nudge completions" 
          ON public.nudge_completions 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nudge_completions' AND policyname = 'Users can update their own nudge completions') THEN
        CREATE POLICY "Users can update their own nudge completions" 
          ON public.nudge_completions 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nudge_completions' AND policyname = 'Users can delete their own nudge completions') THEN
        CREATE POLICY "Users can delete their own nudge completions" 
          ON public.nudge_completions 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for focus_sessions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'focus_sessions' AND policyname = 'Users can view their own focus sessions') THEN
        CREATE POLICY "Users can view their own focus sessions" 
          ON public.focus_sessions 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'focus_sessions' AND policyname = 'Users can create their own focus sessions') THEN
        CREATE POLICY "Users can create their own focus sessions" 
          ON public.focus_sessions 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'focus_sessions' AND policyname = 'Users can update their own focus sessions') THEN
        CREATE POLICY "Users can update their own focus sessions" 
          ON public.focus_sessions 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'focus_sessions' AND policyname = 'Users can delete their own focus sessions') THEN
        CREATE POLICY "Users can delete their own focus sessions" 
          ON public.focus_sessions 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for user_audio_settings table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_audio_settings' AND policyname = 'Users can view their own audio settings') THEN
        CREATE POLICY "Users can view their own audio settings" 
          ON public.user_audio_settings 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_audio_settings' AND policyname = 'Users can create their own audio settings') THEN
        CREATE POLICY "Users can create their own audio settings" 
          ON public.user_audio_settings 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_audio_settings' AND policyname = 'Users can update their own audio settings') THEN
        CREATE POLICY "Users can update their own audio settings" 
          ON public.user_audio_settings 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_audio_settings' AND policyname = 'Users can delete their own audio settings') THEN
        CREATE POLICY "Users can delete their own audio settings" 
          ON public.user_audio_settings 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for user_device_tokens table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_device_tokens' AND policyname = 'Users can view their own device tokens') THEN
        CREATE POLICY "Users can view their own device tokens" 
          ON public.user_device_tokens 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_device_tokens' AND policyname = 'Users can create their own device tokens') THEN
        CREATE POLICY "Users can create their own device tokens" 
          ON public.user_device_tokens 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_device_tokens' AND policyname = 'Users can update their own device tokens') THEN
        CREATE POLICY "Users can update their own device tokens" 
          ON public.user_device_tokens 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_device_tokens' AND policyname = 'Users can delete their own device tokens') THEN
        CREATE POLICY "Users can delete their own device tokens" 
          ON public.user_device_tokens 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for user_nudge_likes table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nudge_likes' AND policyname = 'Users can view their own nudge likes') THEN
        CREATE POLICY "Users can view their own nudge likes" 
          ON public.user_nudge_likes 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nudge_likes' AND policyname = 'Users can create their own nudge likes') THEN
        CREATE POLICY "Users can create their own nudge likes" 
          ON public.user_nudge_likes 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nudge_likes' AND policyname = 'Users can update their own nudge likes') THEN
        CREATE POLICY "Users can update their own nudge likes" 
          ON public.user_nudge_likes 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nudge_likes' AND policyname = 'Users can delete their own nudge likes') THEN
        CREATE POLICY "Users can delete their own nudge likes" 
          ON public.user_nudge_likes 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for user_nudges table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nudges' AND policyname = 'Users can view their own user nudges') THEN
        CREATE POLICY "Users can view their own user nudges" 
          ON public.user_nudges 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nudges' AND policyname = 'Users can create their own user nudges') THEN
        CREATE POLICY "Users can create their own user nudges" 
          ON public.user_nudges 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nudges' AND policyname = 'Users can update their own user nudges') THEN
        CREATE POLICY "Users can update their own user nudges" 
          ON public.user_nudges 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_nudges' AND policyname = 'Users can delete their own user nudges') THEN
        CREATE POLICY "Users can delete their own user nudges" 
          ON public.user_nudges 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for users table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" 
          ON public.users 
          FOR SELECT 
          USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" 
          ON public.users 
          FOR UPDATE 
          USING (auth.uid() = id);
    END IF;
END $$;

-- Add RLS policies for subscriptions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view their own subscription') THEN
        CREATE POLICY "Users can view their own subscription" 
          ON public.subscriptions 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add RLS policies for nudges table (readable by all authenticated users)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'nudges' AND policyname = 'All users can view nudges') THEN
        CREATE POLICY "All users can view nudges" 
          ON public.nudges 
          FOR SELECT 
          TO authenticated 
          USING (true);
    END IF;
END $$;
