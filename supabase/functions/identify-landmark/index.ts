import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// RegionMapper - Ported from Python region_mapper.py (matching your YOLOv11 model classes)
const REGION_TO_PREFERENCES: Record<string, {
  primary_type: string;
  secondary_types: string[];
  suggested_destinations: string[];
  budget_modifier: number;
  currency_hint: string;
  popular_seasons: string[];
}> = {
  north_america: {
    primary_type: "landmarks",
    secondary_types: ["entertainment", "nature"],
    suggested_destinations: [
      "New York", "Los Angeles", "San Francisco", "Chicago",
      "Las Vegas", "Miami", "Seattle", "Boston",
      "Toronto", "Vancouver", "Montreal", "Mexico City"
    ],
    budget_modifier: 1.3,
    currency_hint: "USD",
    popular_seasons: ["Spring (Apr-Jun)", "Fall (Sep-Nov)"]
  },
  europe: {
    primary_type: "historical_places",
    secondary_types: ["landmarks", "nature"],
    suggested_destinations: [
      "Paris", "Rome", "London", "Barcelona",
      "Amsterdam", "Prague", "Vienna", "Athens",
      "Lisbon", "Berlin", "Venice", "Dublin"
    ],
    budget_modifier: 1.2,
    currency_hint: "EUR",
    popular_seasons: ["Spring (Apr-Jun)", "Summer (Jul-Aug)"]
  },
  east_asia: {
    primary_type: "landmarks",
    secondary_types: ["historical_places", "entertainment"],
    suggested_destinations: [
      "Tokyo", "Kyoto", "Osaka", "Seoul",
      "Beijing", "Shanghai", "Hong Kong", "Taipei",
      "Busan", "Nara", "Yokohama", "Jeju Island"
    ],
    budget_modifier: 1.1,
    currency_hint: "JPY",
    popular_seasons: ["Spring (Mar-May)", "Fall (Sep-Nov)"]
  },
  south_southeast_asia: {
    primary_type: "nature",
    secondary_types: ["historical_places", "entertainment"],
    suggested_destinations: [
      "Bangkok", "Singapore", "Bali", "Kuala Lumpur",
      "Phuket", "Hanoi", "Ho Chi Minh City", "Siem Reap",
      "Manila", "Penang", "Chiang Mai", "Yangon",
      "Jakarta", "Boracay", "Luang Prabang", "Ubud"
    ],
    budget_modifier: 0.8,
    currency_hint: "MYR",
    popular_seasons: ["Nov-Feb (Dry)", "Year-round (varies)"]
  },
  oceania: {
    primary_type: "nature",
    secondary_types: ["entertainment", "landmarks"],
    suggested_destinations: [
      "Sydney", "Melbourne", "Auckland", "Brisbane",
      "Gold Coast", "Wellington", "Perth", "Queenstown",
      "Cairns", "Christchurch", "Hobart", "Fiji"
    ],
    budget_modifier: 1.4,
    currency_hint: "AUD",
    popular_seasons: ["Summer (Dec-Feb)", "Spring (Sep-Nov)"]
  },
  middle_east: {
    primary_type: "historical_places",
    secondary_types: ["landmarks", "entertainment"],
    suggested_destinations: [
      "Dubai", "Abu Dhabi", "Istanbul", "Jerusalem",
      "Petra", "Doha", "Muscat", "Riyadh",
      "Cairo", "Amman", "Tel Aviv", "Beirut"
    ],
    budget_modifier: 1.2,
    currency_hint: "USD",
    popular_seasons: ["Oct-Apr (Mild)", "Avoid Jun-Aug"]
  },
  africa: {
    primary_type: "nature",
    secondary_types: ["historical_places", "landmarks"],
    suggested_destinations: [
      "Cape Town", "Marrakech", "Cairo", "Nairobi",
      "Johannesburg", "Zanzibar", "Victoria Falls", "Serengeti",
      "Casablanca", "Luxor", "Durban", "Mauritius",
      "Tunis", "Addis Ababa", "Kruger Park", "Fez"
    ],
    budget_modifier: 0.9,
    currency_hint: "USD",
    popular_seasons: ["May-Oct (Dry)", "Jun-Aug (Safari)"]
  },
  caribbean_central_america: {
    primary_type: "nature",
    secondary_types: ["entertainment", "historical_places"],
    suggested_destinations: [
      "Cancun", "Havana", "San Juan", "Panama City",
      "Costa Rica", "Aruba", "Bahamas", "Jamaica",
      "Barbados", "Antigua", "Cartagena", "Belize City",
      "Punta Cana", "Turks & Caicos", "Guatemala City", "San Jose"
    ],
    budget_modifier: 1.0,
    currency_hint: "USD",
    popular_seasons: ["Dec-Apr (Dry)", "Avoid Sep-Nov (Hurricane)"]
  },
  south_america: {
    primary_type: "nature",
    secondary_types: ["historical_places", "landmarks"],
    suggested_destinations: [
      "Rio de Janeiro", "Buenos Aires", "Lima", "Cusco",
      "Santiago", "Bogota", "Cartagena", "Quito",
      "Sao Paulo", "Machu Picchu", "Iguazu Falls", "Montevideo",
      "Galapagos", "Patagonia", "Medellin", "La Paz"
    ],
    budget_modifier: 0.9,
    currency_hint: "USD",
    popular_seasons: ["Dec-Mar (Summer)", "Jun-Aug (Winter)"]
  }
};

