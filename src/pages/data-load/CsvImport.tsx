
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FileUploadAdapter from '@/components/data-load/FileUploadAdapter';
import WizardStep from '@/components/data-load/WizardStep';
import PreviewTable from '@/components/data-load/PreviewTable';
import { readingService, importLogService } from '@/services/api';
import { ImportLog, Reading } from '@/types';
import { useAnnouncer } from '@/components/common/A11yAnnouncer';

const CsvImport = () => {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState<ImportLog | null>(null);
  const { announce } = useAnnouncer();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const steps = [
    { id: '1', label: 'Upload CSV', isActive: currentStep === 1, isComplete: currentStep > 1 },
    { id: '2', label: 'Preview Data', isActive: currentStep === 2, isComplete: currentStep > 2 },
    { id: '3', label: 'Import Data', isActive: currentStep === 3, isComplete: false },
  ];

  const handleFileSelected = (data: any[], file: File) => {
    setParsedData(data);
    setPreviewVisible(true);
    setCurrentStep(2);
    announce('CSV file parsed and data is ready for preview.', true);
  };

  const handleImport = async () => {
    if (!parsedData.length) {
      toast.error('No data to import.');
      announce('Import failed. No data to import.', true);
      return;
    }

    setImporting(true);
    announce('Import process started.', true);

    try {
      // Transform parsed data into Reading objects with optional id
      const readings = parsedData.map(item => ({
        meter_id: item.meter_id,
        ts: item.ts,
        value: parseFloat(item.value),
      }));

      // Perform bulk save
      const result = await readingService.bulkSaveReadings(readings);

      if (result.success) {
        toast.success(`Successfully imported ${result.inserted} readings.`);
        announce(`Successfully imported ${result.inserted} readings.`, true);
      } else {
        toast.error(`Failed to import all readings. Errors: ${result.errors}.`);
        announce(`Failed to import all readings. Errors: ${result.errors}.`, true);
      }

      // Create import log
      const log = {
        user_email: 'user@example.com', // This would come from auth context
        rows_ok: result.inserted || 0,
        rows_err: result.errors || 0,
        file_name: file ? file.name : 'uploaded-data.csv',
      };

      const newLog = await importLogService.createImportLog(log);
      if (newLog) {
        setImportLog(newLog as ImportLog);
        toast.success('Import log created successfully.');
        announce('Import log created successfully.', true);
      } else {
        toast.error('Failed to create import log.');
        announce('Failed to create import log.', true);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'An error occurred during import.');
      announce('An error occurred during import.', true);
    } finally {
      setImporting(false);
      setCurrentStep(3);
    }
  };

  return (
    <div>
      <WizardStep 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        stepTitle={steps[currentStep-1].label} 
      />
      
      <Separator className="my-4" />

      {currentStep === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Upload CSV File</h3>
          <FileUploadAdapter onFileSelected={handleFileSelected} />
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Preview Data</h3>
          {parsedData.length > 0 ? (
            <>
              <PreviewTable data={parsedData} />
              <div className="mt-4 flex justify-between">
                <Button variant="secondary" onClick={() => setCurrentStep(1)}>Back to Upload</Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? 'Importing...' : 'Import Data'}
                </Button>
              </div>
            </>
          ) : (
            <p>No data to preview.</p>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Import Complete</h3>
          {importLog ? (
            <>
              <p>Import Log:</p>
              <p>Filename: {importLog.file_name}</p>
              <p>Rows OK: {importLog.rows_ok}</p>
              <p>Rows with Errors: {importLog.rows_err}</p>
              <p>Timestamp: {new Date(importLog.ts).toLocaleString()}</p>
            </>
          ) : (
            <p>No import log available.</p>
          )}
          <Button onClick={() => setCurrentStep(1)} className="mt-4">Import Another File</Button>
        </div>
      )}
    </div>
  );
};

export default CsvImport;
