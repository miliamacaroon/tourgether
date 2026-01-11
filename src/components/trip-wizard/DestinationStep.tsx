import { MapPin, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { POPULAR_DESTINATIONS } from '@/types/trip';

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

      {/* Popular Destinations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Popular destinations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_DESTINATIONS.map((dest) => (
            <Button
              key={dest.name}
              variant={destination === dest.name ? "default" : "outline"}
              onClick={() => onDestinationChange(dest.name)}
              className="h-auto py-4 px-4 flex flex-col items-center gap-2 rounded-xl transition-all hover:scale-105"
            >
              <span className="text-2xl">{dest.image}</span>
              <span className="text-sm font-medium">{dest.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
