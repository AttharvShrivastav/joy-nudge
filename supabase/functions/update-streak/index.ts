
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    console.log('Updating streak for user:', user.id)

    // Get current user data
    const { data: userData, error: userFetchError } = await supabaseClient
      .from('users')
      .select('current_streak_days, longest_streak_days, last_streak_update_date')
      .eq('id', user.id)
      .single()

    if (userFetchError) {
      throw userFetchError
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const lastUpdateDate = userData.last_streak_update_date
    
    let newStreakDays = userData.current_streak_days || 0
    let newLongestStreak = userData.longest_streak_days || 0

    if (!lastUpdateDate) {
      // First time completing a nudge
      newStreakDays = 1
    } else {
      const lastUpdate = new Date(lastUpdateDate)
      const todayDate = new Date(today)
      const daysDifference = Math.floor((todayDate.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDifference === 0) {
        // Already completed today, no change to streak
        console.log('Streak already updated today')
      } else if (daysDifference === 1) {
        // Consecutive day, increment streak
        newStreakDays += 1
      } else if (daysDifference <= 3) {
        // Grace period: 2-3 days missed, maintain streak but don't increment
        console.log('Within grace period, maintaining streak')
      } else {
        // More than 3 days missed, reset streak
        newStreakDays = 1
        console.log('Streak reset due to inactivity')
      }
    }

    // Update longest streak if current streak is higher
    if (newStreakDays > newLongestStreak) {
      newLongestStreak = newStreakDays
    }

    // Update user streak data
    const { data: updatedUser, error: updateError } = await supabaseClient
      .from('users')
      .update({
        current_streak_days: newStreakDays,
        longest_streak_days: newLongestStreak,
        last_streak_update_date: today,
        last_active_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    console.log('Streak updated successfully:', {
      current_streak: newStreakDays,
      longest_streak: newLongestStreak
    })

    return new Response(
      JSON.stringify({
        success: true,
        streak: {
          current_streak_days: newStreakDays,
          longest_streak_days: newLongestStreak,
          is_new_record: newStreakDays === newLongestStreak && newStreakDays > (userData.longest_streak_days || 0)
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error updating streak:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
