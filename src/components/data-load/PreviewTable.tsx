
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidationError {
  row: number;
  errors: string[];
}

interface PreviewTableProps {
  data: Array<Record<string, any>>;
  headers?: string[]; // Make headers optional to match usage in CsvImport
  validationErrors?: ValidationError[];
}

const PreviewTable: React.FC<PreviewTableProps> = ({
  data,
  headers = Object.keys(data[0] || {}), // Default to keys from first row if not provided
  validationErrors = []
}) => {
  const getRowErrorMessages = (rowIndex: number): string[] => {
    const error = validationErrors.find(e => e.row === rowIndex);
    return error ? error.errors : [];
  };
  
  const hasRowError = (rowIndex: number): boolean => {
    return validationErrors.some(e => e.row === rowIndex);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Status</TableHead>
            <TableHead className="w-[60px]">Row</TableHead>
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow 
              key={rowIndex}
              className={hasRowError(rowIndex) ? 'bg-red-50' : ''}
            >
              <TableCell>
                {hasRowError(rowIndex) ? (
                  <div className="flex items-center text-red-500">
                    <AlertCircle size={16} className="mr-1" />
                  </div>
                ) : (
                  <div className="flex items-center text-green-500">
                    <CheckCircle size={16} className="mr-1" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">{rowIndex + 1}</TableCell>
              {headers.map((header, index) => (
                <TableCell key={index}>
                  {row[header] !== undefined ? String(row[header]) : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {validationErrors.length > 0 && (
        <div className="bg-red-50 p-3 border-t border-red-100 text-sm">
          <h4 className="font-medium text-red-800 mb-1">Validation Errors:</h4>
          <ul className="list-disc pl-5 text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>
                Row {error.row + 1}: {error.errors.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PreviewTable;
