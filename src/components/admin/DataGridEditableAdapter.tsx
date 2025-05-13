
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
  // Transform columns format if needed
  const transformedColumns = columns.map(col => ({
    field: col.field,
    headerName: col.headerName,
    type: col.type
  }));

  return (
    <DataGridEditable
      data={data}
      columns={transformedColumns}
      onRowUpdate={onRowUpdate}
      isLoading={isLoading}
    />
  );
};

export default DataGridEditableAdapter;
