
import React from 'react';

interface WizardStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const WizardStep: React.FC<WizardStepProps> = ({
  step,
  totalSteps,
  title,
  description,
  children
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium 
                ${
                  index + 1 === step
                    ? 'bg-primary text-white'
                    : index + 1 < step
                    ? 'bg-green-100 text-green-600 border border-green-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }
              `}
            >
              {index + 1 < step ? (
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
                index + 1
              )}
            </div>

            {index < totalSteps - 1 && (
              <div
                className={`flex-1 h-0.5 max-w-[40px] ${
                  index + 1 < step ? 'bg-green-200' : 'bg-gray-200'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-medium text-dark">{title}</h2>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-dark/10">
        {children}
      </div>
    </div>
  );
};

export default WizardStep;
