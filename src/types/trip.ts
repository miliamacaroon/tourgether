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
  { name: 'Tokyo', region: 'east_asia', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop' },
  { name: 'Paris', region: 'europe', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' },
  { name: 'Bali', region: 'south_southeast_asia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=300&fit=crop' },
  { name: 'New York', region: 'north_america', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
  { name: 'Rome', region: 'europe', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop' },
  { name: 'Sydney', region: 'oceania', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=300&fit=crop' },
  { name: 'Dubai', region: 'middle_east', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop' },
  { name: 'Bangkok', region: 'south_southeast_asia', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=300&fit=crop' },
];
