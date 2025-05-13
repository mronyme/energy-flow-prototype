
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TestTagButtonProps {
  onClick: () => Promise<void>;
  status: 'OK' | 'KO' | 'active' | 'inactive' | null;
  tagName?: string; // Added tagName prop
  onTestComplete?: (result: boolean) => void; // Added onTestComplete prop
}

const TestTagButton: React.FC<TestTagButtonProps> = ({ onClick, status, tagName, onTestComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTest = async () => {
    setIsLoading(true);
    try {
      await onClick();
      // If onTestComplete is provided, call it with true/false based on status
      if (onTestComplete) {
        onTestComplete(status === 'OK' || status === 'active');
      }
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
      
      {status && (
        <Badge 
          variant="outline"
          className={cn(
            "px-2.5 py-0.5 font-medium",
            status === 'OK' && "bg-green-100 text-green-800",
            status === 'KO' && "bg-red-100 text-red-800",
            status === 'active' && "bg-blue-100 text-blue-800",
            status === 'inactive' && "bg-gray-100 text-gray-800"
          )}
        >
          {status}
        </Badge>
      )}
    </div>
  );
};

export default TestTagButton;
