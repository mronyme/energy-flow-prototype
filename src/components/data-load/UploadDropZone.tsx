
import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface UploadDropZoneProps {
  onFileSelect: (file: File) => void;
  onFileProcessed: (parsedData: any[], file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
}

const UploadDropZone: React.FC<UploadDropZoneProps> = ({
  onFileSelect,
  onFileProcessed,
  accept = '.csv',
  maxSize = 5 // Default 5MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const acceptedExts = accept.split(',').map(ext => 
      ext.trim().replace('.', '').toLowerCase()
    );
    
    if (fileExt && !acceptedExts.includes(fileExt)) {
      setError(`File type not supported. Please upload a ${accept} file.`);
      return false;
    }
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSize}MB.`);
      return false;
    }
    
    return true;
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (validateFile(file)) {
        onFileSelect(file);
        
        // Read and parse CSV
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const csvData = event.target.result as string;
            const parsedData = parseCSV(csvData);
            onFileProcessed(parsedData, file);
          }
        };
        
        reader.readAsText(file);
      }
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (validateFile(file)) {
        onFileSelect(file);
        
        // Read and parse CSV
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const csvData = event.target.result as string;
            const parsedData = parseCSV(csvData);
            onFileProcessed(parsedData, file);
          }
        };
        
        reader.readAsText(file);
      }
    }
  };
  
  const parseCSV = (csvData: string): any[] => {
    // Simple CSV parsing logic
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const obj: Record<string, string> = {};
      const currentLine = lines[i].split(',');
      
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j]?.trim() || '';
      }
      
      result.push(obj);
    }
    
    return result;
  };
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8
        transition-all duration-200 ease-out
        flex flex-col items-center justify-center
        cursor-pointer
        ${isDragging 
          ? 'border-primary bg-blue-50' 
          : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={accept}
        className="hidden"
      />
      
      <div className="text-center">
        <Upload 
          className={`mx-auto h-12 w-12 mb-4 ${error ? 'text-red-500' : 'text-primary'}`} 
        />
        
        <h3 className="text-lg font-medium mb-2">
          {error ? 'Error' : 'Upload File'}
        </h3>
        
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <p className="text-gray-500 mb-2">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Accepted formats: {accept} (Max size: {maxSize}MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadDropZone;
