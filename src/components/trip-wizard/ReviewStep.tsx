import { MapPin, CalendarDays, Wallet, Compass, Users, Utensils, Timer, CheckCircle } from 'lucide-react';
import { TripData, TRIP_TYPE_OPTIONS, PACE_OPTIONS, DINING_OPTIONS } from '@/types/trip';
import { format } from 'date-fns';

interface ReviewStepProps {
  tripData: TripData;
  getDaysCount: () => number;
}

export const ReviewStep = ({ tripData, getDaysCount }: ReviewStepProps) => {
  const tripTypeLabel = TRIP_TYPE_OPTIONS.find(t => t.value === tripData.tripType)?.label || tripData.tripType;
  const paceLabel = PACE_OPTIONS.find(p => p.value === tripData.pace)?.label || tripData.pace;
  const diningLabel = DINING_OPTIONS.find(d => d.value === tripData.diningStyle)?.label || tripData.diningStyle;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <CheckCircle className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">Step 5</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Review your trip
        </h2>
        <p className="text-muted-foreground text-lg">
          Make sure everything looks good before we create your itinerary
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          {/* Destination */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Destination</p>
              <p className="text-xl font-bold">{tripData.destination}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Travel Dates</p>
              <p className="text-lg font-semibold">
                {tripData.startDate && format(tripData.startDate, 'MMM d')} – {tripData.endDate && format(tripData.endDate, 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-primary font-medium">{getDaysCount()} days</p>
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget Range</p>
              <p className="text-lg font-semibold">
                {tripData.currency} {tripData.budgetMin.toLocaleString()} – {tripData.budgetMax.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Travelers */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Travelers</p>
              <p className="text-lg font-semibold">{tripData.travelers} {tripData.travelers === 1 ? 'person' : 'people'}</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-semibold text-lg mb-4">Preferences</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <Compass className="w-5 h-5 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Focus</p>
              <p className="font-medium text-sm">{tripTypeLabel}</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <Timer className="w-5 h-5 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Pace</p>
              <p className="font-medium text-sm">{paceLabel}</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <Utensils className="w-5 h-5 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Dining</p>
              <p className="font-medium text-sm">{diningLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
