
import React from 'react';
import { Card } from '@/components/ui/card';
import { dateUtils } from '@/utils/validation';
import AnomalyBadge from './AnomalyBadge';
import ThresholdBadge from './ThresholdBadge';
import { AnomalyData } from '@/types/anomaly-data';

export interface AlertCardProps {
  anomalyData: AnomalyData;
  onClick: () => void;
  selected?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({ anomalyData, onClick, selected = false }) => {
  const {
    type,
    delta,
    timestamp,
    value,
    siteName,
    meterType,
    comment
  } = anomalyData;
  
  const formattedDate = dateUtils.formatDisplay(timestamp);
  const isOutOfThreshold = type === 'SPIKE' && delta !== null && delta > 15;
  
  return (
    <Card 
      className={`relative overflow-hidden hover:shadow-md transition-all duration-100 ease-out cursor-pointer ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-dark">{siteName}</h3>
            <p className="text-sm text-gray-500">{meterType} Meter</p>
          </div>
          <AnomalyBadge type={type} delta={delta} />
        </div>
        
        <div className="mt-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Value:</span>
            <span className="text-sm font-medium flex items-center">
              {value !== null ? value : 'Missing'} 
              {isOutOfThreshold && (
                <ThresholdBadge delta={delta} className="ml-2" />
              )}
            </span>
          </div>
          
          {comment && (
            <div className="mt-2 border-t border-gray-100 pt-2">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Comment:</span> {comment}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Indicator that it's clickable */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 to-primary/60"></div>
    </Card>
  );
};

export default AlertCard;
