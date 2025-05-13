
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AnomalyType, AnomalyData } from '@/types';
import { dateUtils } from '@/utils/validation';
import { toast } from 'sonner';

interface BulkCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomalies: AnomalyData[];
  onSave: (readingIds: string[], action: string, value: number | null, comment: string) => Promise<void>;
}

const BulkCorrectionModal: React.FC<BulkCorrectionModalProps> = ({
  isOpen,
  onClose,
  anomalies,
  onSave
}) => {
  const [action, setAction] = useState<string>('replace');
  const [value, setValue] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setAction('replace');
      setValue('');
      setComment('');
      setError(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setError(null);
    
    // Comment is always required
    if (!comment.trim()) {
      setError('Please enter a comment explaining the correction');
      return;
    }
    
    // Value is required for replace action
    if (action === 'replace' && (!value.trim() || isNaN(parseFloat(value)))) {
      setError('Please enter a valid number for the replacement value');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const readingIds = anomalies.map(a => a.readingId);
      const numericValue = action === 'replace' ? parseFloat(value) : null;
      
      await onSave(readingIds, action, numericValue, comment);
      
      toast.success(`Successfully corrected ${anomalies.length} anomalies`);
      onClose();
    } catch (err) {
      console.error('Error during bulk correction:', err);
      setError('Failed to save corrections');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group anomalies by type
  const anomalyCounts = anomalies.reduce((acc, anomaly) => {
    acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Correction</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Selected Anomalies:</h3>
              <ul className="mt-1 text-sm text-gray-600">
                {Object.entries(anomalyCounts).map(([type, count]) => (
                  <li key={type}>
                    <span className="font-medium">{count}</span> {type.toLowerCase()} anomalies
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-gray-600">
                Time range: {dateUtils.formatDisplay(anomalies[0]?.timestamp || '')} - {dateUtils.formatDisplay(anomalies[anomalies.length - 1]?.timestamp || '')}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="action">Correction Action</Label>
              <Select
                value={action}
                onValueChange={setAction}
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replace">Replace with value</SelectItem>
                  <SelectItem value="interpolate">Interpolate from surrounding values</SelectItem>
                  <SelectItem value="discard">Discard (mark as invalid)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {action === 'replace' && (
              <div className="space-y-2">
                <Label htmlFor="value">Replacement Value</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter correction value"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="comment">Correction Comment</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Explain why these values were corrected"
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Comments are important for audit trail and providing context for other users.
              </p>
            </div>
            
            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 rounded text-red-600">
                {error}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Corrections'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCorrectionModal;
