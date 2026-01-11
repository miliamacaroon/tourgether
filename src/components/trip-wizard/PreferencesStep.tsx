import { Compass } from 'lucide-react';
import { TripType, TripPace, DiningStyle, TRIP_TYPE_OPTIONS, PACE_OPTIONS, DINING_OPTIONS } from '@/types/trip';
import { cn } from '@/lib/utils';

interface PreferencesStepProps {
  tripType: TripType;
  pace: TripPace;
  diningStyle: DiningStyle;
  onTripTypeChange: (value: TripType) => void;
  onPaceChange: (value: TripPace) => void;
  onDiningStyleChange: (value: DiningStyle) => void;
}

export const PreferencesStep = ({
  tripType,
  pace,
  diningStyle,
  onTripTypeChange,
  onPaceChange,
  onDiningStyleChange,
}: PreferencesStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Compass className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">Step 4</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          What kind of trip?
        </h2>
        <p className="text-muted-foreground text-lg">
          Tell us about your travel style and preferences
        </p>
      </div>

      {/* Trip Type */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Trip Focus</label>
        <div className="grid grid-cols-2 gap-3">
          {TRIP_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onTripTypeChange(option.value)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]",
                tripType === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <span className="text-2xl">{option.icon}</span>
              <p className="font-semibold mt-2">{option.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pace */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Trip Pace</label>
        <div className="flex gap-3">
          {PACE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onPaceChange(option.value)}
              className={cn(
                "flex-1 p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02]",
                pace === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <p className="font-semibold">{option.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Dining */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">Dining Preference</label>
        <div className="flex gap-3">
          {DINING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onDiningStyleChange(option.value)}
              className={cn(
                "flex-1 p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02]",
                diningStyle === option.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <span className="text-2xl">{option.icon}</span>
              <p className="font-semibold mt-2 text-sm">{option.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
