-- Create a new edge function to update streaks based on nudge completions
CREATE OR REPLACE FUNCTION public.check_and_update_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE;
  last_completion_date DATE;
  completion_count INTEGER;
  user_data RECORD;
  new_streak_days INTEGER;
  new_longest_streak INTEGER;
BEGIN
  -- Get today's date
  today_date := CURRENT_DATE;
  
  -- Get user's current streak data
  SELECT current_streak_days, longest_streak_days, last_streak_update_date
  INTO user_data
  FROM users
  WHERE id = NEW.user_id;
  
  -- Check if user has completed at least one nudge today
  SELECT COUNT(*), MAX(DATE(completed_at))
  INTO completion_count, last_completion_date
  FROM nudge_completions
  WHERE user_id = NEW.user_id 
  AND DATE(completed_at) = today_date;
  
  -- Only update streak if this is the first completion today
  IF completion_count = 1 THEN
    new_streak_days := COALESCE(user_data.current_streak_days, 0);
    new_longest_streak := COALESCE(user_data.longest_streak_days, 0);
    
    IF user_data.last_streak_update_date IS NULL THEN
      -- First time completing a nudge
      new_streak_days := 1;
    ELSE
      -- Calculate days difference
      CASE 
        WHEN user_data.last_streak_update_date = today_date THEN
          -- Already updated today, no change
          new_streak_days := user_data.current_streak_days;
        WHEN user_data.last_streak_update_date = today_date - INTERVAL '1 day' THEN
          -- Consecutive day, increment streak
          new_streak_days := user_data.current_streak_days + 1;
        WHEN user_data.last_streak_update_date >= today_date - INTERVAL '3 days' THEN
          -- Grace period: maintain streak but don't increment
          new_streak_days := user_data.current_streak_days;
        ELSE
          -- More than 3 days missed, reset streak
          new_streak_days := 1;
      END CASE;
    END IF;
    
    -- Update longest streak if current streak is higher
    IF new_streak_days > new_longest_streak THEN
      new_longest_streak := new_streak_days;
    END IF;
    
    -- Update user streak data
    UPDATE users
    SET 
      current_streak_days = new_streak_days,
      longest_streak_days = new_longest_streak,
      last_streak_update_date = today_date,
      last_active_at = NOW()
    WHERE id = NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update streaks when nudges are completed
DROP TRIGGER IF EXISTS trigger_update_streak_on_completion ON nudge_completions;
CREATE TRIGGER trigger_update_streak_on_completion
  AFTER INSERT ON nudge_completions
  FOR EACH ROW
  EXECUTE FUNCTION check_and_update_streak();