// Valid region keys (matching your YOLOv11 model's class labels)
const VALID_REGIONS = Object.keys(REGION_TO_PREFERENCES);

// Region detection prompt for vision model
const REGION_DETECTION_PROMPT = `You are a travel region classification expert analyzing images like a YOLOv11 model would.

Analyze this image and classify it into ONE of these exact region labels:
- north_america
- europe
- east_asia
- south_southeast_asia
- oceania
- middle_east
- africa
- caribbean_central_america
- south_america

Also identify the specific landmark or location if recognizable.

You MUST respond with ONLY a valid JSON object, no other text:
{"detected":true,"region":"europe","confidence":0.95,"landmark_name":"Eiffel Tower","destination_city":"Paris","description":"The iconic Eiffel Tower in Paris, France"}

If you cannot identify the region, respond:
{"detected":false,"region":null,"confidence":0,"landmark_name":null,"destination_city":null,"description":"Unable to identify region from image"}`;

function getRegionInfo(region: string) {
  const mapping = REGION_TO_PREFERENCES[region];
  if (!mapping) {
    return {
      destinations: [],
      trip_types: { primary: "landmarks", secondary: [] },
      budget_info: { modifier: 1.0, currency: "USD" },
      season_info: ["Year-round"]
    };
  }
  return {
    destinations: mapping.suggested_destinations,
    trip_types: {
      primary: mapping.primary_type,
      secondary: mapping.secondary_types
    },
    budget_info: {
      modifier: mapping.budget_modifier,
      currency: mapping.currency_hint
    },
    season_info: mapping.popular_seasons
  };
}

