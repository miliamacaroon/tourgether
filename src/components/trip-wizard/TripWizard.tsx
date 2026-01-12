import { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTripWizard } from '@/hooks/useTripWizard';
import { WizardProgress } from './WizardProgress';
import { DestinationStep, VisionDetectionResult } from './DestinationStep';
import { DatesStep } from './DatesStep';
import { BudgetStep } from './BudgetStep';
import { PreferencesStep } from './PreferencesStep';
import { ReviewStep } from './ReviewStep';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateItinerary } from '@/services/itineraryService';
import { TripType } from '@/types/trip';

export const TripWizard = () => {
  const navigate = useNavigate();
  const [visionData, setVisionData] = useState<VisionDetectionResult | null>(null);
  const {
    step,
    totalSteps,
    tripData,
    isGenerating,
    setIsGenerating,
    updateTripData,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    getDaysCount,
  } = useTripWizard();

  const handleVisionDetection = (data: VisionDetectionResult) => {
    setVisionData(data);
    
    // Auto-update trip type based on vision detection
    if (data.suggestions?.primary_trip_type) {
      const tripType = data.suggestions.primary_trip_type as TripType;
      if (['landmarks', 'historical_places', 'nature', 'entertainment'].includes(tripType)) {
        updateTripData('tripType', tripType);
      }
    }

    // Auto-update currency based on region
    if (data.suggestions?.currency) {
      updateTripData('currency', data.suggestions.currency);
    }

    // Adjust budget based on region modifier
    if (data.suggestions?.budget_modifier) {
      const modifier = data.suggestions.budget_modifier;
      updateTripData('budgetMin', Math.round(tripData.budgetMin * modifier));
      updateTripData('budgetMax', Math.round(tripData.budgetMax * modifier));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const storedData = {
      ...tripData,
      startDate: tripData.startDate?.toISOString() || '',
      endDate: tripData.endDate?.toISOString() || '',
      daysCount: getDaysCount(),
    };
    
    // Store basic trip data in session storage
    sessionStorage.setItem('tripData', JSON.stringify(storedData));
    
    try {
      toast.info('🤖 AI is crafting your perfect itinerary using RAG...', { duration: 15000 });
      
      const result = await generateItinerary(storedData);
      
      // Store the generated itinerary and attractions/restaurants
      sessionStorage.setItem('generatedItinerary', result.itinerary);
      if (result.attractions) {
        sessionStorage.setItem('generatedAttractions', JSON.stringify(result.attractions));
      }
      if (result.restaurants) {
        sessionStorage.setItem('generatedRestaurants', JSON.stringify(result.restaurants));
      }
      if (result.sources) {
        sessionStorage.setItem('generatedSources', JSON.stringify(result.sources));
      }
      
      toast.success('✨ Your itinerary is ready!');
      navigate('/itinerary');
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate itinerary. Please try again.');
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <DestinationStep
            destination={tripData.destination}
            onDestinationChange={(val) => updateTripData('destination', val)}
            onVisionDetection={handleVisionDetection}
          />
        );
      case 2:
        return (
          <DatesStep
            startDate={tripData.startDate}
            endDate={tripData.endDate}
            travelers={tripData.travelers}
            onStartDateChange={(date) => updateTripData('startDate', date)}
            onEndDateChange={(date) => updateTripData('endDate', date)}
            onTravelersChange={(count) => updateTripData('travelers', count)}
          />
        );
      case 3:
        return (
          <BudgetStep
            budgetMin={tripData.budgetMin}
            budgetMax={tripData.budgetMax}
            currency={tripData.currency}
            onBudgetMinChange={(val) => updateTripData('budgetMin', val)}
            onBudgetMaxChange={(val) => updateTripData('budgetMax', val)}
            onCurrencyChange={(val) => updateTripData('currency', val)}
          />
        );
      case 4:
        return (
          <PreferencesStep
            tripType={tripData.tripType}
            pace={tripData.pace}
            diningStyle={tripData.diningStyle}
            onTripTypeChange={(val) => updateTripData('tripType', val)}
            onPaceChange={(val) => updateTripData('pace', val)}
            onDiningStyleChange={(val) => updateTripData('diningStyle', val)}
          />
        );
      case 5:
        return <ReviewStep tripData={tripData} getDaysCount={getDaysCount} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <WizardProgress
          currentStep={step}
          totalSteps={totalSteps}
          onStepClick={goToStep}
        />
      </div>

      {/* Step Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-4">
        <div className="container max-w-4xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || isGenerating}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Itinerary
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
