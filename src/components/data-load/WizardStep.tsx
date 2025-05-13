
import React from 'react';

interface WizardStepProps {
  number: number;
  title: string;
  active: boolean;
  completed: boolean;
}

const WizardStep: React.FC<WizardStepProps> = ({
  number,
  title,
  active,
  completed
}) => {
  return (
    <div 
      className={`flex flex-col items-center ${active ? 'text-primary' : completed ? 'text-green-600' : 'text-gray-400'}`}
    >
      <div 
        className={`
          flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium 
          ${active 
            ? 'bg-primary text-white' 
            : completed 
              ? 'bg-green-100 text-green-600 border border-green-200' 
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }
        `}
      >
        {completed ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          number
        )}
      </div>
      <div className="mt-2 text-sm font-medium">{title}</div>
    </div>
  );
};

export default WizardStep;
