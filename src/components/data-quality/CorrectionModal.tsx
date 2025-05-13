
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dateUtils, toastMessages } from '../../utils/validation';
import { AnomalyType } from '@/types';
import AnomalyBadge from './AnomalyBadge';
import { useFocusTrap } from '@/hooks/use-focus-trap';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomaly: {
    id: string;
    readingId: string;
    value: number | null;
    timestamp: string;
    type: AnomalyType;
    delta: number | null;
    comment: string | null;
    siteName: string;
    meterType: string;
  } | null;
  onSave: (readingId: string, newValue: number, comment: string, anomalyId: string) => Promise<void>;
}

const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  anomaly,
  onSave
}) => {
  const [newValue, setNewValue] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const valueInputRef = useRef<HTMLInputElement>(null);
  
  // Fix: Use the focus trap hook correctly - first parameter is boolean, second is escape handler
  const modalContentRef = useFocusTrap(isOpen, onClose);
  
  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen && anomaly) {
      setNewValue(anomaly.value !== null ? anomaly.value.toString() : '');
      setComment(anomaly.comment || '');
      setError(null);
      
      // Focus on the value input when modal opens
      setTimeout(() => {
        valueInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, anomaly]);
  
  const handleSave = async () => {
    if (!anomaly) return;
    
    // Validate input
    if (!newValue.trim()) {
      setError('Please enter a value');
      valueInputRef.current?.focus();
      return;
    }
    
    const parsedValue = parseFloat(newValue);
    
    if (isNaN(parsedValue)) {
      setError('Please enter a valid number');
      valueInputRef.current?.focus();
      return;
    }
    
    if (parsedValue < 0) {
      setError('Value cannot be negative');
      valueInputRef.current?.focus();
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a comment explaining the correction');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // IF-06: This updates both the reading and anomaly comment
      await onSave(anomaly.readingId, parsedValue, comment, anomaly.id);
      onClose();
      
      // Announce success for screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('role', 'status');
      announcement.classList.add('sr-only');
      announcement.textContent = toastMessages.correctionSaved();
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    } catch (err) {
      setError('Failed to save correction');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!anomaly) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        onKeyDown={handleKeyDown}
        ref={modalContentRef}
        className="sm:max-w-md"
        aria-labelledby="correction-dialog-title"
        aria-describedby="correction-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="correction-dialog-title">Correct Anomaly</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4" id="correction-dialog-description">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Site:</p>
              <p className="font-medium">{anomaly.siteName}</p>
            </div>
            <div>
              <p className="text-gray-500">Meter Type:</p>
              <p className="font-medium">{anomaly.meterType}</p>
            </div>
            <div>
              <p className="text-gray-500">Date:</p>
              <p className="font-medium">{dateUtils.formatDisplay(anomaly.timestamp)}</p>
            </div>
            <div>
              <p className="text-gray-500">Anomaly Type:</p>
              <p className="font-medium">
                <AnomalyBadge type={anomaly.type} delta={anomaly.delta} />
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="current-value" className="text-sm font-medium">
                Current Value:
              </label>
              <span id="current-value" className="text-sm">{anomaly.value !== null ? anomaly.value : 'Missing'}</span>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="new-value" className="text-sm font-medium">
                New Value:
              </label>
              <Input
                id="new-value"
                ref={valueInputRef}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter corrected value"
                type="number"
                min="0"
                step="0.001"
                aria-invalid={!!error && error.includes('value')}
                aria-describedby={error && error.includes('value') ? "value-error" : undefined}
                className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="comment" className="text-sm font-medium">
                Correction Comment:
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain why this value was corrected"
                rows={3}
                aria-invalid={!!error && error.includes('comment')}
                aria-describedby={error && error.includes('comment') ? "comment-error" : undefined}
                className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <p className="text-xs text-gray-500">
                Comments are important for audit trail and providing context for other users.
              </p>
              <p className="text-xs text-blue-600">
                <kbd className="bg-gray-100 border border-gray-200 rounded px-1">Ctrl</kbd> +
                <kbd className="bg-gray-100 border border-gray-200 rounded px-1">Enter</kbd> to save
              </p>
            </div>
          </div>
          
          {error && (
            <div 
              className="text-sm text-red-500 p-2 bg-red-50 rounded"
              id={error.includes('value') ? "value-error" : "comment-error"}
              aria-live="assertive"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="transition-all duration-100 ease-out focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="transition-all duration-100 ease-out focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Correction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CorrectionModal;
