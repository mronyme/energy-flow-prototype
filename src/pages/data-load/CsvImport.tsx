
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadDropZone } from '@/components/data-load/UploadDropZone';
import { WizardStep } from '@/components/data-load/WizardStep';
import { PreviewTable } from '@/components/data-load/PreviewTable';
import { toast } from 'sonner';
import { readingService, importLogService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const CsvImport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const step = parseInt(params.get('step') || '1');
  
  const { user } = useAuth();
  
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileUpload = (data: any[], name: string) => {
    setCsvData(data);
    setFileName(name);
    
    // Move to next step
    navigateToStep(2);
  };
  
  const navigateToStep = (stepNum: number) => {
    navigate(`/data-load/csv-import?step=${stepNum}`);
  };
  
  const handlePreviewNextClick = () => {
    navigateToStep(3);
  };
  
  const handleBackClick = () => {
    navigateToStep(step - 1);
  };
  
  // Process the data and prepare readings
  const prepareReadings = () => {
    try {
      return csvData.map(row => ({
        meter_id: row.meter_id,
        ts: new Date(row.date).toISOString(),
        value: parseFloat(row.value)
      }));
    } catch (error) {
      console.error('Error preparing readings:', error);
      toast.error('Invalid data format in CSV');
      return [];
    }
  };
  
  const handleConfirmImport = async () => {
    if (csvData.length === 0) {
      toast.error('No data to import');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const readings = prepareReadings();
      
      // Use bulkSaveReadings instead of bulkImport
      const result = await readingService.bulkSaveReadings(readings);
      
      // Create import log
      if (user) {
        await importLogService.createImportLog({
          user_email: user.email || 'unknown',
          file_name: fileName,
          rows_ok: result.inserted,
          rows_err: result.errors
        });
      }
      
      setUploadedCount(result.inserted);
      setErrorCount(result.errors);
      
      // Show toast with import results
      toast.success(`Import complete: ${result.inserted} rows, ${result.errors} errors`);
      
      // Navigate to journal
      navigate('/data-quality/journal');
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">CSV Import</h1>
      
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <WizardStep 
            steps={[
              { label: 'Upload', id: 'upload', isActive: step === 1, isComplete: step > 1 },
              { label: 'Validate', id: 'validate', isActive: step === 2, isComplete: step > 2 },
              { label: 'Import', id: 'import', isActive: step === 3, isComplete: false }
            ]}
          />
        </div>
      </div>
      
      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Upload CSV File</h2>
            <p className="text-gray-500">
              Upload a CSV file containing meter readings. The file should have columns for meter_id, date, and value.
            </p>
            
            <UploadDropZone 
              onFileProcessed={handleFileUpload} 
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Validate Data</h2>
            <p className="text-gray-500">
              Review the data before importing. Make sure the meter IDs and values are correct.
            </p>
            
            <PreviewTable data={csvData} />
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleBackClick}>
                Back
              </Button>
              <Button onClick={handlePreviewNextClick}>
                Next
              </Button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Confirm Import</h2>
            <p className="text-gray-500">
              Click 'Import' to save {csvData.length} readings to the database.
            </p>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-medium text-blue-800">File information:</h3>
              <ul className="mt-2 text-sm text-blue-700">
                <li>Filename: {fileName}</li>
                <li>Total rows: {csvData.length}</li>
              </ul>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleBackClick} disabled={isProcessing}>
                Back
              </Button>
              <Button onClick={handleConfirmImport} disabled={isProcessing}>
                {isProcessing ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CsvImport;
