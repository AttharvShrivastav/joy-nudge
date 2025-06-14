
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

    console.log('Generating unique nudge for user:', user.id)

    const { context, category = 'mindfulness', mood } = await req.json()

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Generate multiple random elements for uniqueness
    const randomSeed = Math.random().toString(36).substring(2, 15)
    const timestamp = new Date().getTime()
    const userSeed = user.id.slice(-8)
    const contextHash = context ? context.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) : 0

    const uniquePrompt = `CREATE A COMPLETELY ORIGINAL, NEVER-BEFORE-SEEN MINDFUL MICRO-PRACTICE

    STRICT UNIQUENESS REQUIREMENTS:
    - This MUST be 100% original and creative - avoid all common mindfulness practices
    - Combine unexpected elements from different domains
    - Create something delightfully surprising yet achievable in under 5 minutes
    - Think beyond breathing, meditation, gratitude - be genuinely inventive
    
    CREATIVE DOMAINS TO UNEXPECTEDLY COMBINE:
    - Sensory micro-explorations (temperature, texture, sound, taste, light)
    - Playful body awareness (finger choreography, facial expressions, posture experiments)
    - Environmental connection (conversations with objects, light observations, air movement)
    - Creative expression (drawing with feet, humming to colors, storytelling to shadows)
    - Micro-adventures (finding hidden patterns, creating tiny rituals, inventing games)
    - Gentle self-discovery (body part appreciation, emotion coloring, memory textures)
    
    Context: ${context || 'general wellbeing and joy'}
    Preferred mood: ${mood || 'curious and open'}
    Unique seeds: ${randomSeed}_${timestamp}_${userSeed}_${contextHash}
    
    RESPONSE FORMAT (strict JSON only):
    {
      "title": "Captivating unique title (max 40 chars) - make it curious and inviting",
      "description": "Warm, clear description (max 160 chars) of this unique micro-practice",
      "category": "mindfulness|gratitude|physical|joy|self-love|creativity",
      "interactive_type": "BREATHING|TIMED|OBSERVATIONAL|REFLECTIVE|NONE"
    }
    
    EXAMPLES OF THE CREATIVE THINKING NEEDED:
    - "Create a 2-minute texture treasure hunt using only your fingertips"
    - "Have a silent conversation with three different light sources"
    - "Compose a tiny song by humming to each room you enter"
    - "Draw the shape of your current emotion using only your toes"
    
    Make it feel like discovering a hidden gem of joy and wonder!`

    console.log('Making request to Gemini API with corrected endpoint')

    // Updated API call to use the correct endpoint format
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
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
            topK: 40,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error response:', errorText)
      console.error('Gemini API status:', geminiResponse.status)
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response received successfully:', geminiData)

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
      // Unique fallback nudges
      const uniqueFallbacks = [
        {
          title: "Whisper compliments to your reflection",
          description: "Look in any reflective surface and whisper three kind words to yourself. Notice how it feels.",
          category: "self-love",
          interactive_type: "REFLECTIVE"
        },
        {
          title: "Temperature detective game",
          description: "Find 5 different temperatures around you using only your fingertips. Notice the contrast.",
          category: "mindfulness",
          interactive_type: "OBSERVATIONAL"
        },
        {
          title: "Create a micro dance for your mood",
          description: "Let your current feeling move through your body for 90 seconds. No rules, just feeling.",
          category: "creativity",
          interactive_type: "TIMED"
        }
      ]
      nudgeData = uniqueFallbacks[Math.floor(Math.random() * uniqueFallbacks.length)]
    }

    // Validate required fields
    if (!nudgeData.title || !nudgeData.description || !nudgeData.category) {
      throw new Error('Generated nudge missing required fields')
    }

    const { data: newNudge, error: insertError } = await supabaseClient
      .from('nudges')
      .insert({
        title: nudgeData.title,
        description: nudgeData.description,
        category: nudgeData.category,
        interactive_type: nudgeData.interactive_type || 'NONE',
        is_ai_generated: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    console.log('Successfully created unique nudge:', newNudge)

    return new Response(
      JSON.stringify({ 
        success: true, 
        nudge: newNudge,
        message: 'Fresh, unique nudge created just for you!'
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
