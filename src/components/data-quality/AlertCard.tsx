
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { AnomalyType } from '../../types';

interface AlertCardProps {
  title: string;
  type: AnomalyType;
  date: string;
  value: number | null;
  delta?: number | null;
  site: string;
  meter: string;
  onClick: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  title,
  type,
  date,
  value,
  delta,
  site,
  meter,
  onClick
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'SPIKE':
        return 'bg-red-100 text-red-800';
      case 'MISSING':
        return 'bg-amber-100 text-amber-800';
      case 'FLAT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeIcon = () => {
    switch (type) {
      case 'SPIKE':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'MISSING':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'FLAT':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 p-4 hover:shadow-md transition-all duration-100 ease-out cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-dark">{title}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor()}`}>
          {getTypeIcon()}
          <span className="ml-1">{type}</span>
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Date:</span>
          <span className="font-medium">{date}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Value:</span>
          <span className="font-medium">{value !== null ? value : 'N/A'}</span>
        </div>
        
        {delta !== null && delta !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">Deviation:</span>
            <span className="font-medium text-red-600">+{delta.toFixed(1)}%</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-500">Site:</span>
          <span className="font-medium">{site}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Meter:</span>
          <span className="font-medium">{meter}</span>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
