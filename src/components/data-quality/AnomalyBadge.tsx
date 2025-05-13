
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnomalyType } from '@/types';

interface AnomalyBadgeProps {
  type: AnomalyType;
  delta?: number | null;
  showTooltip?: boolean;
}

const AnomalyBadge: React.FC<AnomalyBadgeProps> = ({ 
  type, 
  delta = null,
  showTooltip = true 
}) => {
  const getBadgeStyles = () => {
    switch(type) {
      case 'SPIKE':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'MISSING':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'FLAT':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getTooltipText = () => {
    switch(type) {
      case 'SPIKE':
        return delta 
          ? `Value exceeds historical mean by ${delta > 0 ? '+' : ''}${delta.toFixed(1)}%` 
          : 'Value exceeds historical mean by ≥ +40%';
      case 'MISSING':
        return 'No value recorded for this period';
      case 'FLAT':
        return 'Same value for > 48 hours (potential sensor issue)';
      default:
        return 'Out-of-threshold value';
    }
  };
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`font-medium ${getBadgeStyles()} transition-all duration-100 ease-out`}
    >
      {type}
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
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AnomalyBadge;
