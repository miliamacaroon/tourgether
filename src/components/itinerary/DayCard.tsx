import { Star, MapPin, Clock, Sparkles, ChevronRight, Utensils } from 'lucide-react';
import { AttractionData, RestaurantData } from '@/services/itineraryService';
import { cn } from '@/lib/utils';

interface DayCardProps {
  dayNumber: number;
  title: string;
  attractions: AttractionData[];
  restaurants: RestaurantData[];
  children: React.ReactNode;
  totalDays: number;
}

const DayCard = ({ dayNumber, title, attractions, restaurants, children, totalDays }: DayCardProps) => {
  // Vibrant gradient colors for each day - cycling through the palette
  const dayColors = [
    'from-primary via-primary/80 to-accent-foreground',
    'from-accent-foreground via-primary to-primary/80',
    'from-primary/90 via-accent-foreground/80 to-primary',
    'from-accent-foreground/90 via-primary/90 to-accent-foreground/80',
    'from-primary via-accent-foreground to-primary/90',
  ];
  
  const gradientClass = dayColors[(dayNumber - 1) % dayColors.length];
  
  return (
    <div className="relative group animate-fade-in-up" style={{ animationDelay: `${dayNumber * 0.1}s` }}>
      {/* Connection line to next day */}
      {dayNumber < totalDays && (
        <div className="absolute left-8 top-full h-8 w-0.5 bg-gradient-to-b from-primary/50 to-transparent z-10" />
      )}
      
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1">
        {/* Decorative corner gradient */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-accent-foreground/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Header with gradient */}
        <div className={cn(
          "relative bg-gradient-to-r p-6 text-primary-foreground overflow-hidden",
          gradientClass
        )}>
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          {/* Decorative elements */}
          <div className="absolute top-2 right-4 flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Sparkles 
                key={i} 
                className={cn(
                  "w-3 h-3 text-primary-foreground/40",
                  i === 1 && "animate-pulse"
                )}
              />
            ))}
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            {/* Day number badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex flex-col items-center justify-center border border-primary-foreground/30 shadow-lg">
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">Day</span>
                <span className="text-2xl font-bold">{dayNumber}</span>
              </div>
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary-foreground/50 animate-pulse-glow" />
            </div>
            
            {/* Title and info */}
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold drop-shadow-md">{title}</h2>
              <div className="flex items-center gap-2 mt-1 text-primary-foreground/80">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Full day adventure</span>
              </div>
            </div>
            
            {/* Attractions count badge */}
            {attractions.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-foreground/30">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{attractions.length} places</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Attractions gallery */}
        {attractions.length > 0 && (
          <div className="p-4 bg-gradient-to-b from-muted/50 to-transparent border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <Star className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Today's Attractions</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attractions.map((attraction, index) => (
                <div 
                  key={attraction.id}
                  data-marker-id={`attraction-${attraction.id}`}
                  className="group/card relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image container */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {attraction.picture ? (
                      <>
                        <img 
                          src={attraction.picture} 
                          alt={attraction.name}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Hover reveal overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <MapPin className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Rating badge */}
                    {attraction.rating && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg border border-border/50">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold">{attraction.rating}</span>
                      </div>
                    )}
                    
                    {/* Index badge */}
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                      {index + 1}
                    </div>
                    
                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold text-sm line-clamp-1 drop-shadow-lg group-hover/card:text-primary-foreground transition-colors">
                        {attraction.name}
                      </p>
                      {attraction.categories && attraction.categories.length > 0 && (
                        <p className="text-white/70 text-xs mt-0.5 line-clamp-1">
                          {attraction.categories.slice(0, 2).map(cat => String(cat).replace(/[\[\]']/g, '').trim()).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Restaurants gallery */}
        {restaurants.length > 0 && (
          <div className="p-4 bg-gradient-to-b from-accent/5 to-transparent border-b border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                <Utensils className="w-3 h-3 text-accent-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">Today's Dining</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {restaurants.map((restaurant, index) => (
                <div 
                  key={restaurant.id}
                  data-marker-id={`restaurant-${restaurant.id}`}
                  className="group/card relative overflow-hidden rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image container */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {restaurant.picture ? (
                      <>
                        <img 
                          src={restaurant.picture} 
                          alt={restaurant.name}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Hover reveal overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-accent/80 via-accent/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Rating badge */}
                    {restaurant.rating && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg border border-border/50">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold">{restaurant.rating}</span>
                      </div>
                    )}
                    
                    {/* Cuisine badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-accent/90 text-accent-foreground flex items-center justify-center text-xs font-medium shadow-lg">
                      <Utensils className="w-3 h-3 mr-1" />
                      Dining
                    </div>
                    
                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold text-sm line-clamp-1 drop-shadow-lg">
                        {restaurant.name}
                      </p>
                      {restaurant.cuisines && restaurant.cuisines.length > 0 && (
                        <p className="text-white/70 text-xs mt-0.5 line-clamp-1">
                          {restaurant.cuisines.slice(0, 3).join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Content section */}
        <div className="p-6 md:p-8 relative">
          {/* Decorative vertical line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent rounded-full hidden md:block" />
          
          <div className="md:ml-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayCard;
