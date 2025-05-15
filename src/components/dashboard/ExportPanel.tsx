
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Download, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  dateRange?: DateRange;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ isOpen, onClose, data, dateRange }) => {
  const [format, setFormat] = useState<string>("csv");
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleExport = () => {
    setExportStatus('loading');
    
    // Simulate export process
    setTimeout(() => {
      try {
        const filename = `energy_data_${new Date().toISOString().split('T')[0]}`;
        
        if (format === 'csv') {
          // Convert data to CSV
          const headers = data.length > 0 ? Object.keys(data[0]).join(',') : '';
          const rows = data.map(row => Object.values(row).join(',')).join('\n');
          const csv = `${headers}\n${rows}`;
          
          // Create download link
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } 
        else if (format === 'json') {
          // Convert data to JSON
          const json = JSON.stringify(data, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
        
        setExportStatus('success');
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setExportStatus('idle');
        }, 2000);
      } catch (error) {
        console.error("Export error:", error);
        setExportStatus('error');
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setExportStatus('idle');
        }, 2000);
      }
    }, 1000);
  };
  
  const renderStatusButton = () => {
    switch (exportStatus) {
      case 'loading':
        return (
          <Button disabled>
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            Exporting...
          </Button>
        );
      case 'success':
        return (
          <Button variant="default" className="bg-green-600">
            <Check className="mr-2 h-4 w-4" />
            Download Complete
          </Button>
        );
      case 'error':
        return (
          <Button variant="destructive">
            <X className="mr-2 h-4 w-4" />
            Export Failed
          </Button>
        );
      default:
        return (
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        );
    }
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="date-range">Date Range</Label>
            <div id="date-range" className="mt-1 p-2 border rounded bg-gray-50 text-sm">
              {dateRange?.from && dateRange?.to ? (
                <>From <strong>{formatDate(dateRange.from)}</strong> to <strong>{formatDate(dateRange.to)}</strong></>
              ) : (
                <>All available data</>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="export-format">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="export-format" className="mt-1">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Data Preview</Label>
            <div className="mt-1 border rounded overflow-hidden">
              <div className="max-h-32 overflow-y-auto p-2 text-xs font-mono bg-gray-50">
                {data.length > 0 ? (
                  <pre>{JSON.stringify(data[0], null, 2)}</pre>
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{data.length} records total</p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {renderStatusButton()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPanel;
