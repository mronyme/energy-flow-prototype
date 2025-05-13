
import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import WizardStep from '@/components/data-load/WizardStep';
import UploadDropZone from '@/components/data-load/UploadDropZone';
import PreviewTable from '@/components/data-load/PreviewTable';
import { Button } from '@/components/ui/button';
import { readingService, importLogService } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';

const CsvImport: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { announcer, announce } = useAnnouncer();
  
  // Get current step from URL query param or default to 1
  const currentStep = parseInt(searchParams.get('step') || '1');
  
  const [csvData, setCsvData] = useState<any[]>([]);
  const [filename, setFilename] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle file upload completion (step 1)
  const handleFileUploaded = useCallback((data: any[], name: string) => {
    setCsvData(data);
    setFilename(name);
    
    // Announce for screen readers
    announce(`File ${name} uploaded with ${data.length} rows`);
    
    // Auto-advance to next step (mapping)
    setSearchParams({ step: '2' });
  }, [setSearchParams, announce]);
  
  // Handle click on "Next" button (step 2 -> step 3) - IF-03
  const handleNextStep = useCallback(() => {
    // Update URL to show step 3
    setSearchParams({ step: '3' });
    
    // Announce for screen readers
    announce("Moved to step 3: Preview and confirmation");
  }, [setSearchParams, announce]);
  
  // Handle import confirmation (step 3) - IF-02
  const handleConfirmImport = useCallback(async () => {
    if (!csvData.length || !user) return;
    
    try {
      setIsSubmitting(true);
      
      // Convert CSV data to readings format
      const readings = csvData.map(row => ({
        meter_id: row.meter_id,
        ts: new Date(row.date).toISOString(),
        value: parseFloat(row.value)
      }));
      
      // Batch insert readings
      const result = await readingService.bulkImport(readings);
      
      // Log the import
      await importLogService.create({
        user_email: user.email,
        rows_ok: result.rowsOk,
        rows_err: result.rowsErr,
        file_name: filename
      });
      
      // Success message with counts
      toast.success(`Import complete: ${result.rowsOk} rows, ${result.rowsErr} errors`);
      announce(`Import complete: ${result.rowsOk} rows imported, ${result.rowsErr} errors`);
      
      // Redirect to journal page
      navigate('/data-quality/journal');
      
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Import failed');
      setIsSubmitting(false);
    }
  }, [csvData, user, filename, navigate, announce]);
  
  // Define steps for the wizard
  const steps = [
    { label: 'Upload', description: 'Upload CSV file' },
    { label: 'Map Columns', description: 'Configure data mapping' },
    { label: 'Preview & Confirm', description: 'Verify and complete import' }
  ];
  
  return (
    <div>
      {announcer} {/* Screen reader announcements */}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark mb-2">CSV Import</h1>
        <p className="text-gray-600">
          Import meter readings from a CSV file.
        </p>
      </div>
      
      {/* Wizard steps */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <WizardStep
              key={index}
              number={index + 1} // Use number instead of step
              label={step.label}
              description={step.description}
              isActive={currentStep === index + 1}
              isCompleted={currentStep > index + 1}
            />
          ))}
        </div>
      </div>
      
      {/* Step content */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {currentStep === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Upload CSV File</h2>
            <UploadDropZone onFileLoaded={handleFileUploaded} />
          </>
        )}
        
        {currentStep === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Map Columns</h2>
            <p className="mb-4 text-gray-600">
              Your file has been processed. Please confirm the mapping below.
            </p>
            
            {/* Simple mapping UI - in a real app this would be more interactive */}
            <div className="mb-6 p-4 border rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Source Column</p>
                  <ul className="mt-2 space-y-1">
                    <li>meter_id</li>
                    <li>date</li>
                    <li>value</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Maps To</p>
                  <ul className="mt-2 space-y-1">
                    <li>Meter ID</li>
                    <li>Reading Date</li>
                    <li>Reading Value</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setSearchParams({ step: '1' })}
              >
                Back
              </Button>
              
              <Button onClick={handleNextStep}>
                Next
              </Button>
            </div>
          </>
        )}
        
        {currentStep === 3 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Preview & Confirm</h2>
            <p className="mb-4 text-gray-600">
              Review the data before completing the import.
            </p>
            
            {/* Preview table - now with fixed headers */}
            <div className="mb-6">
              {csvData.length > 0 && (
                <PreviewTable 
                  data={csvData.slice(0, 10)} 
                  headers={Object.keys(csvData[0] || {})} 
                />
              )}
              {csvData.length > 10 && (
                <p className="mt-2 text-sm text-gray-500">
                  Showing 10 of {csvData.length} rows
                </p>
              )}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setSearchParams({ step: '2' })}
                disabled={isSubmitting}
              >
                Back
              </Button>
              
              <Button 
                onClick={handleConfirmImport}
                disabled={isSubmitting || !csvData.length}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Importing...' : 'Confirm Import'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CsvImport;
