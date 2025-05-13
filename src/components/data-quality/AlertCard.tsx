
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { InfoIcon, AlertTriangleIcon, BanIcon, PercentIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { dateUtils } from '@/utils/validation';

// Create a new version of AlertCard for the summary view
interface AlertCardSummaryProps {
  title: string;
  count: number;
  type: "warning" | "error" | "info";
  icon: React.ElementType;
}

// Original AlertCard
interface AlertCardProps {
  title: string;
  type: 'MISSING' | 'SPIKE' | 'FLAT' | 'THRESHOLD';
  date: string;
  value: number | null;
  delta?: number | null;
  site: string;
  meter: string;
  onClick?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  type,
  date,
  value,
  delta,
  site,
  meter,
  onClick
}) => {
  // Determine icon and color based on type
  const getIconDetails = () => {
    switch (type) {
      case 'MISSING':
        return {
          icon: <BanIcon className="h-5 w-5 text-red-600" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          badgeClass: 'bg-red-100 text-red-800'
        };
      case 'SPIKE':
        return {
          icon: <AlertTriangleIcon className="h-5 w-5 text-amber-600" />,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          badgeClass: 'bg-amber-100 text-amber-800'
        };
      case 'FLAT':
        return {
          icon: <InfoIcon className="h-5 w-5 text-blue-600" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          badgeClass: 'bg-blue-100 text-blue-800'
        };
      case 'THRESHOLD':
        return {
          icon: <PercentIcon className="h-5 w-5 text-purple-600" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          badgeClass: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          icon: <InfoIcon className="h-5 w-5 text-blue-600" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          badgeClass: 'bg-blue-100 text-blue-800'
        };
    }
  };
  
  const { icon, color, bgColor, badgeClass } = getIconDetails();
  const formattedDate = dateUtils.formatDisplay(date);
  
  return (
    <Card 
      className={cn(
        "shadow-sm ring-1 ring-dark/10 transition-all duration-100 ease-out",
        onClick && "cursor-pointer hover:shadow-md",
        bgColor
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-dark">{title}</h3>
            <p className="text-sm text-gray-600">
              <span>{site}</span> | <span>{meter}</span>
            </p>
          </div>
          {icon}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">
              {formattedDate}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={badgeClass}>
                    {type === 'THRESHOLD' ? 'THRESHOLD' : type}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {type === 'MISSING' && 'No value recorded'}
                  {type === 'SPIKE' && `Value spike ${delta ? `+${delta.toFixed(1)}%` : ''}`}
                  {type === 'FLAT' && 'Unchanged for 48+ hours'}
                  {type === 'THRESHOLD' && 'Out-of-threshold value'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="text-right">
            <div className={cn("font-bold", color)}>
              {value !== null ? value : '—'}
            </div>
            {delta !== null && delta !== undefined && (
              <div className="text-xs">
                {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Create a summary version of the AlertCard for the Anomalies page
export const AlertCardSummary: React.FC<AlertCardSummaryProps> = ({ title, count, type, icon: Icon }) => {
  const getColorScheme = () => {
    switch (type) {
      case 'warning':
        return {
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600'
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const { bgColor, textColor, borderColor, iconColor } = getColorScheme();

  return (
    <Card className={`shadow-sm ring-1 ring-dark/10 ${bgColor}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
          </div>
          <div className={`${iconColor}`}>
            <Icon size={24} />
          </div>
        </div>
        
        <div className="mt-3">
          <span className={`text-3xl font-bold ${textColor}`}>{count}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
