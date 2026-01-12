import { MapPin, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { POPULAR_DESTINATIONS } from '@/types/trip';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface DestinationStepProps {
  destination: string;
  onDestinationChange: (value: string) => void;
}

export const DestinationStep = ({ destination, onDestinationChange }: DestinationStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <MapPin className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">Step 1</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Where do you want to go?
        </h2>
        <p className="text-muted-foreground text-lg">
          Enter your dream destination and start planning your adventure
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          placeholder="e.g. Tokyo, Paris, Bali..."
          className="h-14 pl-12 pr-4 text-lg rounded-2xl bg-card border-2 border-border focus:border-primary transition-colors"
        />
      </div>

      {/* Popular Destinations Carousel */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Popular destinations</span>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {POPULAR_DESTINATIONS.map((dest) => (
              <CarouselItem key={dest.name} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4">
                <button
                  onClick={() => onDestinationChange(dest.name)}
                  className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden group transition-all duration-300 ${
                    destination === dest.name 
                      ? 'ring-3 ring-primary ring-offset-2 ring-offset-background scale-[1.02]' 
                      : 'hover:scale-105'
                  }`}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm md:text-base drop-shadow-lg">
                      {dest.name}
                    </p>
                  </div>
                  {destination === dest.name && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4" />
          <CarouselNext className="hidden sm:flex -right-4" />
        </Carousel>
      </div>
    </div>
  );
};
