import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { imageUrl, imageBase64 } = await req.json();

    if (!imageUrl && !imageBase64) {
      return new Response(
        JSON.stringify({ error: "Either imageUrl or imageBase64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Identifying landmark from image...");

    // Use Lovable AI vision to identify the landmark
    const imageContent = imageBase64 
      ? { type: "image_url", image_url: { url: imageBase64 } }
      : { type: "image_url", image_url: { url: imageUrl } };

    const visionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are a landmark and attraction identification expert. When shown an image, identify:
1. The name of the landmark, attraction, or location
2. The city/destination where it's located
3. A brief description of what makes it notable
4. The type/category (museum, monument, park, building, etc.)

Respond in JSON format:
{
  "identified": true/false,
  "name": "Landmark Name",
  "destination": "City Name",
  "description": "Brief description",
  "category": "Category",
  "confidence": "high/medium/low"
}

If you cannot identify the location, set "identified" to false and explain in the description.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please identify this landmark or attraction:" },
              imageContent
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      }),
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("Vision API error:", errorText);
      
      if (visionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (visionResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to analyze image");
    }

    const visionData = await visionResponse.json();
    const content = visionData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from vision model");
    }

    let identification;
    try {
      identification = JSON.parse(content);
    } catch {
      console.error("Failed to parse vision response:", content);
      identification = {
        identified: false,
        description: "Could not parse the landmark identification result",
      };
    }

    console.log("Identification result:", identification);

    // If identified, try to find matching attractions in database
    let matchingAttractions: unknown[] = [];
    if (identification.identified && identification.name) {
      const { data: matches, error } = await supabase
        .from("attractions")
        .select("id, name, description, picture, rating, destination, categories, latitude, longitude, tripadvisor_url")
        .or(`name.ilike.%${identification.name}%,destination.ilike.%${identification.destination || ""}%`)
        .limit(5);

      if (!error && matches) {
        matchingAttractions = matches;
      }
    }

    // Also search for nearby restaurants if we have a destination
    let nearbyRestaurants: unknown[] = [];
    if (identification.identified && identification.destination) {
      const { data: restaurants, error } = await supabase
        .from("restaurants")
        .select("id, name, description, picture, rating, destination, cuisines")
        .ilike("destination", `%${identification.destination}%`)
        .order("rating", { ascending: false })
        .limit(5);

      if (!error && restaurants) {
        nearbyRestaurants = restaurants;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        identification,
        matchingAttractions,
        nearbyRestaurants,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Landmark identification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
