
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { piTagService } from '../../services/api';

interface TestTagButtonProps {
  tagName: string;
}

const TestTagButton: React.FC<TestTagButtonProps> = ({ tagName }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleTest = async () => {
    setStatus('loading');
    
    try {
      const result = await piTagService.testTag(tagName);
      setStatus(result ? 'success' : 'error');
    } catch (error) {
      setStatus('error');
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTest}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Testing...' : 'Test Tag'}
      </Button>
      
      {status === 'success' && (
        <span className="alert-badge-success">OK</span>
      )}
      
      {status === 'error' && (
        <span className="alert-badge-error">KO</span>
      )}
    </div>
  );
};

export default TestTagButton;
