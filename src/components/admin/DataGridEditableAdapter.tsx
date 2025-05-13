
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
  // Convert the onRowUpdate function from (id, field, value) to (id, value)
  // by capturing the field and using a curried function
  const handleColumnUpdate = (id: string, value: number) => {
    // Assuming we're always updating the "value" field for emission factors
    return onRowUpdate(id, "value", value);
  };

  return (
    <DataGridEditable
      data={data}
      columns={columns}
      onRowUpdate={handleColumnUpdate}
    />
  );
};

export default DataGridEditableAdapter;
