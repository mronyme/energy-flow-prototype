
import React from 'react';
import ManualEntryForm from '@/components/data-load/ManualEntryForm';
import EditableTable from '@/components/data-load/EditableTable';
import { useIsMobile } from '@/hooks/use-mobile';

const ManualEntry: React.FC = () => {
  const isMobile = useIsMobile();
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  const handleSaveReading = () => {
    // Increment refresh trigger to reload the table data
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark mb-2">Manual Data Entry</h1>
        <p className="text-gray-600">
          Enter B1 meter readings for specific dates manually.
        </p>
      </div>
      
      {/* Manual Entry Form */}
      <ManualEntryForm onSave={handleSaveReading} />
      
      {/* Recent Readings Table */}
      <div>
        <h2 className="text-xl font-semibold text-dark mb-4">Recent Readings</h2>
        <div className={isMobile ? "overflow-x-auto" : ""}>
          <EditableTable refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default ManualEntry;
