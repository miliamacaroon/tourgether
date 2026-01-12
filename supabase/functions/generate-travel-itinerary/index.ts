import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const TripRequestSchema = z.object({
  destination: z.string().min(1, "Destination is required").max(100, "Destination too long"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Invalid start date format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Invalid end date format"),
  budgetMin: z.number().min(0, "Budget must be positive").max(10000000, "Budget too high"),
  budgetMax: z.number().min(0, "Budget must be positive").max(10000000, "Budget too high"),
  currency: z.string().min(1).max(10),
  tripType: z.enum(['landmarks', 'historical_places', 'nature', 'entertainment']),
  pace: z.enum(['relaxed', 'moderate', 'fast_paced']),
  diningStyle: z.enum(['local', 'mixed', 'fine_dining']),
  travelers: z.number().int().min(1, "At least 1 traveler").max(50, "Too many travelers"),
  daysCount: z.number().int().min(1, "At least 1 day").max(60, "Trip too long"),
  predictedRegion: z.string().optional(),
}).refine(data => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget",
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date",
});

// Attraction type from hybrid search
interface Attraction {
  id: number;
  name: string;
  description: string | null;
  picture: string | null;
  destination: string;
  rating: number | null;
  categories: string[] | null;
  general_location: string | null;
  combined_score?: number;
}

interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  picture: string | null;
  destination: string;
  rating: number | null;
  cuisines: string[] | null;
  general_location: string | null;
  combined_score?: number;
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string, openaiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 3072,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Embedding error:', error);
    throw new Error(`Failed to generate embedding: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Fallback search using Tavily API
async function searchTavily(query: string, tavilyKey: string): Promise<TavilyResult[]> {
  console.log("Tavily fallback search for:", query);
  
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: tavilyKey,
      query: query,
      search_depth: 'advanced',
      include_answer: true,
      include_domains: ['tripadvisor.com', 'lonelyplanet.com', 'viator.com', 'booking.com', 'yelp.com'],
      max_results: 10,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Tavily error:', error);
    return [];
  }

  const data = await response.json();
  return data.results || [];
}

// Hybrid search for attractions and restaurants
async function hybridSearch(
  supabase: any,
  destination: string,
  tripType: string,
  openaiKey: string
): Promise<{ attractions: Attraction[]; restaurants: Restaurant[] }> {
  
  const searchQuery = `${tripType.replace('_', ' ')} attractions and activities in ${destination}`;
  console.log("Hybrid search query:", searchQuery);

  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(searchQuery, openaiKey);
    console.log("Generated embedding, length:", embedding.length);

    // Format embedding as PostgreSQL vector string
    const vectorString = `[${embedding.join(',')}]`;

    // Call hybrid search functions
    const [attractionsResult, restaurantsResult] = await Promise.all([
      supabase.rpc('hybrid_search_attractions', {
        query_text: searchQuery,
        query_embedding: vectorString,
        destination_filter: destination,
        match_count: 10,
        vector_weight: 0.6,
        text_weight: 0.4,
      }),
      supabase.rpc('hybrid_search_restaurants', {
        query_text: `restaurants and dining in ${destination}`,
        query_embedding: vectorString,
        destination_filter: destination,
        match_count: 5,
        vector_weight: 0.6,
        text_weight: 0.4,
      }),
    ]);

    if (attractionsResult.error) {
      console.error("Attractions search error:", attractionsResult.error);
    }
    if (restaurantsResult.error) {
      console.error("Restaurants search error:", restaurantsResult.error);
    }

    const attractions = attractionsResult.data || [];
    const restaurants = restaurantsResult.data || [];

    console.log(`Found ${attractions.length} attractions and ${restaurants.length} restaurants from hybrid search`);

    return { attractions, restaurants };
  } catch (error) {
    console.error("Hybrid search failed:", error);
    return { attractions: [], restaurants: [] };
  }
}

// Fallback to basic text search if no embeddings
async function textSearch(
  supabase: any,
  destination: string,
  tripType: string
): Promise<{ attractions: Attraction[]; restaurants: Restaurant[] }> {
  
  console.log("Falling back to text search for:", destination);

  const [attractionsResult, restaurantsResult] = await Promise.all([
    supabase
      .from('attractions')
      .select('id, name, description, picture, destination, rating, categories, general_location')
      .ilike('destination', `%${destination}%`)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(10),
    supabase
      .from('restaurants')
      .select('id, name, description, picture, destination, rating, cuisines, general_location')
      .ilike('destination', `%${destination}%`)
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(5),
  ]);

  const attractions = attractionsResult.data || [];
  const restaurants = restaurantsResult.data || [];

  console.log(`Text search found ${attractions.length} attractions and ${restaurants.length} restaurants`);

  return { attractions, restaurants };
}

// Build context from retrieved data
function buildContext(
  attractions: Attraction[], 
  restaurants: Restaurant[], 
  tavilyResults: TavilyResult[]
): string {
  let context = "";

  if (attractions.length > 0) {
    context += "## Retrieved Attractions from Database:\n";
    attractions.forEach((a, i) => {
      context += `${i + 1}. **${a.name}**`;
      if (a.rating) context += ` (Rating: ${a.rating}/5)`;
      context += "\n";
      if (a.description) context += `   ${a.description.substring(0, 300)}...\n`;
      if (a.categories?.length) context += `   Categories: ${a.categories.join(', ')}\n`;
      if (a.general_location) context += `   Location: ${a.general_location}\n`;
      context += "\n";
    });
  }

  if (restaurants.length > 0) {
    context += "\n## Retrieved Restaurants from Database:\n";
    restaurants.forEach((r, i) => {
      context += `${i + 1}. **${r.name}**`;
      if (r.rating) context += ` (Rating: ${r.rating}/5)`;
      context += "\n";
      if (r.description) context += `   ${r.description.substring(0, 200)}...\n`;
      if (r.cuisines?.length) context += `   Cuisines: ${r.cuisines.join(', ')}\n`;
      if (r.general_location) context += `   Location: ${r.general_location}\n`;
      context += "\n";
    });
  }

  if (tavilyResults.length > 0) {
    context += "\n## Additional Web Search Results:\n";
    tavilyResults.forEach((t, i) => {
      context += `${i + 1}. **${t.title}**\n`;
      context += `   ${t.content.substring(0, 250)}...\n`;
      context += `   Source: ${t.url}\n\n`;
    });
  }

  return context;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API keys
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    // Create Supabase client with service role for full access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Optional authentication
    const authHeader = req.headers.get('Authorization');
    let userId = 'anonymous';
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const anonClient = createClient(
          SUPABASE_URL,
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: claimsData } = await anonClient.auth.getClaims(token);
        if (claimsData?.claims?.sub) {
          userId = claimsData.claims.sub;
        }
      } catch (e) {
        console.log("Auth optional, continuing as anonymous");
      }
    }
    
    console.log("Processing RAG request for user:", userId);

    // Parse and validate input
    const rawData = await req.json();
    const validationResult = TripRequestSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid trip data', 
          details: validationResult.error.errors.map(e => e.message) 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tripData = validationResult.data;
    console.log("Generating RAG itinerary for:", tripData.destination, "type:", tripData.tripType);

    // Check for prediction-based region filter
    let regionFilter = tripData.predictedRegion;
    if (!regionFilter && rawData.sessionId) {
      // Check predictions table for region
      const { data: prediction } = await supabase
        .from('predictions')
        .select('predicted_region, predicted_location')
        .eq('session_id', rawData.sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (prediction?.predicted_region) {
        regionFilter = prediction.predicted_region;
        console.log("Using predicted region from vision:", regionFilter);
      }
    }

    // Step 1: Hybrid Retrieval (Vector + Full-Text Search)
    let { attractions, restaurants } = await hybridSearch(
      supabase, 
      tripData.destination, 
      tripData.tripType,
      OPENAI_API_KEY
    );

    // If hybrid search returns no results, try text search
    if (attractions.length === 0 && restaurants.length === 0) {
      console.log("Hybrid search returned no results, trying text search...");
      const textResults = await textSearch(supabase, tripData.destination, tripData.tripType);
      attractions = textResults.attractions;
      restaurants = textResults.restaurants;
    }

    // Step 2: Tavily Fallback if still no results
    let tavilyResults: TavilyResult[] = [];
    if (attractions.length === 0 && TAVILY_API_KEY) {
      console.log("No database results, falling back to Tavily web search...");
      const searchQuery = `best ${tripData.tripType.replace('_', ' ')} attractions and things to do in ${tripData.destination}`;
      tavilyResults = await searchTavily(searchQuery, TAVILY_API_KEY);
      
      // Also search for restaurants
      if (restaurants.length === 0) {
        const restaurantQuery = `best restaurants and places to eat in ${tripData.destination}`;
        const restaurantResults = await searchTavily(restaurantQuery, TAVILY_API_KEY);
        tavilyResults = [...tavilyResults, ...restaurantResults];
      }
    }

    // Build context from all sources
    const context = buildContext(attractions, restaurants, tavilyResults);
    
    const hasContext = attractions.length > 0 || restaurants.length > 0 || tavilyResults.length > 0;
    console.log("Context built, has data:", hasContext, "context length:", context.length);

    // Step 3: Generate itinerary with OpenAI
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

    const systemPrompt = `You are TourGether, an expert AI travel planner powered by RAG (Retrieval-Augmented Generation).

CRITICAL RULES:
1. You MUST ONLY recommend attractions, restaurants, and places that are mentioned in the provided CONTEXT.
2. Do NOT invent or hallucinate any places, names, or details that are not in the context.
3. If the context lacks information, say "Based on available information..." and only use what's provided.
4. Always cite the actual names from the context when making recommendations.
5. Include the actual ratings from the context when available.

Your itineraries must be:
- Based STRICTLY on the retrieved context below
- Practical with specific times for each activity
- Include restaurant recommendations from the context
- Provide estimated costs in the user's preferred currency
- Well-organized with clear day headers and time slots`;

    const userPrompt = `Create a detailed ${tripData.daysCount}-day travel itinerary for ${tripData.destination}.

**Trip Details:**
- Travelers: ${tripData.travelers} ${tripData.travelers === 1 ? 'person' : 'people'}
- Dates: ${tripData.startDate} to ${tripData.endDate}
- Budget: ${tripData.currency} ${tripData.budgetMin.toLocaleString()} - ${tripData.budgetMax.toLocaleString()} total
- Focus: ${tripTypeLabels[tripData.tripType] || tripData.tripType}
- Pace: ${paceLabels[tripData.pace] || tripData.pace}
- Dining preference: ${diningLabels[tripData.diningStyle] || tripData.diningStyle}
${regionFilter ? `- Region context: ${regionFilter.replace('_', ' ')}` : ''}

---
## RETRIEVED CONTEXT (USE ONLY THIS INFORMATION):
${context || "No specific data available for this destination. Please provide general travel recommendations based on your knowledge of " + tripData.destination + "."}
---

Using ONLY the information from the context above, create a day-by-day itinerary with:
1. Morning, afternoon, and evening activities (from the attractions in context)
2. Restaurant recommendations (from the restaurants in context)
3. Estimated costs for major activities and meals
4. Travel tips between locations
5. Alternative options for flexibility

Format each day clearly with:
## Day X: [Theme/Focus]
**Morning (8:00 AM - 12:00 PM)**
**Afternoon (12:00 PM - 6:00 PM)**
**Evening (6:00 PM onwards)**

Include practical details like opening hours and best times to visit.`;

    console.log("Calling OpenAI GPT-4o-mini for generation...");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4, // Lower temperature for more factual responses
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response received successfully");
    
    const itinerary = data.choices?.[0]?.message?.content || "Unable to generate itinerary. Please try again.";

    // Return with attraction data for frontend to display images
    return new Response(
      JSON.stringify({ 
        success: true,
        itinerary,
        destination: tripData.destination,
        daysCount: tripData.daysCount,
        attractions: attractions.map(a => ({
          id: a.id,
          name: a.name,
          picture: a.picture,
          rating: a.rating,
          description: a.description?.substring(0, 200),
          categories: a.categories,
        })),
        restaurants: restaurants.map(r => ({
          id: r.id,
          name: r.name,
          picture: r.picture,
          rating: r.rating,
          cuisines: r.cuisines,
        })),
        sources: {
          databaseAttractions: attractions.length,
          databaseRestaurants: restaurants.length,
          webSources: tavilyResults.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-travel-itinerary:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate itinerary" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
