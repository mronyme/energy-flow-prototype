
import React from 'react';
import LogTable from './LogTable';
import { ImportLog } from '@/types';
import { downloadCSV } from '@/utils/csvUtils';
import { format } from 'date-fns';

// Adapter to bridge prop type differences
const LogTableAdapter = ({
  entries,
  logs,
  isLoading,
  loading
}: {
  entries?: ImportLog[];
  logs?: ImportLog[];
  isLoading?: boolean;
  loading?: boolean;
}) => {
  // Use either entries or logs, with entries taking precedence
  const logEntries = entries || logs || [];
  const isDataLoading = isLoading || loading || false;
  
  const handleExport = () => {
    // Format the data for CSV export
    const exportData = logEntries.map(log => ({
      Date: format(new Date(log.ts), 'yyyy-MM-dd HH:mm:ss'),
      User: log.user_email,
      FileName: log.file_name,
      RowsOK: log.rows_ok,
      RowsError: log.rows_err,
      SuccessRate: `${((log.rows_ok / (log.rows_ok + log.rows_err)) * 100).toFixed(1)}%`
    }));
    
    // Generate a filename with current date
    const filename = `import-journal-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    // Download the CSV
    downloadCSV(exportData, filename);
  };

  return <LogTable data={logEntries} onExport={handleExport} />;
};

export default LogTableAdapter;
