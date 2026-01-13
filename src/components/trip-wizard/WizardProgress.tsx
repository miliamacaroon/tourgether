import { Check, MapPin, Calendar, Wallet, Settings, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEP_DATA = [
  { label: 'Destination', icon: MapPin },
  { label: 'Dates', icon: Calendar },
  { label: 'Budget', icon: Wallet },
  { label: 'Preferences', icon: Settings },
  { label: 'Review', icon: FileCheck },
];

export const WizardProgress = ({ currentStep, totalSteps, onStepClick }: WizardProgressProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const StepIcon = STEP_DATA[i]?.icon || MapPin;
          
          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              {/* Step circle with label */}
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(stepNum)}
                  disabled={stepNum > currentStep}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-2xl text-sm font-semibold transition-all duration-500",
                    isCompleted && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground cursor-pointer hover:scale-110 hover:shadow-lg hover:shadow-primary/30",
                    isCurrent && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-4 ring-primary/30 shadow-lg shadow-primary/20 animate-pulse-glow",
                    !isCompleted && !isCurrent && "bg-muted/50 text-muted-foreground cursor-not-allowed border border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                  
                  {/* Glow effect for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md -z-10" />
                  )}
                </button>
                
                {/* Step label */}
                <span className={cn(
                  "absolute top-14 text-xs font-semibold whitespace-nowrap transition-colors",
                  isCompleted && "text-primary",
                  isCurrent && "text-primary",
                  !isCompleted && !isCurrent && "text-muted-foreground",
                  "hidden sm:block"
                )}>
                  {STEP_DATA[i]?.label}
                </span>
              </div>
              
              {/* Connecting line with gradient */}
              {stepNum < totalSteps && (
                <div className="flex-1 h-1.5 mx-3 rounded-full overflow-hidden bg-muted/30">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isCompleted ? "w-full bg-gradient-to-r from-primary to-primary/70" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile step label */}
      <div className="flex items-center justify-center gap-2 mt-6 sm:hidden">
        <div className="p-1.5 rounded-lg bg-primary/10">
          {(() => {
            const Icon = STEP_DATA[currentStep - 1]?.icon || MapPin;
            return <Icon className="w-4 h-4 text-primary" />;
          })()}
        </div>
        <p className="text-sm font-semibold text-foreground">
          Step {currentStep}: <span className="text-primary">{STEP_DATA[currentStep - 1]?.label}</span>
        </p>
      </div>
    </div>
  );
};
