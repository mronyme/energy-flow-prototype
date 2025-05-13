
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GridRow {
  id: string;
  name: string;
  value: number;
  unit: string;
}

interface DataGridEditableProps {
  data: GridRow[];
  onSave: (id: string, value: number) => Promise<void>;
}

const DataGridEditable: React.FC<DataGridEditableProps> = ({ data, onSave }) => {
  const [editState, setEditState] = useState<{
    [key: string]: { value: string; editing: boolean; saving: boolean; error: string | null; justSaved: boolean }
  }>({});
  
  const startEditing = (row: GridRow) => {
    setEditState(prev => ({
      ...prev,
      [row.id]: { 
        value: row.value.toString(), 
        editing: true, 
        saving: false,
        error: null,
        justSaved: false
      }
    }));
  };
  
  const handleInputChange = (id: string, value: string) => {
    setEditState(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        value,
        error: validateInput(value),
        justSaved: false
      }
    }));
  };
  
  const validateInput = (value: string): string | null => {
    if (!value.trim()) {
      return 'Value is required';
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Must be a number';
    }
    
    if (num < 0) {
      return 'Must be non-negative';
    }
    
    return null;
  };
  
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      await saveValue(id);
    } else if (e.key === 'Escape') {
      cancelEditing(id);
    }
  };
  
  const cancelEditing = (id: string) => {
    setEditState(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };
  
  const saveValue = async (id: string) => {
    const state = editState[id];
    if (!state || state.error) return;
    
    const newValue = parseFloat(state.value);
    
    setEditState(prev => ({
      ...prev,
      [id]: { ...prev[id], saving: true, error: null }
    }));
    
    try {
      await onSave(id, newValue);
      
      // Show "Saved" badge temporarily
      setEditState(prev => ({
        ...prev,
        [id]: { 
          ...prev[id], 
          editing: false,
          saving: false,
          justSaved: true 
        }
      }));
      
      // Remove the "Saved" badge after 2 seconds
      setTimeout(() => {
        setEditState(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }, 2000);
      
    } catch (error) {
      setEditState(prev => ({
        ...prev,
        [id]: { 
          ...prev[id], 
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
            <TableHead>Emission Factor</TableHead>
            <TableHead className="w-[180px]">Value</TableHead>
            <TableHead>Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const isEditing = editState[row.id]?.editing;
            const isSaving = editState[row.id]?.saving;
            const error = editState[row.id]?.error;
            const justSaved = editState[row.id]?.justSaved;
            
            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <div className="relative">
                      <div className="flex items-center">
                        <Input
                          value={editState[row.id].value}
                          onChange={(e) => handleInputChange(row.id, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, row.id)}
                          onBlur={() => !isSaving && saveValue(row.id)}
                          disabled={isSaving}
                          className={error ? 'border-red-500 pr-8' : 'pr-8'}
                          autoFocus
                        />
                        {!error && !isSaving && (
                          <button
                            onClick={() => saveValue(row.id)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                          >
                            <Check size={16} />
                          </button>
                        )}
                      </div>
                      {error && (
                        <p className="text-xs text-red-500 mt-1">
                          {error}
                        </p>
                      )}
                    </div>
                  ) : justSaved ? (
                    <div className="flex items-center gap-2">
                      <div className="p-2">{row.value}</div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Saved</Badge>
                    </div>
                  ) : (
                    <div 
                      className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={() => startEditing(row)}
                    >
                      {row.value}
                    </div>
                  )}
                </TableCell>
                <TableCell>{row.unit}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataGridEditable;
