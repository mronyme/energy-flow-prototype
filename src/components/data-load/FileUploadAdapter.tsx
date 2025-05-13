
import React from 'react';
import { FileUploadProps } from '@/types';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

// This adapter component matches the API expected by various pages
const FileUploadAdapter = ({
  onFileSelected,
  accept = ".csv",
  maxSize = 5 * 1024 * 1024  // 5MB default
}: FileUploadProps) => {
  const handleFileSelected = (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      if (file.size > maxSize) {
        console.error("File too large");
        return;
      }
      
      // For CSV files, use Papa Parse
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Call the callback with parsed data and file information
            onFileSelected(results.data, file);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
          }
        });
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxSize,
    onDrop: handleFileSelected
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        <Upload className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Drop the file here...'
            : 'Drag & drop a CSV file here, or click to select'}
        </p>
        <p className="text-xs text-gray-400">
          Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
        <Button type="button" variant="outline" size="sm">
          Select File
        </Button>
      </div>
    </div>
  );
};

export default FileUploadAdapter;
