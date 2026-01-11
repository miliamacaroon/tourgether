import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TripRequest {
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  tripType: string;
  pace: string;
  diningStyle: string;
  travelers: number;
  daysCount: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const tripData: TripRequest = await req.json();
    console.log("Generating itinerary for:", tripData);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const tripTypeLabels: Record<string, string> = {
      'landmarks': 'Famous landmarks and iconic spots',
      'historical_places': 'Historical sites, museums, and cultural heritage',
      'nature': 'Natural parks, beaches, and outdoor adventures',
      'entertainment': 'Shows, nightlife, theme parks, and attractions',
    };

    const paceLabels: Record<string, string> = {
      'relaxed': 'relaxed pace with plenty of downtime',
      'moderate': 'balanced mix of activities and rest',
      'fast_paced': 'action-packed with many activities each day',
    };

    const diningLabels: Record<string, string> = {
      'local': 'authentic local cuisine',
      'mixed': 'a mix of local and international dining',
      'fine_dining': 'upscale fine dining experiences',
    };

    const systemPrompt = `You are TourGether, an expert AI travel planner. You create detailed, personalized day-by-day travel itineraries. 
Your itineraries are practical, well-organized, and include:
- Specific times for each activity
- Restaurant recommendations with approximate costs
- Insider tips and local knowledge
- Walking/transit directions between locations
- Budget-conscious alternatives when appropriate

Format your response as a structured itinerary with clear day headers and time slots.
Use emojis sparingly to make it visually appealing.
Include estimated costs in the user's preferred currency.`;

    const userPrompt = `Create a detailed ${tripData.daysCount}-day travel itinerary for ${tripData.destination}.

**Trip Details:**
- Travelers: ${tripData.travelers} ${tripData.travelers === 1 ? 'person' : 'people'}
- Dates: ${tripData.startDate} to ${tripData.endDate}
- Budget: ${tripData.currency} ${tripData.budgetMin.toLocaleString()} - ${tripData.budgetMax.toLocaleString()} total
- Focus: ${tripTypeLabels[tripData.tripType] || tripData.tripType}
- Pace: ${paceLabels[tripData.pace] || tripData.pace}
- Dining preference: ${diningLabels[tripData.diningStyle] || tripData.diningStyle}

Please create a day-by-day itinerary with:
1. Morning, afternoon, and evening activities
2. Specific restaurant/café recommendations for each meal
3. Estimated costs for major activities and meals
4. Travel tips and local insights
5. Alternative options for flexibility

Format each day clearly with:
## Day X: [Theme/Focus]
### Morning (time)
### Afternoon (time)  
### Evening (time)

Include practical details like opening hours, reservation tips, and best times to visit popular attractions.`;

    console.log("Calling Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");
    
    const itinerary = data.choices?.[0]?.message?.content || "Unable to generate itinerary. Please try again.";

    return new Response(
      JSON.stringify({ 
        success: true,
        itinerary,
        destination: tripData.destination,
        daysCount: tripData.daysCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-itinerary:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate itinerary" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
