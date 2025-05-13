
import React from 'react';
import { ValidationError } from '@/utils/csvValidation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, CheckCheck, AlertTriangle, Download } from 'lucide-react';

interface ValidationResultSummaryProps {
  validCount: number;
  invalidCount: number;
  errors?: ValidationError[];
  onDownloadErrors?: () => void;
}

const ValidationResultSummary: React.FC<ValidationResultSummaryProps> = ({
  validCount,
  invalidCount,
  errors = [],
  onDownloadErrors
}) => {
  if (validCount === 0 && invalidCount === 0) return null;
  
  return (
    <div className="mt-4 space-y-4">
      {validCount > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCheck className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Valid Rows: {validCount}</AlertTitle>
          <AlertDescription className="text-green-700">
            These rows passed validation and are ready to import.
          </AlertDescription>
        </Alert>
      )}
      
      {invalidCount > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <X className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">Invalid Rows: {invalidCount}</AlertTitle>
          <AlertDescription className="text-red-700">
            These rows failed validation and will not be imported.
          </AlertDescription>
          
          {errors.length > 0 && (
            <div className="mt-4">
              <details className="text-sm">
                <summary className="font-medium cursor-pointer">View Error Details</summary>
                <ScrollArea className="h-[200px] mt-2 p-2 border rounded bg-white">
                  <ul className="space-y-2">
                    {errors.map((error, index) => (
                      <li key={index} className="text-red-700">
                        <span className="font-medium">Row {error.row}</span> - {error.field}: {error.message}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </details>
              
              {onDownloadErrors && (
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={onDownloadErrors}
                  className="mt-2 text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Error Report
                </Button>
              )}
            </div>
          )}
        </Alert>
      )}
    </div>
  );
};

export default ValidationResultSummary;
