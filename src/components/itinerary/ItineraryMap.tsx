import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AttractionData, RestaurantData } from '@/services/itineraryService';

interface MapMarker {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: 'attraction' | 'restaurant';
  dayNumber: number;
  index: number;
}

interface ItineraryMapProps {
  attractions: AttractionData[];
  restaurants: RestaurantData[];
  daysCount: number;
  onMarkerClick?: (markerId: number, type: 'attraction' | 'restaurant') => void;
  destination: string;
}

// Create custom numbered marker icons
const createNumberedIcon = (number: number, type: 'attraction' | 'restaurant') => {
  const color = type === 'attraction' ? '#D946EF' : '#F59E0B'; // Primary pink or amber
  const html = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-weight: bold;
        font-size: 12px;
        font-family: system-ui, sans-serif;
      ">${number}</span>
    </div>
  `;
  
  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const ItineraryMap = ({ 
  attractions, 
  restaurants, 
  daysCount, 
  onMarkerClick,
  destination 
}: ItineraryMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Distribute attractions and restaurants across days (same logic as ItineraryContent)
  const getMarkersWithDays = useCallback((): MapMarker[] => {
    const markers: MapMarker[] = [];
    let globalIndex = 1;

    // Distribute attractions across days
    const attractionsPerDay = Math.ceil(attractions.length / daysCount);
    
    for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
      const dayAttractions = attractions.slice(
        dayIndex * attractionsPerDay,
        (dayIndex + 1) * attractionsPerDay
      ).slice(0, 3);

      dayAttractions.forEach((attraction) => {
        // We need lat/lng - for now use mock coordinates based on destination
        // In production, these would come from the database
        if (attraction.id) {
          markers.push({
            id: attraction.id,
            name: attraction.name,
            lat: 0,
            lng: 0,
            type: 'attraction',
            dayNumber: dayIndex + 1,
            index: globalIndex++,
          });
        }
      });
    }

    // Add restaurants
    const restaurantsPerDay = Math.ceil(restaurants.length / daysCount);
    
    for (let dayIndex = 0; dayIndex < daysCount; dayIndex++) {
      const dayRestaurants = restaurants.slice(
        dayIndex * restaurantsPerDay,
        (dayIndex + 1) * restaurantsPerDay
      ).slice(0, 2);

      dayRestaurants.forEach((restaurant) => {
        if (restaurant.id) {
          markers.push({
            id: restaurant.id,
            name: restaurant.name,
            lat: 0,
            lng: 0,
            type: 'restaurant',
            dayNumber: dayIndex + 1,
            index: globalIndex++,
          });
        }
      });
    }

    return markers;
  }, [attractions, restaurants, daysCount]);

  // Geocode destination to get center coordinates
  const geocodeDestination = useCallback(async (dest: string): Promise<[number, number]> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dest)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    // Default to a central location if geocoding fails
    return [40.7128, -74.006]; // NYC as fallback
  }, []);

  // Generate mock coordinates around destination center
  const generateCoordinates = useCallback((center: [number, number], index: number, total: number): [number, number] => {
    const radius = 0.02; // ~2km radius
    const angle = (index / total) * 2 * Math.PI;
    const offsetLat = radius * Math.cos(angle) * (0.5 + Math.random() * 0.5);
    const offsetLng = radius * Math.sin(angle) * (0.5 + Math.random() * 0.5);
    return [center[0] + offsetLat, center[1] + offsetLng];
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const initMap = async () => {
      const center = await geocodeDestination(destination);
      
      if (mapRef.current) {
        mapRef.current.remove();
      }

      mapRef.current = L.map(mapContainer.current!, {
        center,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add markers
      const markerData = getMarkersWithDays();
      const bounds: L.LatLngBounds = L.latLngBounds([]);

      markerData.forEach((marker, idx) => {
        const coords = generateCoordinates(center, idx, markerData.length);
        const icon = createNumberedIcon(marker.index, marker.type);
        
        const leafletMarker = L.marker(coords, { icon })
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="min-width: 150px;">
              <strong style="font-size: 14px;">${marker.name}</strong>
              <br/>
              <span style="color: #666; font-size: 12px;">
                Day ${marker.dayNumber} • ${marker.type === 'attraction' ? '🏛️ Attraction' : '🍽️ Restaurant'}
              </span>
            </div>
          `);

        leafletMarker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(marker.id, marker.type);
          }
        });

        markersRef.current.push(leafletMarker);
        bounds.extend(coords);
      });

      // Fit map to show all markers
      if (markerData.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [destination, attractions, restaurants, daysCount, geocodeDestination, generateCoordinates, getMarkersWithDays, onMarkerClick]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-border shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border z-[1000]">
        <p className="text-xs font-semibold text-foreground mb-2">Legend</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Attractions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">Restaurants</span>
          </div>
        </div>
      </div>

      {/* Click hint */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-border z-[1000]">
        <p className="text-xs text-muted-foreground">
          Click a marker to scroll to that activity
        </p>
      </div>
    </div>
  );
};

export default ItineraryMap;
