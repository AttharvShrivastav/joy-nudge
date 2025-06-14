
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

    console.log('Generating unique reflective nudge for user:', user.id)

    const { context, category = 'mindfulness', mood } = await req.json()

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Generate multiple random elements for maximum uniqueness
    const randomSeed = Math.random().toString(36).substring(2, 15)
    const timestamp = new Date().getTime()
    const userSeed = user.id.slice(-8)
    const contextHash = context ? context.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) : 0
    const randomNumber = Math.floor(Math.random() * 100000)

    // Reflective writing prompts with high variety
    const reflectiveThemes = [
      "gratitude and appreciation",
      "personal growth moments",
      "childhood memories that shaped you",
      "dreams and aspirations",
      "challenges you've overcome",
      "people who inspire you",
      "moments of unexpected joy",
      "lessons learned from mistakes",
      "things you're proud of",
      "hopes for the future",
      "what makes you feel alive",
      "unexpected kindness you've received",
      "your unique strengths",
      "moments of pure contentment",
      "what you'd tell your younger self",
      "simple pleasures that bring joy",
      "ways you've grown this year",
      "acts of courage in your life",
      "connections that matter to you",
      "times you surprised yourself"
    ]

    const writingStyles = [
      "free-flowing stream of consciousness",
      "letter to your future self",
      "conversation with a wise friend",
      "list of specific moments",
      "story from your perspective",
      "dialogue between your heart and mind",
      "collection of vivid details",
      "series of questions and answers",
      "poem or lyrical expression",
      "gentle exploration of feelings"
    ]

    const randomTheme = reflectiveThemes[Math.floor(Math.random() * reflectiveThemes.length)]
    const randomStyle = writingStyles[Math.floor(Math.random() * writingStyles.length)]

    const uniquePrompt = `CREATE A COMPLETELY ORIGINAL REFLECTIVE WRITING NUDGE

    CRITICAL REQUIREMENTS:
    - This MUST be 100% focused on reflective writing/journaling
    - Create something deeply personal and introspective
    - NEVER suggest shadow puppets, physical activities, or observational tasks
    - Focus on inner exploration through written expression
    - Make it feel like a warm invitation to self-discovery
    
    REFLECTIVE WRITING FOCUS:
    Theme: ${randomTheme}
    Style: ${randomStyle}
    Context: ${context || 'personal reflection and growth'}
    Mood: ${mood || 'curious and open to self-discovery'}
    
    UNIQUENESS SEEDS: ${randomSeed}_${timestamp}_${userSeed}_${contextHash}_${randomNumber}
    
    RESPONSE FORMAT (strict JSON only):
    {
      "title": "Warm, inviting title (max 40 chars) that feels like opening a journal",
      "description": "Gentle, specific writing prompt (max 160 chars) that invites deep reflection and personal exploration",
      "category": "self-love",
      "interactive_type": "REFLECTIVE"
    }
    
    EXAMPLES OF THE REFLECTIVE THINKING NEEDED:
    - "Write about a moment when you felt truly understood by someone"
    - "Describe a decision that changed your perspective on life"
    - "Capture the feeling of a place that always brings you peace"
    - "Write a letter of forgiveness to yourself for a past mistake"
    - "Explore what courage means to you through a personal story"
    
    Make it feel like a gentle invitation to explore your inner world through writing!`

    console.log('Making request to Gemini API with reflective prompt...')

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
              text: uniquePrompt
            }]
          }],
          generationConfig: {
            temperature: 1.0,
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
      // Reflective fallback nudges
      const reflectiveFallbacks = [
        {
          title: "Write about unexpected kindness",
          description: "Describe a moment when someone's kindness surprised you. How did it change your day or perspective?",
          category: "self-love",
          interactive_type: "REFLECTIVE"
        },
        {
          title: "Letter to your future self",
          description: "Write a letter to yourself one year from now. What hopes, dreams, and wisdom would you share?",
          category: "self-love",
          interactive_type: "REFLECTIVE"
        },
        {
          title: "Moments of pure contentment",
          description: "Capture a recent moment when you felt completely at peace. What made it special?",
          category: "self-love",
          interactive_type: "REFLECTIVE"
        },
        {
          title: "Your unique strengths story",
          description: "Write about a time when your unique strengths helped you or someone else overcome a challenge.",
          category: "self-love",
          interactive_type: "REFLECTIVE"
        },
        {
          title: "Gratitude for small things",
          description: "List and explore three tiny moments from this week that brought you joy or comfort.",
          category: "self-love",
          interactive_type: "REFLECTIVE"
        }
      ]
      nudgeData = reflectiveFallbacks[Math.floor(Math.random() * reflectiveFallbacks.length)]
    }

    // Validate required fields
    if (!nudgeData.title || !nudgeData.description || !nudgeData.category) {
      throw new Error('Generated nudge missing required fields')
    }

    // Ensure it's always reflective
    nudgeData.interactive_type = 'REFLECTIVE'
    nudgeData.category = 'self-love'

    // Insert into database with user_id for RLS
    const { data: newNudge, error: insertError } = await supabaseClient
      .from('nudges')
      .insert({
        title: nudgeData.title,
        description: nudgeData.description,
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

    console.log('Successfully created unique reflective nudge:', newNudge)

    return new Response(
      JSON.stringify({ 
        success: true, 
        nudge: newNudge,
        message: 'Fresh reflective writing prompt created just for you!'
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
