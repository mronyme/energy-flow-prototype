
import React from 'react';
import FileUpload from './FileUpload';
import { FileUploadProps } from '@/types';

// This adapter component matches the API expected by various pages
const FileUploadAdapter = ({
  onFileSelected,
  accept = ".csv",
  maxSize = 5 * 1024 * 1024  // 5MB default
}: FileUploadProps) => {
  // Convert the function signature to match what's expected
  const handleFileSelected = (parsedData: any[], file: File) => {
    return onFileSelected(parsedData, file);
  };

  return (
    <FileUpload 
      onFileSelected={handleFileSelected}
      accept={accept}
      maxSize={maxSize} 
    />
  );
};

export default FileUploadAdapter;
