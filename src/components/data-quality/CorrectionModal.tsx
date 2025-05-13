
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { dateUtils } from '../../utils/validation';
import { AnomalyType } from '@/types';

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
  
  // Reset state when modal opens or closes
  React.useEffect(() => {
    if (isOpen && anomaly) {
      setNewValue(anomaly.value !== null ? anomaly.value.toString() : '');
      setComment(anomaly.comment || '');
      setError(null);
    }
  }, [isOpen, anomaly]);
  
  const handleSave = async () => {
    if (!anomaly) return;
    
    // Validate input
    if (!newValue.trim()) {
      setError('Please enter a value');
      return;
    }
    
    const parsedValue = parseFloat(newValue);
    
    if (isNaN(parsedValue)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (parsedValue < 0) {
      setError('Value cannot be negative');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a comment explaining the correction');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // This will update both the reading and anomaly comment
      await onSave(anomaly.readingId, parsedValue, comment, anomaly.id);
      onClose();
    } catch (err) {
      setError('Failed to save correction');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!anomaly) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Correct Anomaly</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
              <p className="font-medium">{anomaly.type}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="current-value" className="text-sm font-medium">
                Current Value:
              </label>
              <span className="text-sm">{anomaly.value !== null ? anomaly.value : 'Missing'}</span>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="new-value" className="text-sm font-medium">
                New Value:
              </label>
              <Input
                id="new-value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter corrected value"
                type="number"
                min="0"
                step="0.001"
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
              />
              <p className="text-xs text-gray-500">
                Comments are important for audit trail and providing context for other users.
              </p>
            </div>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="transition-all duration-100 ease-out"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="transition-all duration-100 ease-out"
          >
            {isSubmitting ? 'Saving...' : 'Save Correction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CorrectionModal;
