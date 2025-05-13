
import React from 'react';
import DataGridEditable from './DataGridEditable';

// Define the DataGridEditableProps interface to match what DataGridEditable expects
interface DataGridEditableProps {
  data: any[];
  columns: { field: string; headerName: string; type: "number" | "text" }[];
  onRowUpdate: (id: string, field: string, value: any) => Promise<void>;
  isLoading?: boolean;
}

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
