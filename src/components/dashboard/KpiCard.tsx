
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, Wind, Flame, Gauge, Fuel, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit: string;
  change: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  valueColor?: string;
  inverseChange?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  change,
  icon,
  onClick,
  isActive = false,
  valueColor,
  inverseChange = false
}) => {
  // Format change to have at most 1 decimal place
  const formattedChange = Math.abs(parseFloat(change.toFixed(1)));
  
  // Determine if change is positive or negative
  const isPositive = change >= 0;
  
  // For some metrics like efficiency, a positive change is good
  // For others like consumption, a positive change is bad
  // inverseChange allows us to flip the color logic
  const isGood = inverseChange ? !isPositive : isPositive;
  
  return (
    <Card 
      className={cn(
        "shadow-sm ring-1 ring-dark/10 transition-all duration-100 ease-out",
        onClick && "cursor-pointer hover:shadow-md",
        isActive && "ring-2 ring-primary/80 bg-blue-50/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-medium text-dark">{title}</h3>
          <div className="text-gray-600">{icon || <Zap size={18} />}</div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-2xl font-bold", valueColor ? valueColor : "text-dark")}>
              {typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits: 1}) : value}
            </span>
            <span className="text-sm text-gray-600">{unit}</span>
          </div>
          
          <div className="flex items-center mt-1">
            {isPositive ? (
              <ArrowUpIcon className={cn("h-4 w-4 mr-1", isGood ? "text-green-600" : "text-red-600")} />
            ) : (
              <ArrowDownIcon className={cn("h-4 w-4 mr-1", isGood ? "text-green-600" : "text-red-600")} />
            )}
            <span 
              className={cn(
                "text-sm font-medium",
                isGood ? "text-green-600" : "text-red-600"
              )}
            >
              {formattedChange}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. période précédente</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
