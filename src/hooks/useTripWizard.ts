import { useState, useCallback } from 'react';
import { TripData, TripType, TripPace, DiningStyle } from '@/types/trip';

const INITIAL_TRIP_DATA: TripData = {
  destination: '',
  startDate: null,
  endDate: null,
  budgetMin: 1000,
  budgetMax: 5000,
  currency: 'USD',
  tripType: 'landmarks',
  pace: 'moderate',
  diningStyle: 'mixed',
  travelers: 2,
};

export const useTripWizard = () => {
  const [step, setStep] = useState(1);
  const [tripData, setTripData] = useState<TripData>(INITIAL_TRIP_DATA);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalSteps = 5;

  const updateTripData = useCallback(<K extends keyof TripData>(key: K, value: TripData[K]) => {
    setTripData(prev => ({ ...prev, [key]: value }));
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((targetStep: number) => {
    if (targetStep >= 1 && targetStep <= totalSteps) {
      setStep(targetStep);
    }
  }, [totalSteps]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return tripData.destination.trim().length > 0;
      case 2:
        return tripData.startDate !== null && tripData.endDate !== null;
      case 3:
        return tripData.budgetMin > 0 && tripData.budgetMax >= tripData.budgetMin;
      case 4:
        return true; // Preferences always valid
      case 5:
        return true; // Review step
      default:
        return false;
    }
  }, [step, tripData]);

  const reset = useCallback(() => {
    setStep(1);
    setTripData(INITIAL_TRIP_DATA);
    setIsGenerating(false);
  }, []);

  const getDaysCount = useCallback(() => {
    if (!tripData.startDate || !tripData.endDate) return 0;
    const diffTime = tripData.endDate.getTime() - tripData.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [tripData.startDate, tripData.endDate]);

  return {
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
    reset,
    getDaysCount,
  };
};
