
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    console.log('Generating unique nudge for user:', user.id)

    const { context, category = 'mindfulness', mood } = await req.json()

    // Call Google Gemini API with enhanced prompt for truly unique content
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Generate a random seed to ensure uniqueness
    const randomSeed = Math.random().toString(36).substring(2, 15)
    const timestamp = new Date().getTime()

    const enhancedPrompt = `Create a completely unique, never-before-seen mindful nudge for someone seeking joy and wellbeing. 

    CREATIVITY REQUIREMENTS:
    - This must be 100% original and creative, not based on common mindfulness practices
    - Think outside the box and combine unexpected elements
    - Make it delightfully surprising yet achievable
    - Focus on micro-moments of joy and discovery
    
    Context: ${context || 'general wellbeing'}
    Category preference: ${category}
    User mood: ${mood || 'neutral'}
    Uniqueness seed: ${randomSeed}
    
    CREATIVE INSPIRATION AREAS (pick unexpected combinations):
    - Sensory exploration (textures, sounds, scents, temperatures)
    - Movement and body awareness (finger dances, silly stretches)
    - Connection with environment (talking to plants, cloud conversations)
    - Playful creativity (drawing with non-dominant hand, humming to objects)
    - Micro-adventures (finding hidden details, creating tiny stories)
    - Gentle self-care rituals (making faces in mirror, thanking body parts)
    
    Please respond with a JSON object containing:
    - title: A whimsical, unique title (max 50 characters) that sparks curiosity
    - description: A warm, playful description (max 180 characters) explaining the unique activity
    - category: One of: mindfulness, gratitude, physical, joy, self-love, creativity
    - interactive_type: Choose the most fitting: BREATHING, TIMED, OBSERVATIONAL, REFLECTIVE, NONE
    
    Make it feel like a delightful surprise gift - something they've never tried before that brings a smile to their face.`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.9, // High creativity
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response:', geminiData)

    // Extract the generated content
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      throw new Error('No content generated from Gemini')
    }

    // Parse the JSON response from Gemini
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
      // Enhanced fallback nudges with more creativity
      const creativeFallbacks = [
        {
          title: "Dance with your shadow",
          description: "Find a light source and have a 2-minute silly dance party with your shadow. Make it laugh!",
          category: "joy",
          interactive_type: "TIMED"
        },
        {
          title: "Whisper to something small",
          description: "Find a tiny object and whisper a kind secret or compliment to it. Notice how it feels to share gentleness.",
          category: "self-love",
          interactive_type: "REFLECTIVE"
        },
        {
          title: "Breathe colors",
          description: "Look around and 'breathe in' a color you see. Imagine that color filling you with its unique energy.",
          category: "mindfulness",
          interactive_type: "BREATHING"
        }
      ]
      nudgeData = creativeFallbacks[Math.floor(Math.random() * creativeFallbacks.length)]
    }

    // Insert the new nudge into the database
    const { data: newNudge, error: insertError } = await supabaseClient
      .from('nudges')
      .insert({
        title: nudgeData.title,
        description: nudgeData.description,
        category: nudgeData.category,
        interactive_type: nudgeData.interactive_type,
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
        message: 'Fresh nudge generated just for you!'
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
