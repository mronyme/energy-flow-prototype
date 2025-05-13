
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  buttonText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  accept = '.csv', 
  maxSizeMB = 5, 
  buttonText = 'Select File',
  variant = 'outline',
  className = '',
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    // Reset error state
    setError(null);
    
    // Pass the file to the parent component
    onFileSelect(file);
    
    // Reset input value so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input 
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        className="sr-only"
        aria-label="Upload file"
        disabled={disabled}
      />
      <Button 
        onClick={handleButtonClick} 
        variant={variant}
        className={className}
        disabled={disabled}
        type="button"
      >
        {buttonText}
      </Button>
      {error && (
        <p className="text-sm text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
