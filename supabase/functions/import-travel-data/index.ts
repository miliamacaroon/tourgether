import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// External Supabase credentials (source database)
const EXTERNAL_SUPABASE_URL = "https://rsuqvgdnpgeaouacctst.supabase.co";
const EXTERNAL_SUPABASE_KEY = "sb_publishable_TnveSiGzvzXaJAMeSqbtqw_GJoC7OpP";

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

// Helper to get value from object with case-insensitive key lookup
function getField(obj: any, fieldName: string): any {
  const lowerField = fieldName.toLowerCase();
  const upperField = fieldName.toUpperCase();
  return obj[fieldName] ?? obj[lowerField] ?? obj[upperField] ?? obj[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)];
}

function createSearchableText(item: any, type: "attraction" | "restaurant"): string {
  const name = getField(item, 'name') || getField(item, 'NAME');
  const destination = getField(item, 'destination') || getField(item, 'DESTINATION');
  const description = getField(item, 'description') || getField(item, 'DESCRIPTION');
  const parts = [name, destination, description || ""];
  
  if (type === "attraction") {
    const categories = getField(item, 'categories') || getField(item, 'CATEGORIES');
    const reviewTags = getField(item, 'review_tags') || getField(item, 'REVIEW_TAGS');
    if (categories) parts.push(Array.isArray(categories) ? categories.join(" ") : categories);
    if (reviewTags) parts.push(Array.isArray(reviewTags) ? reviewTags.join(" ") : reviewTags);
  } else {
    const cuisines = getField(item, 'cuisines') || getField(item, 'CUISINES');
    const dishes = getField(item, 'dishes') || getField(item, 'DISHES');
    const reviewTags = getField(item, 'review_tags') || getField(item, 'REVIEW_TAGS');
    if (cuisines) parts.push(Array.isArray(cuisines) ? cuisines.join(" ") : cuisines);
    if (dishes) parts.push(Array.isArray(dishes) ? dishes.join(" ") : dishes);
    if (reviewTags) parts.push(Array.isArray(reviewTags) ? reviewTags.join(" ") : reviewTags);
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

    // Lovable Cloud Supabase (destination)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const localSupabase = createClient(supabaseUrl, supabaseKey);

    // External Supabase (source)
    const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_KEY);

    const { generateEmbeddings = true, batchSize = 25, destination } = await req.json();

    console.log("Starting import from external Supabase...");
    console.log("Destination filter:", destination || "all");

    // Fetch attractions from external Supabase
    let attractionsQuery = externalSupabase
      .from("attractions")
      .select("*");
    
    if (destination) {
      attractionsQuery = attractionsQuery.or(`destination.ilike.%${destination}%,DESTINATION.ilike.%${destination}%`);
    }
    
    const { data: externalAttractions, error: attractionsError } = await attractionsQuery.limit(100);

    if (attractionsError) {
      console.error("Error fetching attractions:", attractionsError);
      // Continue without throwing - just log and skip attractions
      console.log("Continuing without attractions...");
    }

    console.log(`Fetched ${externalAttractions?.length || 0} attractions from external Supabase`);
    if (externalAttractions && externalAttractions.length > 0) {
      console.log("Sample attraction keys:", Object.keys(externalAttractions[0]));
      console.log("Sample attraction data:", JSON.stringify(externalAttractions[0]).slice(0, 500));
    }

    // Try restaurant_embeddings first, fall back to restaurants
    let externalRestaurants: any[] = [];
    let restaurantsError: any = null;
    
    // Try restaurant_embeddings table first
    const { data: restaurantEmbeddings, error: embeddingsError } = await externalSupabase
      .from("restaurant_embeddings")
      .select("*")
      .limit(50);
    
    if (!embeddingsError && restaurantEmbeddings && restaurantEmbeddings.length > 0) {
      console.log("Found restaurant_embeddings table");
      externalRestaurants = restaurantEmbeddings;
    } else {
      // Fall back to restaurants table
      const { data: restaurants, error: restError } = await externalSupabase
        .from("restaurants")
        .select("*")
        .limit(50);
      
      if (restError) {
        console.log("No restaurants table found either, skipping restaurants");
        restaurantsError = restError;
      } else {
        externalRestaurants = restaurants || [];
      }
    }

    console.log(`Fetched ${externalRestaurants?.length || 0} restaurants from external Supabase`);
    if (externalRestaurants?.length > 0) {
      console.log("Sample restaurant keys:", Object.keys(externalRestaurants[0]));
    }

    let attractionsImported = 0;
    let restaurantsImported = 0;
    const errors: string[] = [];

    // Process attractions in batches
    if (externalAttractions && externalAttractions.length > 0) {
      for (let i = 0; i < externalAttractions.length; i += batchSize) {
        const batch = externalAttractions.slice(i, i + batchSize);
        console.log(`Processing attractions batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(externalAttractions.length / batchSize)}`);

        const processedBatch = await Promise.all(
          batch.map(async (item: any) => {
            try {
              let embedding: number[] | null = null;
              
              if (generateEmbeddings) {
                const searchText = createSearchableText(item, "attraction");
                embedding = await generateEmbedding(searchText, LOVABLE_API_KEY);
              }

              // Handle both lowercase and uppercase column names
              return {
                id: getField(item, 'id') || getField(item, 'ID'),
                name: getField(item, 'name') || getField(item, 'NAME'),
                tripadvisor_url: getField(item, 'tripadvisor_url') || getField(item, 'TRIPADVISOR_URL'),
                attraction_url: getField(item, 'attraction_url') || getField(item, 'ATTRACTION_URL'),
                picture: getField(item, 'picture') || getField(item, 'PICTURE'),
                rating: getField(item, 'rating') || getField(item, 'RATING'),
                destination: getField(item, 'destination') || getField(item, 'DESTINATION'),
                description: getField(item, 'description') || getField(item, 'DESCRIPTION'),
                latitude: getField(item, 'latitude') || getField(item, 'LATITUDE'),
                longitude: getField(item, 'longitude') || getField(item, 'LONGITUDE'),
                general_location: getField(item, 'general_location') || getField(item, 'GENERAL_LOCATION'),
                number_of_reviews: getField(item, 'number_of_reviews') || getField(item, 'NUMBER_OF_REVIEWS') || 0,
                review_tags: getField(item, 'review_tags') || getField(item, 'REVIEW_TAGS') || [],
                categories: getField(item, 'categories') || getField(item, 'CATEGORIES') || [],
                embedding: embedding ? `[${embedding.join(",")}]` : null,
              };
            } catch (error) {
              console.error(`Error processing attraction:`, error);
              return null;
            }
          })
        );

        const validRecords = processedBatch.filter(Boolean);
        
        if (validRecords.length > 0) {
          const { error: insertError } = await localSupabase
            .from("attractions")
            .upsert(validRecords, { onConflict: "id" });

          if (insertError) {
            console.error(`Insert error for attractions batch:`, insertError);
            errors.push(`Attractions: ${insertError.message}`);
          } else {
            attractionsImported += validRecords.length;
          }
        }

        // Delay between batches
        if (generateEmbeddings && i + batchSize < externalAttractions.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // Process restaurants in batches
    if (externalRestaurants && externalRestaurants.length > 0) {
      for (let i = 0; i < externalRestaurants.length; i += batchSize) {
        const batch = externalRestaurants.slice(i, i + batchSize);
        console.log(`Processing restaurants batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(externalRestaurants.length / batchSize)}`);

        const processedBatch = await Promise.all(
          batch.map(async (item: any) => {
            try {
              let embedding: number[] | null = null;
              
              if (generateEmbeddings) {
                const searchText = createSearchableText(item, "restaurant");
                embedding = await generateEmbedding(searchText, LOVABLE_API_KEY);
              }

              return {
                id: item.id,
                name: item.name,
                tripadvisor_url: item.tripadvisor_url,
                restaurant_url: item.restaurant_url,
                picture: item.picture,
                rating: item.rating,
                destination: item.destination,
                description: item.description,
                latitude: item.latitude,
                longitude: item.longitude,
                general_location: item.general_location,
                number_of_reviews: item.number_of_reviews || 0,
                review_tags: item.review_tags || [],
                cuisines: item.cuisines || [],
                dishes: item.dishes || [],
                meal_types: item.meal_types || [],
                features: item.features || [],
                hours: item.hours || null,
                embedding: embedding ? `[${embedding.join(",")}]` : null,
              };
            } catch (error) {
              console.error(`Error processing restaurant ${item.id}:`, error);
              return null;
            }
          })
        );

        const validRecords = processedBatch.filter(Boolean);
        
        if (validRecords.length > 0) {
          const { error: insertError } = await localSupabase
            .from("restaurants")
            .upsert(validRecords, { onConflict: "id" });

          if (insertError) {
            console.error(`Insert error for restaurants batch:`, insertError);
            errors.push(`Restaurants: ${insertError.message}`);
          } else {
            restaurantsImported += validRecords.length;
          }
        }

        // Delay between batches
        if (generateEmbeddings && i + batchSize < externalRestaurants.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    console.log(`Import complete: ${attractionsImported} attractions, ${restaurantsImported} restaurants`);

    return new Response(
      JSON.stringify({
        success: true,
        attractionsImported,
        restaurantsImported,
        totalImported: attractionsImported + restaurantsImported,
        errors: errors.length > 0 ? errors : undefined,
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