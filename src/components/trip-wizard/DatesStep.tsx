import { CalendarDays, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatesStepProps {
  startDate: Date | null;
  endDate: Date | null;
  travelers: number;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onTravelersChange: (count: number) => void;
}

export const DatesStep = ({
  startDate,
  endDate,
  travelers,
  onStartDateChange,
  onEndDateChange,
  onTravelersChange,
}: DatesStepProps) => {
  const today = new Date();
  
  const getDaysCount = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <CalendarDays className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wide">Step 2</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          When are you traveling?
        </h2>
        <p className="text-muted-foreground text-lg">
          Select your travel dates and party size
        </p>
      </div>

      {/* Date Pickers */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-14 justify-start text-left font-normal rounded-xl border-2",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-3 h-5 w-5" />
                {startDate ? format(startDate, "PPP") : "Select start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => onStartDateChange(date || null)}
                disabled={(date) => date < today}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-14 justify-start text-left font-normal rounded-xl border-2",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-3 h-5 w-5" />
                {endDate ? format(endDate, "PPP") : "Select end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => onEndDateChange(date || null)}
                disabled={(date) => date < (startDate || today)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Duration display */}
      {startDate && endDate && (
        <div className="bg-accent/50 rounded-xl p-4 text-center">
          <p className="text-lg font-semibold text-accent-foreground">
            🗓️ {getDaysCount()} day{getDaysCount() !== 1 ? 's' : ''} trip
          </p>
        </div>
      )}

      {/* Travelers */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="w-4 h-4" />
          Number of Travelers
        </label>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full text-xl"
            onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
            disabled={travelers <= 1}
          >
            −
          </Button>
          <span className="text-3xl font-bold w-16 text-center">{travelers}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full text-xl"
            onClick={() => onTravelersChange(Math.min(20, travelers + 1))}
            disabled={travelers >= 20}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );
};
