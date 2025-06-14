
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

    console.log('Generating nudge for user:', user.id)

    const { context, category = 'mindfulness' } = await req.json()

    // Call Google Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    const prompt = `Create a mindful, gentle nudge for someone who wants to improve their wellbeing. 
    Context: ${context || 'general mindfulness'}
    Category: ${category}
    
    Please respond with a JSON object containing:
    - title: A short, encouraging title (max 50 characters)
    - description: A warm, supportive description (max 200 characters)
    - category: One of: mindfulness, gratitude, physical, joy, self-love, creativity
    - interactive_type: One of: BREATHING, TIMED, OBSERVATIONAL, REFLECTIVE, NONE
    
    Make it personal, gentle, and actionable. Focus on small, achievable actions that bring joy and peace.`

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
              text: prompt
            }]
          }]
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
      // Fallback nudge if parsing fails
      nudgeData = {
        title: "Take a mindful moment",
        description: "Pause and notice how you're feeling right now. There's no need to change anything, just observe with kindness.",
        category: category,
        interactive_type: "REFLECTIVE"
      }
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

    console.log('Successfully created nudge:', newNudge)

    return new Response(
      JSON.stringify({ 
        success: true, 
        nudge: newNudge,
        message: 'New nudge generated successfully!'
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
