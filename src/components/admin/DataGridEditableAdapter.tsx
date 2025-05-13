
import React from 'react';
import DataGridEditable from './DataGridEditable';
import { DataGridEditableProps } from '@/types';

// This is an adapter for DataGridEditable that matches the API expected by EmissionFactors.tsx
const DataGridEditableAdapter = ({
  data,
  columns,
  onRowUpdate,
  isLoading = false
}: DataGridEditableProps) => {
  return (
    <DataGridEditable
      data={data}
      columns={columns}
      onRowUpdate={onRowUpdate}
      isLoading={isLoading}
    />
  );
};

export default DataGridEditableAdapter;
