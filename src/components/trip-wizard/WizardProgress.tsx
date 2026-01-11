import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = [
  'Destination',
  'Dates',
  'Budget',
  'Preferences',
  'Review',
];

export const WizardProgress = ({ currentStep, totalSteps, onStepClick }: WizardProgressProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          
          return (
            <div key={stepNum} className="flex items-center flex-1 last:flex-none">
              {/* Step circle with label */}
              <div className="relative flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(stepNum)}
                  disabled={stepNum > currentStep}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300",
                    isCompleted && "bg-primary text-primary-foreground cursor-pointer hover:scale-110",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNum
                  )}
                </button>
                
                {/* Step label */}
                <span className={cn(
                  "absolute top-12 text-xs font-medium whitespace-nowrap",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                  "hidden sm:block"
                )}>
                  {STEP_LABELS[i]}
                </span>
              </div>
              
              {/* Connecting line */}
              {stepNum < totalSteps && (
                <div className={cn(
                  "flex-1 h-1 mx-3 rounded-full transition-all duration-300",
                  isCompleted ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mobile step label */}
      <p className="text-center text-sm font-medium text-primary mt-4 sm:hidden">
        Step {currentStep}: {STEP_LABELS[currentStep - 1]}
      </p>
    </div>
  );
};
