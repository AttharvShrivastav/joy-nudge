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

    console.log('Generating personalized nudge for user:', user.id)

    const { 
      requested_category, 
      requested_interactive_type, 
      current_mood = 'open', 
      context,
      skip_category
    } = await req.json()

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Fetch comprehensive user data for personalization
    console.log('Fetching user profile data...')
    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('username, current_streak_days, longest_streak_days, last_streak_update_date')
      .eq('id', user.id)
      .single()

    if (userDataError) {
      console.error('Error fetching user data:', userDataError)
    }

    // Fetch recent nudge completions for personalization
    console.log('Fetching recent completions...')
    const { data: recentCompletions, error: completionsError } = await supabaseClient
      .from('nudge_completions')
      .select(`
        completed_at,
        mood_at_completion,
        user_nudges!inner(
          nudge_id,
          nudges!inner(category, interactive_type)
        )
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10)

    if (completionsError) {
      console.error('Error fetching completions:', completionsError)
    }

    // Analyze user patterns
    const last_completed_categories = recentCompletions
      ?.map(c => c.user_nudges?.nudges?.category)
      .filter(Boolean)
      .slice(0, 5) || []

    const last_completed_interactive_types = recentCompletions
      ?.map(c => c.user_nudges?.nudges?.interactive_type)
      .filter(Boolean)
      .slice(0, 5) || []

    const total_completions = recentCompletions?.length || 0
    const nudge_completion_frequency = total_completions > 20 ? 'consistent' : 
                                     total_completions > 5 ? 'developing' : 'new_user'

    // Determine nudge type variety based on context and user patterns
    const nudge_types = ['BREATHING', 'TIMED', 'OBSERVATIONAL', 'REFLECTIVE']
    const categories = ['Mindfulness', 'Gratitude', 'Movement', 'Connection', 'Self-Care', 'Reflection', 'Creativity']
    
    // Avoid recently used types and categories for variety
    const avoid_types = last_completed_interactive_types.slice(0, 2)
    const avoid_categories = last_completed_categories.slice(0, 2)
    
    // Add skip category to avoid list if provided
    if (skip_category) {
      avoid_categories.push(skip_category)
    }

    // Determine time of day category
    const hour = new Date().getHours()
    const time_of_day_category = hour < 6 ? 'late_night' :
                                hour < 12 ? 'morning' :
                                hour < 17 ? 'afternoon' :
                                hour < 21 ? 'evening' : 'night'

    const user_name = userData?.username || user.email?.split('@')[0] || 'friend'
    const longest_streak_days = userData?.longest_streak_days || 0
    const current_streak_days = userData?.current_streak_days || 0

    // Generate uniqueness seeds for variety
    const randomSeed = Math.random().toString(36).substring(2, 15)
    const timestamp = new Date().getTime()
    const userSeed = user.id.slice(-8)
    const contextHash = context ? context.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) : 0

    // Create highly personalized prompt with variety emphasis
    const personalizedPrompt = `You are 'The Alchemist AI' for a mobile app called 'Joy Nudge'. Your purpose is to generate highly personalized, unique nudges that spark joy, self-discovery, and mindful moments.

The app's tone is gentle, encouraging, cozy, uplifting, and non-judgmental. Nudges should be micro-habits, quick to perform (3-5 minutes), and focus on positive activities.

PERSONALIZATION CONTEXT:
- User: ${user_name} (ID: ${user.id.slice(-8)})
- Current mood: ${current_mood}
- Time of day: ${time_of_day_category}
- Engagement level: ${nudge_completion_frequency} (${total_completions} total completions)
- Current streak: ${current_streak_days} days (longest: ${longest_streak_days} days)
- Recent categories: [${last_completed_categories.join(', ')}]
- Recent interaction types: [${last_completed_interactive_types.join(', ')}]
- Context: ${context || 'general_request'}

${requested_category ? `SPECIFIC REQUEST: User wants a '${requested_category}' category nudge.` : ''}
${requested_interactive_type ? `INTERACTION PREFERENCE: User prefers '${requested_interactive_type}' type.` : 'GENERATE VARIETY: Create diverse interaction types, not just reflective ones.'}

VARIETY REQUIREMENTS:
- Avoid these recent types: [${avoid_types.join(', ')}]
- Avoid these recent categories: [${avoid_categories.join(', ')}]
- CREATE DIVERSE NUDGES: Mix breathing exercises, timed activities, observational practices, and reflective moments
- ${context === 'user_skipped_nudge' ? 'User skipped previous nudge - offer something different and engaging' : ''}

INTERACTION TYPES TO CHOOSE FROM:
- BREATHING: Guided breathing exercises (inhale, hold, exhale patterns)
- TIMED: Physical activities with specific durations (stretching, walking, dancing)
- OBSERVATIONAL: Mindful awareness exercises (noticing surroundings, gratitude lists)
- REFLECTIVE: Writing or thinking prompts (journaling, self-reflection)

PERSONALIZATION RULES:
- For new users (${nudge_completion_frequency}): Focus on simple, welcoming activities
- For developing users: Introduce variety and deeper engagement
- For consistent users: Offer creative, challenging, and growth-oriented nudges
- ${time_of_day_category === 'morning' ? 'Morning energy: Energizing activities, intention setting' :
      time_of_day_category === 'afternoon' ? 'Midday boost: Re-energizing, movement, quick breaks' :
      time_of_day_category === 'evening' ? 'Evening wind-down: Calming activities, reflection, gratitude' :
      'Night time: Gentle, peaceful, relaxing activities'}

MOOD ADAPTATION:
- ${current_mood === 'happy' ? 'Amplify joy through creative expression and celebration' :
      current_mood === 'stressed' ? 'Calming breathing exercises and gentle movement' :
      current_mood === 'calm' ? 'Mindful observation and peaceful activities' :
      current_mood === 'tired' ? 'Gentle movement or energizing breathing exercises' :
      current_mood === 'energetic' ? 'Active movement and creative expression' :
      'Supportive activities that meet the user where they are emotionally'}

UNIQUENESS SEEDS: ${randomSeed}_${timestamp}_${userSeed}_${contextHash}

**CRUCIAL: Generate a completely novel, diverse nudge. Don't default to reflective - mix it up with breathing, movement, or observational activities based on context.**

RESPONSE FORMAT (strict JSON only):
{
  "title": "Nudge Title (max 40 characters, warm and inviting)",
  "description": "Clear instruction (max 160 characters, specific action or guidance)",
  "category": "Category from: Mindfulness, Gratitude, Movement, Connection, Self-Care, Reflection, Creativity",
  "interactive_type": "Type from: BREATHING, TIMED, OBSERVATIONAL, REFLECTIVE",
  "duration": "Include if BREATHING (number of breaths) or TIMED (seconds), omit for others"
}

EXAMPLES FOR INSPIRATION (create something NEW):
- BREATHING: "Take 5 calming breaths" with duration: 5
- TIMED: "Dance to your favorite song" with duration: 180
- OBSERVATIONAL: "Find 3 things that make you smile"
- REFLECTIVE: "Write about your proudest moment today"

Create a unique, personally meaningful ${requested_interactive_type || 'varied'} nudge for ${user_name} right now!`

    console.log('Making personalized request to Gemini API...')

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: personalizedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error response:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received successfully')

    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      throw new Error('No content generated from Gemini')
    }

    let nudgeData
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        nudgeData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response, using personalized fallback:', generatedText)
      
      // Personalized fallback nudges with variety
      const personalizedFallbacks = [
        {
          title: `${user_name}'s breathing moment`,
          description: `Take 4 deep breaths, ${user_name}. Inhale peace, exhale tension.`,
          category: "Mindfulness",
          interactive_type: "BREATHING",
          duration: 4
        },
        {
          title: "Quick movement break",
          description: `${user_name}, stretch your arms above your head and hold for 30 seconds.`,
          category: "Movement", 
          interactive_type: "TIMED",
          duration: 30
        },
        {
          title: "Gratitude spotting",
          description: `${user_name}, notice 3 things around you that you're grateful for right now.`,
          category: "Gratitude",
          interactive_type: "OBSERVATIONAL"
        },
        {
          title: "Personal reflection",
          description: `${user_name}, write one sentence about how you want to feel right now.`,
          category: "Reflection", 
          interactive_type: "REFLECTIVE"
        }
      ]
      
      nudgeData = personalizedFallbacks[Math.floor(Math.random() * personalizedFallbacks.length)]
    }

    // Validate and clean the generated nudge
    if (!nudgeData.title || !nudgeData.description || !nudgeData.category) {
      throw new Error('Generated nudge missing required fields')
    }

    // Ensure valid interactive_type with variety
    const validTypes = ['BREATHING', 'TIMED', 'OBSERVATIONAL', 'REFLECTIVE']
    if (!validTypes.includes(nudgeData.interactive_type)) {
      // Default to a varied type instead of always reflective
      const fallbackTypes = validTypes.filter(type => !avoid_types.includes(type))
      nudgeData.interactive_type = fallbackTypes.length > 0 
        ? fallbackTypes[Math.floor(Math.random() * fallbackTypes.length)]
        : 'OBSERVATIONAL'
    }

    // Ensure valid category
    const validCategories = ['Mindfulness', 'Gratitude', 'Movement', 'Connection', 'Self-Care', 'Reflection', 'Creativity']
    if (!validCategories.includes(nudgeData.category)) {
      const fallbackCategories = validCategories.filter(cat => !avoid_categories.includes(cat))
      nudgeData.category = fallbackCategories.length > 0
        ? fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)]
        : 'Mindfulness'
    }

    // Insert into database
    const { data: newNudge, error: insertError } = await supabaseClient
      .from('nudges')
      .insert({
        title: nudgeData.title.substring(0, 100),
        description: nudgeData.description.substring(0, 500),
        category: nudgeData.category,
        interactive_type: nudgeData.interactive_type,
        duration: nudgeData.duration || null,
        is_ai_generated: true,
        user_id: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    console.log('Successfully created personalized nudge:', newNudge)

    return new Response(
      JSON.stringify({ 
        success: true, 
        nudge: newNudge,
        message: `✨ A special ${nudgeData.interactive_type.toLowerCase()} nudge created just for ${user_name}!`,
        personalization_used: {
          user_engagement: nudge_completion_frequency,
          time_context: time_of_day_category,
          mood_context: current_mood,
          streak_level: current_streak_days,
          interaction_type: nudgeData.interactive_type,
          avoided_types: avoid_types,
          avoided_categories: avoid_categories
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
    console.error('Error in generate-nudge function:', error)
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
