
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
      context 
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

    // Determine time of day category
    const hour = new Date().getHours()
    const time_of_day_category = hour < 6 ? 'late_night' :
                                hour < 12 ? 'morning' :
                                hour < 17 ? 'afternoon' :
                                hour < 21 ? 'evening' : 'night'

    const user_name = userData?.username || user.email?.split('@')[0] || 'friend'
    const longest_streak_days = userData?.longest_streak_days || 0
    const current_streak_days = userData?.current_streak_days || 0

    // Generate uniqueness seeds
    const randomSeed = Math.random().toString(36).substring(2, 15)
    const timestamp = new Date().getTime()
    const userSeed = user.id.slice(-8)
    const contextHash = context ? context.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) : 0

    // Create highly personalized prompt
    const personalizedPrompt = `You are 'The Alchemist AI' for a mobile app called 'Joy Nudge'. Your purpose is to generate highly personalized, unique, and micro-habit ideas that spark joy and self-discovery.

The app's tone is gentle, encouraging, cozy, uplifting, and non-judgmental. Nudges should be micro-habits, quick to perform (1-5 minutes), and focus on positive action and self-reflection.

PERSONALIZATION CONTEXT:
- User: ${user_name} (ID: ${user.id.slice(-8)})
- Current mood: ${current_mood}
- Time of day: ${time_of_day_category}
- Engagement level: ${nudge_completion_frequency} (${total_completions} total completions)
- Current streak: ${current_streak_days} days (longest: ${longest_streak_days} days)
- Recent categories: [${last_completed_categories.join(', ')}]
- Recent interaction types: [${last_completed_interactive_types.join(', ')}]

${requested_category ? `SPECIFIC REQUEST: User wants a '${requested_category}' category nudge.` : ''}
${requested_interactive_type ? `INTERACTION PREFERENCE: User prefers '${requested_interactive_type}' type.` : ''}

PERSONALIZATION RULES:
- For new users (${nudge_completion_frequency}): Focus on simple, high-success, welcoming nudges
- For developing users: Introduce gentle variety and slightly deeper reflections
- For consistent users: Offer more nuanced, creative, and personally challenging nudges
- Avoid recently used categories: [${last_completed_categories.slice(0, 3).join(', ')}]
- ${time_of_day_category === 'morning' ? 'Morning energy: Focus on setting intentions, gratitude, gentle awakening' :
      time_of_day_category === 'afternoon' ? 'Midday reset: Quick energy boosts, mindful breaks, perspective shifts' :
      time_of_day_category === 'evening' ? 'Evening wind-down: Reflection, gratitude, gentle self-care' :
      'Night time: Gentle, calming, preparing for rest'}

INTERACTION TYPE VARIETY:
${!requested_interactive_type ? `Vary between: 'BREATHING', 'TIMED', 'OBSERVATIONAL', 'REFLECTIVE', 'NONE'` : `Use: '${requested_interactive_type}'`}

UNIQUENESS SEEDS: ${randomSeed}_${timestamp}_${userSeed}_${contextHash}

**CRUCIAL: Generate a completely novel, never-before-suggested idea. Make it feel personally crafted for ${user_name}.**

RESPONSE FORMAT (strict JSON only):
{
  "title": "Nudge Title (max 40 characters, warm and inviting)",
  "description": "Nudge Description (max 160 characters, clear actionable instruction or reflective question)",
  "category": "Category (Mindfulness, Gratitude, Movement, Connection, Self-Care, Reflection, Creativity)",
  "interactive_type": "Interaction Type (BREATHING, TIMED, OBSERVATIONAL, REFLECTIVE, or NONE)"
}

EXAMPLES FOR INSPIRATION (do NOT copy, create something new):
- REFLECTIVE: "Write about a small act of kindness you witnessed today"
- OBSERVATIONAL: "Find three things in your space that make you smile and notice why"
- TIMED: "Spend 2 minutes doing something that brings you immediate joy"
- BREATHING: "Take 5 deep breaths while thinking of someone you're grateful for"

Create something uniquely meaningful for ${user_name} right now!`

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
      console.error('Failed to parse Gemini response:', generatedText)
      
      // Personalized fallback nudges based on user context
      const personalizedFallbacks = [
        {
          title: `${user_name}'s gratitude moment`,
          description: `Write about one small thing that made you smile today, ${user_name}. What was special about it?`,
          category: "Gratitude",
          interactive_type: "REFLECTIVE"
        },
        {
          title: "Mindful breathing for you",
          description: `Take 5 deep breaths, ${user_name}. With each exhale, release any tension you're holding.`,
          category: "Mindfulness", 
          interactive_type: "BREATHING"
        },
        {
          title: "Your personal joy hunt",
          description: `Look around and find 3 things that bring you comfort right now. Notice why they matter to you.`,
          category: "Self-Care",
          interactive_type: "OBSERVATIONAL"
        }
      ]
      
      nudgeData = personalizedFallbacks[Math.floor(Math.random() * personalizedFallbacks.length)]
    }

    // Validate and clean the generated nudge
    if (!nudgeData.title || !nudgeData.description || !nudgeData.category) {
      throw new Error('Generated nudge missing required fields')
    }

    // Ensure valid interactive_type
    const validInteractiveTypes = ['BREATHING', 'TIMED', 'OBSERVATIONAL', 'REFLECTIVE', 'NONE']
    if (!validInteractiveTypes.includes(nudgeData.interactive_type)) {
      nudgeData.interactive_type = 'REFLECTIVE'
    }

    // Ensure valid category
    const validCategories = ['Mindfulness', 'Gratitude', 'Movement', 'Connection', 'Self-Care', 'Reflection', 'Creativity']
    if (!validCategories.includes(nudgeData.category)) {
      nudgeData.category = 'Self-Care'
    }

    // Insert into database
    const { data: newNudge, error: insertError } = await supabaseClient
      .from('nudges')
      .insert({
        title: nudgeData.title.substring(0, 100), // Ensure length constraints
        description: nudgeData.description.substring(0, 500),
        category: nudgeData.category,
        interactive_type: nudgeData.interactive_type,
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
        message: `✨ A special nudge created just for ${user_name}!`,
        personalization_used: {
          user_engagement: nudge_completion_frequency,
          time_context: time_of_day_category,
          streak_level: current_streak_days
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
