
import React from 'react';
import LogTable from './LogTable';
import { LogTableProps } from '@/types';

// Adapter to bridge prop type differences
const LogTableAdapter = ({
  entries,
  isLoading
}: LogTableProps) => {
  const handleExport = () => {
    // A stub function that would be implemented for the export functionality
    console.log("Export functionality would be implemented here");
  };

  return <LogTable data={entries} onExport={handleExport} />;
};

export default LogTableAdapter;
