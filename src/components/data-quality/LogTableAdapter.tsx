
import React from 'react';
import LogTable from './LogTable';
import { LogTableProps, ImportLog } from '@/types';

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
    // A stub function that would be implemented for the export functionality
    console.log("Export functionality would be implemented here");
  };

  return <LogTable data={logEntries} onExport={handleExport} entries={logEntries} />;
};

export default LogTableAdapter;
