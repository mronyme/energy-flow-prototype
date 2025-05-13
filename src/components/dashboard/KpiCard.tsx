
import React from 'react';
import { ChevronsDown, ChevronsUp, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit: string;
  change?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  change,
  icon = <BarChart className="text-primary" />,
  onClick,
  isActive = false
}) => {
  const isPositiveChange = change && change > 0;
  const isNegativeChange = change && change < 0;
  
  return (
    <div 
      className={cn(
        "kpi-card cursor-pointer hover:shadow-md transition-all duration-100 ease-out",
        isActive && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-blue-50 rounded-full">
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-baseline">
          <span className="text-2xl font-semibold text-dark">{value}</span>
          <span className="ml-1 text-gray-500 text-sm">{unit}</span>
        </div>
        
        {change !== undefined && (
          <div className="flex items-center mt-2">
            {isPositiveChange && (
              <>
                <ChevronsUp className="text-green-500 mr-1" size={16} />
                <span className="text-green-500 text-sm">{Math.abs(change)}%</span>
              </>
            )}
            {isNegativeChange && (
              <>
                <ChevronsDown className="text-red-500 mr-1" size={16} />
                <span className="text-red-500 text-sm">{Math.abs(change)}%</span>
              </>
            )}
            {!isPositiveChange && !isNegativeChange && (
              <span className="text-gray-500 text-sm">No change</span>
            )}
            <span className="text-gray-500 text-xs ml-1">vs prev. period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
