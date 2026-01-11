import { supabase } from "@/integrations/supabase/client";
import { TripData } from "@/types/trip";

export interface GeneratedItinerary {
  success: boolean;
  itinerary: string;
  destination: string;
  daysCount: number;
}

interface StoredTripData extends Omit<TripData, 'startDate' | 'endDate'> {
  startDate: string;
  endDate: string;
  daysCount: number;
}

export const generateItinerary = async (tripData: StoredTripData): Promise<GeneratedItinerary> => {
  const { data, error } = await supabase.functions.invoke('generate-itinerary', {
    body: tripData,
  });

  if (error) {
    console.error('Error calling generate-itinerary:', error);
    throw new Error(error.message || 'Failed to generate itinerary');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as GeneratedItinerary;
};
