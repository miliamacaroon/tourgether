import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AttractionData {
  ID: number;
  NAME: string;
  TRIPADVISOR_URL?: string;
  ATTRACTION_URL?: string;
  PICTURE?: string;
  RATING?: number;
  DESTINATION: string;
  DESCRIPTION?: string;
  LATITUDE?: number;
  LONGITUDE?: number;
  GENERAL_LOCATION?: string;
  NUMBER_OF_REVIEWS?: number;
  REVIEW_TAGS?: string[];
  CATEGORIES?: string[];
}

interface RestaurantData {
  ID: number;
  NAME: string;
  TRIPADVISOR_URL?: string;
  RESTAURANT_URL?: string;
  PICTURE?: string;
  RATING?: number;
  DESTINATION: string;
  DESCRIPTION?: string;
  LATITUDE?: number;
  LONGITUDE?: number;
  GENERAL_LOCATION?: string;
  NUMBER_OF_REVIEWS?: number;
  REVIEW_TAGS?: string[];
  CUISINES?: string[];
  DISHES?: string[];
  MEAL_TYPES?: string[];
  FEATURES?: string[];
  HOURS?: Record<string, unknown>;
}

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

function createSearchableText(item: AttractionData | RestaurantData, type: "attraction" | "restaurant"): string {
  const parts = [item.NAME, item.DESTINATION, item.DESCRIPTION || ""];
  
  if (type === "attraction") {
    const attraction = item as AttractionData;
    if (attraction.CATEGORIES) parts.push(attraction.CATEGORIES.join(" "));
    if (attraction.REVIEW_TAGS) parts.push(attraction.REVIEW_TAGS.join(" "));
  } else {
    const restaurant = item as RestaurantData;
    if (restaurant.CUISINES) parts.push(restaurant.CUISINES.join(" "));
    if (restaurant.DISHES) parts.push(restaurant.DISHES.join(" "));
    if (restaurant.REVIEW_TAGS) parts.push(restaurant.REVIEW_TAGS.join(" "));
  }
  
  return parts.filter(Boolean).join(" ").slice(0, 8000);
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

    const { type, data, generateEmbeddings = true, batchSize = 50 } = await req.json();

    if (!type || !["attractions", "restaurants"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be 'attractions' or 'restaurants'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data || !Array.isArray(data)) {
      return new Response(
        JSON.stringify({ error: "Data must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${data.length} ${type} records...`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process in batches
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)}`);

      const processedBatch = await Promise.all(
        batch.map(async (item: AttractionData | RestaurantData) => {
          try {
            let embedding: number[] | null = null;
            
            if (generateEmbeddings) {
              const searchText = createSearchableText(item, type === "attractions" ? "attraction" : "restaurant");
              embedding = await generateEmbedding(searchText, LOVABLE_API_KEY);
            }

            if (type === "attractions") {
              const attraction = item as AttractionData;
              return {
                id: attraction.ID,
                name: attraction.NAME,
                tripadvisor_url: attraction.TRIPADVISOR_URL,
                attraction_url: attraction.ATTRACTION_URL,
                picture: attraction.PICTURE,
                rating: attraction.RATING,
                destination: attraction.DESTINATION,
                description: attraction.DESCRIPTION,
                latitude: attraction.LATITUDE,
                longitude: attraction.LONGITUDE,
                general_location: attraction.GENERAL_LOCATION,
                number_of_reviews: attraction.NUMBER_OF_REVIEWS || 0,
                review_tags: attraction.REVIEW_TAGS || [],
                categories: attraction.CATEGORIES || [],
                embedding: embedding ? `[${embedding.join(",")}]` : null,
              };
            } else {
              const restaurant = item as RestaurantData;
              return {
                id: restaurant.ID,
                name: restaurant.NAME,
                tripadvisor_url: restaurant.TRIPADVISOR_URL,
                restaurant_url: restaurant.RESTAURANT_URL,
                picture: restaurant.PICTURE,
                rating: restaurant.RATING,
                destination: restaurant.DESTINATION,
                description: restaurant.DESCRIPTION,
                latitude: restaurant.LATITUDE,
                longitude: restaurant.LONGITUDE,
                general_location: restaurant.GENERAL_LOCATION,
                number_of_reviews: restaurant.NUMBER_OF_REVIEWS || 0,
                review_tags: restaurant.REVIEW_TAGS || [],
                cuisines: restaurant.CUISINES || [],
                dishes: restaurant.DISHES || [],
                meal_types: restaurant.MEAL_TYPES || [],
                features: restaurant.FEATURES || [],
                hours: restaurant.HOURS || null,
                embedding: embedding ? `[${embedding.join(",")}]` : null,
              };
            }
          } catch (error) {
            console.error(`Error processing item ${item.ID}:`, error);
            return null;
          }
        })
      );

      const validRecords = processedBatch.filter(Boolean);
      
      if (validRecords.length > 0) {
        const tableName = type === "attractions" ? "attractions" : "restaurants";
        const { error: insertError } = await supabase
          .from(tableName)
          .upsert(validRecords, { onConflict: "id" });

        if (insertError) {
          console.error(`Insert error for batch:`, insertError);
          errorCount += validRecords.length;
          errors.push(insertError.message);
        } else {
          successCount += validRecords.length;
        }
      }

      errorCount += batch.length - validRecords.length;

      // Small delay between batches to avoid rate limiting
      if (generateEmbeddings && i + batchSize < data.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Import complete: ${successCount} success, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: successCount,
        errors: errorCount,
        errorMessages: errors.slice(0, 10),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
