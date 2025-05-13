
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { importLogService } from '../../services/api';
import { DatePicker } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import LogTable from '../../components/data-quality/LogTable';
import { toast } from 'sonner';
import { dateUtils } from '../../utils/validation';
import { ImportLog } from '../../types';

const Journal = () => {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  useEffect(() => {
    loadLogs();
  }, [startDate, endDate]);
  
  const loadLogs = async () => {
    setLoading(true);
    try {
      const logsData = await importLogService.getByDateRange(
        dateUtils.format(startDate),
        dateUtils.format(endDate)
      );
      
      // Sort logs by date (newest first)
      const sortedLogs = [...logsData].sort((a, b) => 
        new Date(b.ts).getTime() - new Date(a.ts).getTime()
      );
      
      setLogs(sortedLogs);
    } catch (error) {
      console.error('Error fetching import logs:', error);
      toast.error('Failed to load import logs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = () => {
    try {
      // Create CSV header
      const headers = ['Date', 'User', 'File Name', 'Rows OK', 'Rows Error', 'Success Rate'];
      
      // Transform logs data to CSV rows
      const rows = logs.map(log => {
        const totalRows = log.rows_ok + log.rows_err;
        const successRate = totalRows > 0 
          ? ((log.rows_ok / totalRows) * 100).toFixed(1) + '%' 
          : '0%';
        
        return [
          dateUtils.formatDateTime(log.ts),
          log.user_email,
          log.file_name,
          log.rows_ok.toString(),
          log.rows_err.toString(),
          successRate
        ];
      });
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `import-journal-${dateUtils.format(new Date())}.csv`);
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      toast.success('Export complete');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Import Journal</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                selected={startDate}
                onSelect={setStartDate}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                selected={endDate}
                onSelect={setEndDate}
                disabled={loading}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <LogTable data={logs} onExport={handleExport} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Journal;
