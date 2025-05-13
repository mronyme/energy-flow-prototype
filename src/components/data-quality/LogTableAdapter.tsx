
import React from 'react';
import LogTable from './LogTable';
import { LogTableProps } from '@/types';

// Adapter to bridge prop type differences
const LogTableAdapter = ({
  entries,
  isLoading
}: LogTableProps) => {
  return <LogTable logs={entries} loading={isLoading} />;
};

export default LogTableAdapter;
