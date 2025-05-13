
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WizardStep from '@/components/data-load/WizardStep';
import UploadDropZone from '@/components/data-load/UploadDropZone';
import PreviewTable from '@/components/data-load/PreviewTable';
import { toast } from 'sonner';
import { importService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface CsvRow {
  site: string;
  meter: string;
  date: string;
  value: string;
  unit: string;
}

const CsvImport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStep = parseInt(searchParams.get('step') || '1');
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Headers for the CSV preview
  const csvHeaders = ['site', 'meter', 'date', 'value', 'unit'];

  // Set step to 1 if not specified
  useEffect(() => {
    if (!searchParams.has('step')) {
      setSearchParams({ step: '1' });
    }
  }, [searchParams, setSearchParams]);

  const handleFileSelect = (file: File) => {
    setFileName(file.name);
  };

  const handleFileProcessed = (parsedData: any[], file: File) => {
    // Transform data to expected format
    const transformedData = parsedData.map((row) => ({
      site: row.site || '',
      meter: row.meter || '',
      date: row.date || '',
      value: row.value || '',
      unit: row.unit || ''
    }));
    
    setCsvData(transformedData);
    setFileName(file.name);
    
    // Move to step 2
    setSearchParams({ step: '2' });
  };

  const handleNextClick = () => {
    // IF-03: Move to step 3 (preview)
    setSearchParams({ step: '3' });
  };

  const handleConfirmImport = async () => {
    if (!user) {
      toast.error('You must be logged in to import data');
      return;
    }
    
    setLoading(true);
    
    try {
      // Process import
      const result = await importService.importCsv({
        data: csvData,
        fileName: fileName,
        userEmail: user.email
      });
      
      // IF-02: Green toast "Import complete: {{ok}} / {{err}}"
      toast.success(`Import complete: ${result.rowsOk} rows, ${result.rowsErr} errors`);
      
      // IF-02: Redirect to journal page
      navigate('/data-quality/journal');
      
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setSearchParams({ step: prevStep.toString() });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-dark">CSV Import</h1>
      </div>

      <div className="flex justify-between mb-6">
        <WizardStep 
          number={1} 
          title="Upload CSV" 
          active={currentStep === 1} 
          completed={currentStep > 1} 
        />
        <WizardStep 
          number={2} 
          title="Validate" 
          active={currentStep === 2} 
          completed={currentStep > 2} 
        />
        <WizardStep 
          number={3} 
          title="Preview & Import" 
          active={currentStep === 3} 
          completed={currentStep > 3} 
        />
      </div>

      <Card className="shadow-sm ring-1 ring-dark/10">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 ? "Upload CSV File" : 
             currentStep === 2 ? "Validate Data" : 
             "Preview & Import"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <UploadDropZone 
              onFileSelect={handleFileSelect} 
              onFileProcessed={handleFileProcessed} 
            />
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded p-4 text-blue-800">
                <h3 className="font-semibold mb-2">File Ready for Validation</h3>
                <p>Filename: {fileName}</p>
                <p>Rows: {csvData.length}</p>
              </div>
              
              <PreviewTable 
                data={csvData.slice(0, 5)} 
                headers={csvHeaders} 
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleBackClick}
                  className="transition-all duration-100 ease-out"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNextClick}
                  className="transition-all duration-100 ease-out"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-4">
              <PreviewTable 
                data={csvData.slice(0, 10)} 
                headers={csvHeaders} 
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleBackClick} 
                  disabled={loading}
                  className="transition-all duration-100 ease-out"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmImport} 
                  disabled={loading || csvData.length === 0}
                  className="transition-all duration-100 ease-out"
                >
                  {loading ? (
                    <>
                      <span className="mr-2">Processing...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    </>
                  ) : (
                    'Confirm Import'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CsvImport;
