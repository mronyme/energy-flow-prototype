
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { piService } from '@/services/api';

type TestTagStatus = 'OK' | 'KO' | 'active' | 'inactive' | null | string;

interface TestTagButtonProps {
  tagName: string;
  status: TestTagStatus;
  onClick: () => Promise<void>;
  onTestComplete: (result: boolean) => void;
}

const TestTagButton: React.FC<TestTagButtonProps> = ({ 
  tagName, 
  status, 
  onClick,
  onTestComplete 
}) => {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    try {
      setLoading(true);
      
      // Call the provided click handler if any
      await onClick();
      
      // Test the tag connection
      const result = await piService.testTag(tagName);
      
      // Call the completion handler with the test result
      onTestComplete(result.success);
    } catch (error) {
      console.error('Error testing tag:', error);
      // Call the completion handler with failure
      onTestComplete(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      variant={status === 'OK' || status === 'active' ? "ghost" : "outline"} 
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1"
      aria-label={`Test connection for tag ${tagName}`}
    >
      {loading ? (
        <Activity className="h-4 w-4 animate-pulse" />
      ) : (
        <Activity className="h-4 w-4" />
      )}
      <span>Test</span>
    </Button>
  );
};

export default TestTagButton;
