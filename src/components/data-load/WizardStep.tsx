
// If needed, create this component with fixed props
import React from 'react';

interface StepItem {
  id: string;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

export interface WizardStepProps {
  steps: StepItem[];
  currentStep?: number;
  totalSteps?: number;
  stepTitle?: string; 
}

const WizardStep: React.FC<WizardStepProps> = ({ 
  steps,
  currentStep,
  totalSteps,
  stepTitle 
}) => {
  // Implementation that can handle both old and new prop structures
  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  step.isComplete
                    ? 'bg-green-100 text-green-800'
                    : step.isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-400'
                }
              `}
            >
              {step.isComplete ? '✓' : step.id}
            </div>
            <span
              className={`ml-2 text-sm ${
                step.isActive ? 'font-medium' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
            {step.id !== steps[steps.length - 1].id && (
              <div className="w-10 h-1 bg-gray-200 mx-2"></div>
            )}
          </div>
        ))}
      </div>
      {stepTitle && <h2 className="text-lg font-medium mb-2">{stepTitle}</h2>}
      {currentStep !== undefined && totalSteps !== undefined && (
        <p className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </p>
      )}
    </div>
  );
};

export default WizardStep;
