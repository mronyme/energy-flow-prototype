
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GridRow {
  id: string;
  [key: string]: any;
}

export interface DataGridEditableProps {
  data: GridRow[];
  columns: { field: string; headerName: string; type: "number" | "text" }[];
  onRowUpdate: (id: string, field: string, value: any) => Promise<void>;
  isLoading?: boolean;
}

const DataGridEditable: React.FC<DataGridEditableProps> = ({ 
  data, 
  columns, 
  onRowUpdate,
  isLoading = false
}) => {
  const [editState, setEditState] = useState<{
    [key: string]: { 
      field: string; 
      value: string; 
      editing: boolean; 
      saving: boolean; 
      error: string | null; 
      justSaved: boolean 
    }
  }>({});
  
  const startEditing = (row: GridRow, field: string) => {
    const key = `${row.id}-${field}`;
    setEditState(prev => ({
      ...prev,
      [key]: { 
        field,
        value: String(row[field]), 
        editing: true, 
        saving: false,
        error: null,
        justSaved: false
      }
    }));
  };
  
  const handleInputChange = (key: string, value: string) => {
    setEditState(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        value,
        error: validateInput(prev[key].field, value),
        justSaved: false
      }
    }));
  };
  
  const validateInput = (field: string, value: string): string | null => {
    const column = columns.find(col => col.field === field);
    if (!column) return null;
    
    if (!value.trim()) {
      return 'Value is required';
    }
    
    if (column.type === 'number') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return 'Must be a number';
      }
      
      if (num < 0) {
        return 'Must be non-negative';
      }
    }
    
    return null;
  };
  
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, id: string, key: string, field: string) => {
    if (e.key === 'Enter') {
      await saveValue(id, key, field);
    } else if (e.key === 'Escape') {
      cancelEditing(key);
    }
  };
  
  const cancelEditing = (key: string) => {
    setEditState(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };
  
  const saveValue = async (id: string, key: string, field: string) => {
    const state = editState[key];
    if (!state || state.error) return;
    
    let newValue: any = state.value;
    const column = columns.find(col => col.field === field);
    
    // Convert value based on column type
    if (column?.type === 'number') {
      newValue = parseFloat(state.value);
    }
    
    setEditState(prev => ({
      ...prev,
      [key]: { ...prev[key], saving: true, error: null }
    }));
    
    try {
      await onRowUpdate(id, field, newValue);
      
      // Show "Saved" badge temporarily
      setEditState(prev => ({
        ...prev,
        [key]: { 
          ...prev[key], 
          editing: false,
          saving: false,
          justSaved: true 
        }
      }));
      
      // Remove the "Saved" badge after 2 seconds
      setTimeout(() => {
        setEditState(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 2000);
      
    } catch (error) {
      setEditState(prev => ({
        ...prev,
        [key]: { 
          ...prev[key], 
          saving: false, 
          error: 'Failed to save',
          justSaved: false
        }
      }));
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-dark/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.field}>{column.headerName}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                const key = `${row.id}-${column.field}`;
                const isEditing = editState[key]?.editing;
                const isSaving = editState[key]?.saving;
                const error = editState[key]?.error;
                const justSaved = editState[key]?.justSaved;
                const isEditable = column.type === 'number'; // Only number fields are editable
                
                return (
                  <TableCell key={column.field}>
                    {isEditing ? (
                      <div className="relative">
                        <div className="flex items-center">
                          <Input
                            value={editState[key].value}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, row.id, key, column.field)}
                            onBlur={() => !isSaving && saveValue(row.id, key, column.field)}
                            disabled={isSaving}
                            className={error ? 'border-red-500 pr-8' : 'pr-8'}
                            autoFocus
                          />
                          {!error && !isSaving && (
                            <button
                              onClick={() => saveValue(row.id, key, column.field)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                              aria-label="Save changes"
                            >
                              <Check size={16} />
                            </button>
                          )}
                        </div>
                        {error && (
                          <p className="text-xs text-red-500 mt-1">{error}</p>
                        )}
                      </div>
                    ) : justSaved ? (
                      <div className="flex items-center gap-2">
                        <div className="p-2">{row[column.field]}</div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Saved</Badge>
                      </div>
                    ) : (
                      <div 
                        className={isEditable ? "p-2 hover:bg-gray-100 rounded cursor-pointer" : "p-2"}
                        onClick={isEditable ? () => startEditing(row, column.field) : undefined}
                      >
                        {row[column.field]}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataGridEditable;
