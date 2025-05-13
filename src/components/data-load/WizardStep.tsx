
import React from 'react';
import { CheckIcon } from 'lucide-react';

export interface WizardStepProps {
  number?: number; // Changed from 'step' to 'number' to avoid conflicts
  label: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}

const WizardStep: React.FC<WizardStepProps> = ({ 
  number, // Use number instead of step
  label, 
  description, 
  isActive, 
  isCompleted 
}) => {
  return (
    <div 
      className={`
        flex items-start space-x-3 p-3 rounded-md
        transition-all duration-100 ease-out
        ${isActive ? 'bg-blue-50 ring-1 ring-blue-200' : ''}
      `}
    >
      <div 
        className={`
          flex items-center justify-center w-8 h-8 rounded-full shrink-0
          ${isCompleted 
            ? 'bg-green-500 text-white' 
            : isActive 
              ? 'bg-primary text-white' 
              : 'bg-gray-200 text-gray-500'
          }
        `}
        aria-hidden="true"
      >
        {isCompleted ? (
          <CheckIcon className="w-5 h-5" />
        ) : (
          <span>{number || 1}</span>
        )}
      </div>
      
      <div>
        <h4 className={`
          font-medium text-sm
          ${isActive ? 'text-primary' : 'text-gray-900'}
        `}>
          {label}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
};

export default WizardStep;
