
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { piService } from '@/services/api';
import { toast } from 'sonner';

interface TestTagButtonProps {
  tagName: string;
  status: 'OK' | 'KO' | 'active' | 'inactive';
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
      toast.info(`Testing connection for ${tagName}...`);
      
      // Call the provided click handler if any
      await onClick();
      
      // Test the tag connection
      const result = await piService.testTag(tagName);
      
      // Call the completion handler with the test result
      onTestComplete(result.success);
      
      if (result.success) {
        toast.success(`Connection to ${tagName} successful`);
      } else {
        toast.error(`Connection to ${tagName} failed`);
      }
    } catch (error) {
      console.error('Error testing tag:', error);
      // Call the completion handler with failure
      onTestComplete(false);
      toast.error(`Error testing ${tagName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Determine if the tag is active based on status
  const isActive = status === 'OK' || status === 'active';
  
  return (
    <Button
      variant={isActive ? "ghost" : "outline"} 
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
