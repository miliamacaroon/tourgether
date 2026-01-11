export interface TripData {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  tripType: TripType;
  pace: TripPace;
  diningStyle: DiningStyle;
  travelers: number;
}

export type TripType = 'landmarks' | 'historical_places' | 'nature' | 'entertainment';
export type TripPace = 'relaxed' | 'moderate' | 'fast_paced';
export type DiningStyle = 'local' | 'mixed' | 'fine_dining';

export const TRIP_TYPE_OPTIONS: { value: TripType; label: string; icon: string; description: string }[] = [
  { value: 'landmarks', label: 'Landmarks', icon: '🏛️', description: 'Famous monuments & iconic spots' },
  { value: 'historical_places', label: 'Historical', icon: '🏰', description: 'Museums, ancient sites & heritage' },
  { value: 'nature', label: 'Nature', icon: '🌿', description: 'Parks, beaches & outdoor adventures' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎭', description: 'Shows, nightlife & attractions' },
];

export const PACE_OPTIONS: { value: TripPace; label: string; description: string }[] = [
  { value: 'relaxed', label: 'Relaxed', description: 'Take it slow, enjoy the moment' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced mix of activities & rest' },
  { value: 'fast_paced', label: 'Fast-paced', description: 'Pack in as much as possible' },
];

export const DINING_OPTIONS: { value: DiningStyle; label: string; icon: string }[] = [
  { value: 'local', label: 'Local Cuisine', icon: '🍜' },
  { value: 'mixed', label: 'Mix of Local & International', icon: '🍽️' },
  { value: 'fine_dining', label: 'Fine Dining', icon: '🍷' },
];

export const CURRENCY_OPTIONS = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'MYR', 'THB', 
  'CNY', 'KRW', 'HKD', 'NZD', 'CHF', 'AED', 'INR', 'IDR'
];

export const POPULAR_DESTINATIONS = [
  { name: 'Tokyo', region: 'east_asia', image: '🗼' },
  { name: 'Paris', region: 'europe', image: '🗼' },
  { name: 'Bali', region: 'south_southeast_asia', image: '🏝️' },
  { name: 'New York', region: 'north_america', image: '🗽' },
  { name: 'Rome', region: 'europe', image: '🏛️' },
  { name: 'Sydney', region: 'oceania', image: '🌉' },
  { name: 'Dubai', region: 'middle_east', image: '🏙️' },
  { name: 'Bangkok', region: 'south_southeast_asia', image: '🛕' },
];
