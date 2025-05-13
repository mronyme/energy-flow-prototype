import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { importLogService, readingService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { ImportLog } from '@/types';

const CsvImport = () => {
  const [rawData, setRawData] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [filename, setFilename] = useState('');
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setFilename(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        handleFileUpload(results.data, file);
      },
      error: (error) => {
        toast.error(`CSV Parsing Error: ${error.message}`);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

  const createImportLog = async (results: any, filename: string) => {
    try {
      // Create new log entry with all required fields
      const log: Omit<ImportLog, 'id'> = {
        user_email: user?.email || 'anonymous',
        rows_ok: results.data.length - results.errors.length,
        rows_err: results.errors.length,
        file_name: filename,
        ts: new Date().toISOString() // Provide timestamp
      };
      
      await importLogService.createImportLog(log as ImportLog);
      toast.success('Import logged successfully');
    } catch (error) {
      console.error('Error logging import:', error);
      toast.error('Failed to log import');
    }
  };

  const handleFileUpload = (parsedData: any[], file: File) => {
    setRawData(parsedData);
    setStep(2);
    // Pass the actual file name to createImportLog
    createImportLog({ data: parsedData, errors: [] }, file.name);
  };

  const handleSaveData = async () => {
    try {
      const readings = rawData.map(row => ({
        meter_id: row.meter_id,
        ts: row.ts,
        value: parseFloat(row.value)
      }));

      const result = await readingService.bulkSaveReadings(readings);

      if (result.success) {
        toast.success(`${result.inserted} readings saved successfully`);
      } else {
        toast.error('Failed to save readings');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Import Readings from CSV</h1>

      {step === 1 && (
        <div {...getRootProps()} className="border-2 border-dashed rounded-md p-8 text-center">
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <>
                <p>Drag 'n' drop some files here, or click to select files</p>
                <p>(Only *.csv files will be accepted)</p>
              </>
          }
        </div>
      )}

      {step === 2 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Review Data</h2>
          <p>File: {filename}</p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr>
                  {Object.keys(rawData[0]).map(key => (
                    <th key={key} className="border border-gray-200 px-4 py-2">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, index2) => (
                      <td key={index2} className="border border-gray-200 px-4 py-2">{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={handleSaveData} className="mt-4">Save Readings</Button>
        </div>
      )}
    </div>
  );
};

export default CsvImport;
