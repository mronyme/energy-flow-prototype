
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit: string;
  change: number;
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  change,
  icon,
  onClick,
  isActive = false
}) => {
  const isPositive = change >= 0;
  
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
          <div className="text-gray-600">{icon}</div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-dark">{value}</span>
            <span className="text-sm text-gray-600">{unit}</span>
          </div>
          
          <div className="flex items-center mt-1">
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-red-600 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-green-600 mr-1" />
            )}
            <span 
              className={cn(
                "text-sm font-medium",
                isPositive ? "text-red-600" : "text-green-600"
              )}
            >
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">vs. previous period</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
