
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WizardStep from '../../components/data-load/WizardStep';
import UploadDropZone from '../../components/data-load/UploadDropZone';
import PreviewTable from '../../components/data-load/PreviewTable';
import { toast } from 'sonner';
import { readingService, importLogService, meterService } from '../../services/api';
import { validateCsvRow } from '../../utils/validation';
import { useNavigate } from 'react-router-dom';

interface CsvRow {
  meter_id: string;
  date: string;
  time?: string;
  value: string;
}

const CsvImport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<{row: number; errors: string[]}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Parse current step from URL
  useEffect(() => {
    const step = searchParams.get('step');
    if (step) {
      const stepNum = parseInt(step);
      if (stepNum >= 1 && stepNum <= 3) {
        setCurrentStep(stepNum);
      }
    }
  }, [searchParams]);
  
  // Update URL when step changes
  useEffect(() => {
    setSearchParams({ step: currentStep.toString() });
  }, [currentStep, setSearchParams]);
  
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    
    // Read the CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const csvText = e.target.result as string;
        parseCsv(csvText);
      }
    };
    reader.readAsText(selectedFile);
  };
  
  const parseCsv = (csvText: string) => {
    // Split by lines
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      toast.error('Invalid CSV format');
      return;
    }
    
    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validate headers
    if (!headers.includes('meter_id') || !headers.includes('date') || !headers.includes('value')) {
      toast.error('CSV must include meter_id, date, and value columns');
      return;
    }
    
    // Parse data rows
    const dataRows: CsvRow[] = [];
    const errors: {row: number; errors: string[]}[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        errors.push({
          row: i - 1,
          errors: ['Column count mismatch']
        });
        continue;
      }
      
      // Create object with header keys
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      // Validate required fields
      const rowErrors: string[] = [];
      
      if (!validateCsvRow(row, ['meter_id', 'date', 'value'])) {
        rowErrors.push('Missing required fields');
      }
      
      // Validate value is a number
      if (isNaN(parseFloat(row.value)) || parseFloat(row.value) < 0) {
        rowErrors.push('Value must be a positive number');
      }
      
      // Add errors if any
      if (rowErrors.length > 0) {
        errors.push({
          row: i - 1,
          errors: rowErrors
        });
      }
      
      // Add to data rows
      dataRows.push(row as unknown as CsvRow);
    }
    
    setCsvData(dataRows);
    setValidationErrors(errors);
    
    // If no rows were parsed
    if (dataRows.length === 0) {
      toast.error('No valid data found in CSV');
    } else {
      // Automatically go to next step if file is valid
      if (errors.length === 0) {
        goToNextStep();
      }
    }
  };
  
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleConfirmImport = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // Filter out rows with validation errors
      const validRows = csvData.filter((_, index) => 
        !validationErrors.some(err => err.row === index)
      );
      
      // Format data for the API
      const readingsToImport = validRows.map(row => ({
        meter_id: row.meter_id,
        ts: row.time 
          ? `${row.date}T${row.time}Z` 
          : `${row.date}T00:00:00Z`,
        value: parseFloat(row.value)
      }));
      
      // Perform the bulk create
      const result = await readingService.bulkCreate(readingsToImport);
      
      // Create import log
      await importLogService.create({
        user_email: user.email,
        rows_ok: result.rowsOk,
        rows_err: result.rowsErr,
        file_name: file?.name || 'unknown.csv'
      });
      
      // Show success message
      toast.success(`Import complete: ${result.rowsOk} rows, ${result.rowsErr} errors`);
      
      // Redirect to the journal page
      navigate('/data-quality/journal');
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Check if we can proceed to next step
  const canProceedToStep2 = file !== null && csvData.length > 0;
  const canProceedToStep3 = csvData.length > 0;
  const canConfirmImport = validationErrors.length === 0 && csvData.length > 0;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">CSV Import</h1>
      
      {currentStep === 1 && (
        <WizardStep
          step={1}
          totalSteps={3}
          title="Select CSV File"
          description="Upload a CSV file with meter readings"
        >
          <div className="space-y-6">
            <UploadDropZone onFileSelect={handleFileSelect} />
            
            <div className="mt-6 text-sm text-gray-500">
              <h3 className="font-medium text-dark mb-2">CSV Format Requirements:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>File must be in CSV format with comma-separated values</li>
                <li>Required columns: <code>meter_id</code>, <code>date</code>, <code>value</code></li>
                <li>Optional columns: <code>time</code> (defaults to 00:00:00 if omitted)</li>
                <li>Date format: YYYY-MM-DD</li>
                <li>Time format: HH:MM:SS</li>
                <li>Values must be positive numbers</li>
              </ul>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={goToNextStep}
                disabled={!canProceedToStep2}
              >
                Next
              </Button>
            </div>
          </div>
        </WizardStep>
      )}
      
      {currentStep === 2 && (
        <WizardStep
          step={2}
          totalSteps={3}
          title="Validate Data"
          description="Review and validate the imported data"
        >
          <div className="space-y-6">
            {csvData.length > 0 ? (
              <>
                <PreviewTable
                  data={csvData}
                  headers={Object.keys(csvData[0])}
                  validationErrors={validationErrors}
                />
                
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                  >
                    Back
                  </Button>
                  
                  <Button
                    onClick={goToNextStep}
                    disabled={!canProceedToStep3}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No data to display. Please go back and upload a valid CSV file.
              </div>
            )}
          </div>
        </WizardStep>
      )}
      
      {currentStep === 3 && (
        <WizardStep
          step={3}
          totalSteps={3}
          title="Confirm Import"
          description="Review the import summary and confirm"
        >
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-lg text-dark mb-4">Import Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Filename:</p>
                  <p className="font-medium">{file?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-500">File Size:</p>
                  <p className="font-medium">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Rows:</p>
                  <p className="font-medium">{csvData.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Valid Rows:</p>
                  <p className="font-medium text-green-600">{csvData.length - validationErrors.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Error Rows:</p>
                  <p className={`font-medium ${validationErrors.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {validationErrors.length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">User:</p>
                  <p className="font-medium">{user?.email || 'Unknown'}</p>
                </div>
              </div>
            </div>
            
            {validationErrors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-md border border-red-100">
                <h3 className="font-medium text-red-800 mb-2">Warning: Data Contains Errors</h3>
                <p className="text-sm text-red-700">
                  There are {validationErrors.length} rows with errors. These rows will be skipped during import.
                </p>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
              >
                Back
              </Button>
              
              <Button
                onClick={handleConfirmImport}
                disabled={!canConfirmImport || isProcessing}
              >
                {isProcessing ? 'Importing...' : 'Confirm Import'}
              </Button>
            </div>
          </div>
        </WizardStep>
      )}
    </div>
  );
};

export default CsvImport;
