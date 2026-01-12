import { supabase } from "@/integrations/supabase/client";
import { TripData } from "@/types/trip";

export interface AttractionData {
  id: number;
  name: string;
  picture: string | null;
  rating: number | null;
  description?: string;
  categories?: string[];
}

export interface RestaurantData {
  id: number;
  name: string;
  picture: string | null;
  rating: number | null;
  cuisines?: string[];
}

export interface GeneratedItinerary {
  success: boolean;
  itinerary: string;
  destination: string;
  daysCount: number;
  attractions?: AttractionData[];
  restaurants?: RestaurantData[];
  sources?: {
    databaseAttractions: number;
    databaseRestaurants: number;
    webSources: number;
  };
}

interface StoredTripData extends Omit<TripData, 'startDate' | 'endDate'> {
  startDate: string;
  endDate: string;
  daysCount: number;
  predictedRegion?: string;
  sessionId?: string;
}

export const generateItinerary = async (tripData: StoredTripData): Promise<GeneratedItinerary> => {
  // Try the new RAG-powered function first
  const { data, error } = await supabase.functions.invoke('generate-travel-itinerary', {
    body: tripData,
  });

  if (error) {
    console.error('Error calling generate-travel-itinerary:', error);
    
    // Fallback to original function if the new one fails
    console.log('Falling back to original generate-itinerary function...');
    const fallbackResult = await supabase.functions.invoke('generate-itinerary', {
      body: tripData,
    });
    
    if (fallbackResult.error) {
      throw new Error(fallbackResult.error.message || 'Failed to generate itinerary');
    }
    
    if (fallbackResult.data.error) {
      throw new Error(fallbackResult.data.error);
    }
    
    return fallbackResult.data as GeneratedItinerary;
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as GeneratedItinerary;
};
