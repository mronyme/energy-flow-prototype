
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogTable } from '@/components/data-quality/LogTable';
import { DatePicker } from '@/components/ui/date-picker';
import { journalService } from '@/services/api';
import { ImportLog } from '@/types';
import { toast } from 'sonner';
import { dateUtils } from '@/utils/validation';
import { Download } from 'lucide-react';

const Journal: React.FC = () => {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // Last 30 days
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [exporting, setExporting] = useState(false);
  
  useEffect(() => {
    loadLogs();
  }, []);
  
  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await journalService.getJournalEntries(100);
      setLogs(data);
    } catch (error) {
      console.error('Error loading import logs:', error);
      toast.error('Failed to load import logs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilter = async () => {
    try {
      setLoading(true);
      
      // Format dates for the API
      const formattedStartDate = dateUtils.format(startDate);
      const formattedEndDate = dateUtils.format(endDate);
      
      const data = await journalService.getJournalEntriesByDateRange(formattedStartDate, formattedEndDate);
      setLogs(data);
    } catch (error) {
      console.error('Error filtering logs:', error);
      toast.error('Failed to filter logs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Since we don't have an actual export function, let's simulate it
      // In a real implementation, this would call journalService.exportCsv
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a CSV from the data
      const headers = ['Date', 'User', 'Filename', 'Rows OK', 'Rows Error'];
      const rows = logs.map(log => [
        new Date(log.ts).toLocaleString(),
        log.user_email,
        log.file_name,
        log.rows_ok.toString(),
        log.rows_err.toString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `import-journal-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Journal exported to CSV');
    } catch (error) {
      console.error('Error exporting journal:', error);
      toast.error('Failed to export journal');
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Import Journal</h1>
      
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onSelect={setStartDate}
              label="Start date"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <DatePicker
              id="end-date"
              selected={endDate}
              onSelect={setEndDate}
              label="End date"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <Button onClick={handleFilter} disabled={loading || exporting} className="mb-2">
              {loading ? 'Loading...' : 'Apply Filter'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleExport} 
              disabled={loading || exporting || logs.length === 0}
              className="mb-2"
            >
              {exporting ? 'Exporting...' : (
                <>
                  <Download size={16} className="mr-1" /> Export CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      
      <LogTable logs={logs} loading={loading} />
    </div>
  );
};

export default Journal;
