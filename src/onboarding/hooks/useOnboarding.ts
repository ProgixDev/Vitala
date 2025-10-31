import { useState } from 'react';
import { slides } from '../constants/slides';

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < slides.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < slides.length) {
      setCurrentStep(step);
    }
  };

  const skip = () => {
    setCurrentStep(slides.length - 1);
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === slides.length - 1;

  return {
    currentStep,
    nextStep,
    previousStep,
    goToStep,
    skip,
    isFirstStep,
    isLastStep,
    totalSteps: slides.length,
  };
};

