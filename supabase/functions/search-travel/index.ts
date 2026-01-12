import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
        dimensions: 768,
      }),
    });

    if (!response.ok) {
      console.error("Embedding error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error("Embedding generation failed:", error);
    return null;
  }
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

    const { 
      query, 
      type = "both", 
      destination, 
      cuisines, 
      categories,
      minRating,
      limit = 10,
      useSemanticSearch = true
    } = await req.json();

    if (!query && !destination) {
      return new Response(
        JSON.stringify({ error: "Either query or destination is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Searching for "${query}" in ${type}, destination: ${destination || "any"}`);

    const results: { attractions: unknown[]; restaurants: unknown[] } = {
      attractions: [],
      restaurants: [],
    };

    // Generate embedding for semantic search
    let embedding: number[] | null = null;
    if (query && useSemanticSearch) {
      embedding = await generateEmbedding(query, LOVABLE_API_KEY);
    }

    // Search attractions
    if (type === "both" || type === "attractions") {
      if (embedding) {
        // Semantic search using the database function
        const { data: attractionData, error: attractionError } = await supabase.rpc(
          "search_attractions",
          {
            query_embedding: `[${embedding.join(",")}]`,
            match_threshold: 0.3,
            match_count: limit,
            filter_destination: destination || null,
          }
        );

        if (attractionError) {
          console.error("Attraction search error:", attractionError);
        } else {
          let filtered = attractionData || [];
          
          // Apply additional filters
          if (categories && categories.length > 0) {
            filtered = filtered.filter((a: { categories?: string[] }) => 
              a.categories?.some((c: string) => categories.includes(c))
            );
          }
          if (minRating) {
            filtered = filtered.filter((a: { rating?: number }) => (a.rating || 0) >= minRating);
          }
          
          results.attractions = filtered;
        }
      } else {
        // Fallback to text-based search
        let query_builder = supabase
          .from("attractions")
          .select("id, name, description, picture, rating, destination, categories, latitude, longitude")
          .limit(limit);

        if (destination) {
          query_builder = query_builder.ilike("destination", `%${destination}%`);
        }
        if (minRating) {
          query_builder = query_builder.gte("rating", minRating);
        }
        if (categories && categories.length > 0) {
          query_builder = query_builder.overlaps("categories", categories);
        }

        const { data, error } = await query_builder.order("rating", { ascending: false });
        
        if (error) {
          console.error("Attraction query error:", error);
        } else {
          results.attractions = data || [];
        }
      }
    }

    // Search restaurants
    if (type === "both" || type === "restaurants") {
      if (embedding) {
        // Semantic search using the database function
        const { data: restaurantData, error: restaurantError } = await supabase.rpc(
          "search_restaurants",
          {
            query_embedding: `[${embedding.join(",")}]`,
            match_threshold: 0.3,
            match_count: limit,
            filter_destination: destination || null,
            filter_cuisines: cuisines || null,
          }
        );

        if (restaurantError) {
          console.error("Restaurant search error:", restaurantError);
        } else {
          let filtered = restaurantData || [];
          
          if (minRating) {
            filtered = filtered.filter((r: { rating?: number }) => (r.rating || 0) >= minRating);
          }
          
          results.restaurants = filtered;
        }
      } else {
        // Fallback to text-based search
        let query_builder = supabase
          .from("restaurants")
          .select("id, name, description, picture, rating, destination, cuisines, latitude, longitude")
          .limit(limit);

        if (destination) {
          query_builder = query_builder.ilike("destination", `%${destination}%`);
        }
        if (minRating) {
          query_builder = query_builder.gte("rating", minRating);
        }
        if (cuisines && cuisines.length > 0) {
          query_builder = query_builder.overlaps("cuisines", cuisines);
        }

        const { data, error } = await query_builder.order("rating", { ascending: false });
        
        if (error) {
          console.error("Restaurant query error:", error);
        } else {
          results.restaurants = data || [];
        }
      }
    }

    console.log(`Found ${results.attractions.length} attractions, ${results.restaurants.length} restaurants`);

    return new Response(
      JSON.stringify({
        success: true,
        query,
        results,
        totalResults: results.attractions.length + results.restaurants.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
