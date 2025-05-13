
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ThresholdBadgeProps {
  value?: number;
  historicalMean?: number;
  delta?: number; // Added delta property for direct use from AlertCard
  showTooltip?: boolean;
  className?: string;
}

const ThresholdBadge: React.FC<ThresholdBadgeProps> = ({ 
  value, 
  historicalMean, 
  delta,
  showTooltip = true,
  className = ''
}) => {
  // Calculate percentage difference if value and historicalMean are provided
  // Or use the provided delta directly
  const percentageDiff = delta !== undefined ? delta : (
    (value !== undefined && historicalMean !== undefined && historicalMean > 0)
      ? ((value - historicalMean) / historicalMean) * 100
      : 0
  );
  
  // Check if outside threshold (±15%)
  const isOutsideThreshold = Math.abs(percentageDiff) > 15;
  
  if (!isOutsideThreshold) {
    return null;
  }
  
  const formattedPercentage = `${percentageDiff > 0 ? '+' : ''}${percentageDiff.toFixed(1)}%`;

  // Determine badge color based on percentage difference
  const getBadgeColor = () => {
    if (percentageDiff > 40) {  // SPIKE anomaly threshold
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (percentageDiff < 0) {  // Below threshold
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    } else {  // Above threshold but not a spike
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    }
  };
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`font-medium ${getBadgeColor()} transition-all duration-100 ease-out ${className}`}
      aria-label={`Out-of-threshold value: ${formattedPercentage}`}
    >
      {formattedPercentage}
    </Badge>
  );
  
  if (!showTooltip) {
    return badge;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="text-xs" aria-live="polite">
          {percentageDiff > 40 ? 'Spike detected' : 'Out-of-threshold value'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThresholdBadge;
