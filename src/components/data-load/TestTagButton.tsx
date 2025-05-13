
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TestTagButtonProps {
  onClick: () => Promise<void>;
  status: 'OK' | 'KO' | 'active' | 'inactive' | null;
}

const TestTagButton: React.FC<TestTagButtonProps> = ({ onClick, status }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTest = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTest}
        disabled={isLoading}
        className="transition-all duration-100 ease-out"
      >
        {isLoading ? 'Testing...' : 'Test Tag'}
      </Button>
      
      {status === 'OK' && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          OK
        </span>
      )}
      
      {status === 'KO' && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          KO
        </span>
      )}
      
      {(status === 'active' || status === 'inactive') && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      )}
    </div>
  );
};

export default TestTagButton;