function extractJsonFromText(text: string): object | null {
  // Try to find JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // Try to fix common issues
      let cleaned = jsonMatch[0]
        .replace(/[\n\r]/g, ' ')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      
      try {
        return JSON.parse(cleaned);
      } catch {
        console.error("Could not parse cleaned JSON:", cleaned);
      }
    }
  }
  return null;
}

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

    console.log("Detecting region from image using vision AI (replicating YOLOv11 model behavior)...");

    // Prepare image content for vision model
    const imageContent = imageBase64 
      ? { type: "image_url", image_url: { url: imageBase64 } }
      : { type: "image_url", image_url: { url: imageUrl } };

    // Use Lovable AI vision to detect region (similar to YOLO model output)
    const visionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: REGION_DETECTION_PROMPT },
              imageContent
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("Vision API error:", visionResponse.status, errorText);
      
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

    console.log("Raw vision response:", content);

    if (!content) {
      throw new Error("No response from vision model");
    }

    // Extract and parse JSON from response
    let detection = extractJsonFromText(content);
    
    if (!detection) {
      console.error("Failed to extract JSON from vision response:", content);
      detection = {
        detected: false,
        region: null,
        confidence: 0,
        landmark_name: null,
        destination_city: null,
        description: "Could not parse the region detection result"
      };
    }

    // Validate and normalize the region
    const detectionObj = detection as {
      detected?: boolean;
      region?: string;
      confidence?: number;
      landmark_name?: string;
      destination_city?: string;
      description?: string;
    };

    // Ensure region is valid
    let validRegion = detectionObj.region?.toLowerCase().replace(/\s+/g, '_') || null;
    if (validRegion && !VALID_REGIONS.includes(validRegion)) {
      // Try to match partial region names
      const matched = VALID_REGIONS.find(r => 
        validRegion!.includes(r) || r.includes(validRegion!)
      );
      validRegion = matched || null;
    }

    const normalizedDetection = {
      detected: detectionObj.detected ?? false,
      region: validRegion,
      confidence: Math.min(1, Math.max(0, detectionObj.confidence ?? 0)),
      landmark_name: detectionObj.landmark_name || null,
      destination_city: detectionObj.destination_city || null,
      description: detectionObj.description || ""
    };

    console.log("Normalized detection result:", normalizedDetection);

    // Apply RegionMapper logic
    const regionKey = normalizedDetection.region || "europe";
    const regionInfo = getRegionInfo(regionKey);

    // Get matching attractions from database based on region's suggested destinations
    let matchingAttractions: unknown[] = [];
    let nearbyRestaurants: unknown[] = [];

    if (normalizedDetection.detected && normalizedDetection.region) {
      const destinationsToSearch = normalizedDetection.destination_city 
        ? [normalizedDetection.destination_city, ...regionInfo.destinations.slice(0, 3)]
        : regionInfo.destinations.slice(0, 5);

      // Build OR query for multiple destinations
      const destinationFilter = destinationsToSearch
        .map(d => `destination.ilike.%${d}%`)
        .join(",");

      // Search attractions
      const { data: attractions, error: attrError } = await supabase
        .from("attractions")
        .select("id, name, description, picture, rating, destination, categories, latitude, longitude, tripadvisor_url, review_tags")
        .or(destinationFilter)
        .order("rating", { ascending: false })
        .limit(10);

      if (!attrError && attractions) {
        matchingAttractions = attractions;
        console.log(`Found ${attractions.length} attractions for region ${normalizedDetection.region}`);
      }

      // Search restaurants in the same destinations
      const { data: restaurants, error: restError } = await supabase
        .from("restaurants")
        .select("id, name, description, picture, rating, destination, cuisines, latitude, longitude, tripadvisor_url")
        .or(destinationFilter)
        .order("rating", { ascending: false })
        .limit(5);

      if (!restError && restaurants) {
        nearbyRestaurants = restaurants;
      }
    }

    // Construct response matching the Python RegionMapper output format
    const response = {
      success: true,
      // Vision detection results (like YOLO output)
      detection: normalizedDetection,
      // RegionMapper output
      region_info: regionInfo,
      // Suggested trip preferences (from RegionMapper)
      suggestions: {
        primary_trip_type: regionInfo.trip_types.primary,
        secondary_trip_types: regionInfo.trip_types.secondary,
        destinations: regionInfo.destinations.slice(0, 8),
        budget_modifier: regionInfo.budget_info.modifier,
        currency: regionInfo.budget_info.currency,
        best_seasons: regionInfo.season_info,
        // If we detected a specific city, put it first
        auto_destination: normalizedDetection.destination_city || regionInfo.destinations[0] || null
      },
      // Retrieved data from database (like hybrid_retrieval output)
      retrieved: {
        attractions: matchingAttractions,
        restaurants: nearbyRestaurants
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Region detection error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
