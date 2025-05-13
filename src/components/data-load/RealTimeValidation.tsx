
import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { checkThresholds } from '@/utils/validation';

interface RealTimeValidationProps {
  value: number | null;
  historicalValues: number[];
  loading?: boolean;
}

const RealTimeValidation: React.FC<RealTimeValidationProps> = ({ 
  value, 
  historicalValues,
  loading = false 
}) => {
  if (loading || value === null) {
    return null;
  }

  const { isAnomaly, type, delta, message } = checkThresholds(value, historicalValues);

  // No issues
  if (!isAnomaly && !delta && !message) {
    return (
      <div className="flex items-center text-green-600 text-sm mt-1">
        <CheckCircle className="h-4 w-4 mr-1" />
        <span>Value within normal range</span>
      </div>
    );
  }

  // Anomaly (serious issue)
  if (isAnomaly) {
    return (
      <div className="flex items-center text-red-600 text-sm mt-1">
        <AlertCircle className="h-4 w-4 mr-1" />
        <span>
          {type === 'SPIKE' && `Spike detected (${delta?.toFixed(1)}% above normal)`}
          {type === 'MISSING' && 'Missing value'}
          {type === 'FLAT' && 'Flat reading detected'}
        </span>
      </div>
    );
  }

  // Warning (out of threshold but not serious anomaly)
  if (delta) {
    const deltaText = delta > 0 ? `+${delta.toFixed(1)}%` : `${delta.toFixed(1)}%`;
    
    return (
      <div className="flex items-center text-amber-600 text-sm mt-1">
        <AlertTriangle className="h-4 w-4 mr-1" />
        <span>Out of threshold: {deltaText} from normal range</span>
      </div>
    );
  }

  return null;
};

export default RealTimeValidation;
